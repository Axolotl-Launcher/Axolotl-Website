import { createHash } from 'node:crypto'
import { existsSync } from 'node:fs'
import { mkdir, readdir, unlink, writeFile } from 'node:fs/promises'
import { dirname, join, relative } from 'node:path'

import { setTimeout as sleep } from 'node:timers/promises'

import feishuConfig from '../../feishu.config'
import {
  LOCALE_DIRECTORIES,
  SITE_LOCALES,
  type FeishuGroup,
  type FeishuManifest,
  type FeishuManifestDoc,
  type FeishuSyncReport,
  type SiteLocale,
} from '../../shared/types/feishu'
import { downloadImages } from './assets'
import { FeishuClient, FeishuError, type FeishuBlock } from './client'
import { blocksToMarkdown, convertFeishuMarkdown, descriptionFromMarkdown, extractImageTokens } from './convert'
import { sortManifestDocs, writeManifest } from './manifest'

interface SyncOptions {
  dryRun: boolean
  strict: boolean
  report: boolean
  locale?: SiteLocale
  slug?: string
}

interface ResolvedDocument {
  config: (typeof feishuConfig.docs)[number]
  locale: SiteLocale
  node: { node_token: string; obj_token: string; obj_type: string; title: string; obj_edit_time?: string }
  route: string
}

const options = parseArgs(process.argv.slice(2))
loadEnv()

const errors: string[] = []
const warnings: string[] = []
const writtenFiles = new Set<string>()

main().catch((error) => {
  console.error(error instanceof Error ? (error.stack ?? error.message) : error)
  process.exit(1)
})

async function main() {
  validateConfig()

  const appId = process.env.FEISHU_APP_ID?.trim()
  const appSecret = process.env.FEISHU_APP_SECRET?.trim()
  const configured = feishuConfig.docs.some((doc) => SITE_LOCALES.some((locale) => Boolean(doc.nodes[locale])))

  if (!appId || !appSecret) {
    if (!configured) {
      console.log(
        'No Feishu wiki nodes are configured yet. Fill feishu.config.ts and set FEISHU_APP_ID / FEISHU_APP_SECRET.',
      )
      process.exit(0)
    }
    console.error('FEISHU_APP_ID and FEISHU_APP_SECRET are required to sync the knowledge base.')
    process.exit(1)
  }

  const client = new FeishuClient({
    appId,
    appSecret,
    baseUrl: process.env.FEISHU_API_BASE?.trim() || undefined,
  })
  const webBase = (process.env.FEISHU_WEB_BASE?.trim() || feishuConfig.webBase || '').replace(/\/$/, '')

  const resolved = await resolveDocuments(client)
  const linkMap = new Map<string, string>()
  for (const document of resolved) {
    linkMap.set(document.node.node_token, document.route)
    linkMap.set(document.node.obj_token, document.route)
  }

  const manifest: FeishuManifest = { version: 1, docs: [] }
  const manifestBySlug = new Map<string, FeishuManifestDoc>()
  let translatedDocuments = 0

  for (const document of resolved) {
    const result = await syncDocument(client, document, linkMap, webBase)
    if (!result) continue
    translatedDocuments += 1

    const entry = manifestBySlug.get(document.config.slug) ?? {
      slug: document.config.slug,
      group: groupFor(document.config.group, locale),
      order: document.config.order,
      locales: {},
    }
    entry.locales[document.locale] = result
    manifestBySlug.set(document.config.slug, entry)
  }

  manifest.docs = sortManifestDocs([...manifestBySlug.values()])
  checkTranslations(manifest)
  cleanupStaleDocuments(manifest)

  if (!options.dryRun) {
    await writeManifest(feishuConfig.output.manifestPath, manifest)
  }

  const report: FeishuSyncReport = {
    generatedAt: new Date().toISOString(),
    ok: errors.length === 0,
    documents: manifest.docs.length,
    translatedDocuments,
    errors,
    warnings,
  }

  printReport(report)
  if (!options.dryRun && (options.report || errors.length || warnings.length)) {
    await writeFile(feishuConfig.output.reportPath, `${JSON.stringify(report, null, 2)}\n`, 'utf8')
  }

  if (errors.length && options.strict) process.exit(1)
  if (errors.length) console.log('\nSnapshot kept; re-run with --strict to fail the command.')
}

async function resolveDocuments(client: FeishuClient): Promise<ResolvedDocument[]> {
  const resolved: ResolvedDocument[] = []
  for (const doc of feishuConfig.docs) {
    if (options.slug && doc.slug !== options.slug) continue
    for (const locale of SITE_LOCALES) {
      if (options.locale && locale !== options.locale) continue
      const nodeToken = doc.nodes[locale]
      if (!nodeToken) {
        warnings.push(`${doc.slug} (${locale}): no wiki node configured`)
        continue
      }
      try {
        const node = await client.getWikiNode(nodeToken)
        if (node.obj_type !== 'docx') {
          errors.push(`${doc.slug} (${locale}): node ${nodeToken} is ${node.obj_type}, only docx is supported`)
          continue
        }
        resolved.push({
          config: doc,
          locale,
          node,
          route: routeFor(locale, doc.slug),
        })
      } catch (error) {
        errors.push(`${doc.slug} (${locale}): cannot resolve wiki node ${nodeToken}: ${errorMessage(error)}`)
      }
      await sleep(120)
    }
  }
  return resolved
}

async function syncDocument(
  client: FeishuClient,
  document: ResolvedDocument,
  linkMap: Map<string, string>,
  webBase: string,
) {
  const { config, locale, node } = document
  const label = `${config.slug} (${locale})`
  let blocks: FeishuBlock[] = []
  try {
    blocks = await client.listBlocks(node.obj_token)
  } catch (error) {
    warnings.push(`${label}: block list unavailable (${errorMessage(error)}); using markdown export only`)
  }

  let markdown = ''
  try {
    const exported = await client.getDocMarkdown(node.obj_token)
    markdown = exported.content ?? ''
    if (exported.title && exported.title !== node.title) {
      warnings.push(`${label}: wiki title "${node.title}" differs from document title "${exported.title}"`)
    }
  } catch (error) {
    warnings.push(`${label}: markdown export unavailable (${errorMessage(error)}); falling back to blocks`)
  }

  if (!markdown && !blocks.length) {
    errors.push(`${label}: no content could be read`)
    return undefined
  }

  const imageTokens = new Set(extractImageTokens(blocks))
  for (const match of markdown.matchAll(/\/medias\/([A-Za-z0-9_-]+)\/download/g)) {
    if (match[1]) imageTokens.add(match[1])
  }

  let imageMap = new Map<string, string>()
  if (!options.dryRun && imageTokens.size) {
    const localeDir = LOCALE_DIRECTORIES[locale]
    const publicBase = `/feishu/${localeDir}/${config.slug}`
    const destination = join(feishuConfig.output.assetsDir, localeDir, config.slug)
    const images = await downloadImages(client, [...imageTokens], destination, publicBase)
    imageMap = images.paths
    for (const failure of images.failures) {
      warnings.push(`${label}: image ${failure.token} failed: ${failure.message}`)
    }
  }

  const context = {
    title: node.title,
    slug: config.slug,
    route: document.route,
    linkMap,
    imageMap,
    warnings,
    errors,
  }

  const content = markdown ? convertFeishuMarkdown(markdown, context) : blocksToMarkdown(blocks, context)

  if (!content.trim()) {
    errors.push(`${label}: converted document is empty`)
    return undefined
  }

  const title = node.title.trim() || 'Untitled'
  const description = config.descriptions?.[locale] || descriptionFromMarkdown(content)
  const updatedAt = toIsoDate(node.obj_edit_time)
  const url = webBase ? `${webBase}/wiki/${node.node_token}` : undefined
  const frontmatter = serializeDocument({
    title,
    description,
    locale,
    slug: config.slug,
    group: groupFor(config.group, locale),
    order: config.order,
    updatedAt,
    url,
    spaceId: feishuConfig.spaces[locale]?.spaceId ?? '',
    nodeToken: node.node_token,
    objToken: node.obj_token,
  })
  const full = `${frontmatter}\n${content.trim()}\n`
  const hash = createHash('sha256').update(full).digest('hex').slice(0, 16)
  const file = join(feishuConfig.output.docsDir, LOCALE_DIRECTORIES[locale], `${config.slug}.md`)

  if (options.dryRun) {
    console.log(`[dry-run] ${label}: ${content.length} chars, ${imageMap.size} image(s)`)
  } else {
    await writeIfChanged(file, full)
    writtenFiles.add(file)
  }

  return {
    title,
    description,
    updatedAt,
    nodeToken: node.node_token,
    objToken: node.obj_token,
    file: relative(process.cwd(), file).replace(/\\/g, '/'),
    hash,
    ...(url ? { url } : {}),
  }
}

function groupFor(group: FeishuGroup, locale: SiteLocale) {
  return typeof group === 'string' ? group : (group[locale] ?? group['zh-CN'] ?? group['en-US'] ?? 'Docs')
}

function serializeDocument(input: {
  title: string
  description: string
  locale: SiteLocale
  slug: string
  group: string
  order: number
  updatedAt: string
  url?: string
  spaceId: string
  nodeToken: string
  objToken: string
}) {
  const quote = (value: string) => JSON.stringify(value)
  const feishu = JSON.stringify({
    spaceId: input.spaceId,
    nodeToken: input.nodeToken,
    objToken: input.objToken,
    ...(input.url ? { url: input.url } : {}),
  })
  return [
    '---',
    `title: ${quote(input.title)}`,
    `description: ${quote(input.description)}`,
    `locale: ${quote(input.locale)}`,
    `slug: ${quote(input.slug)}`,
    `group: ${quote(input.group)}`,
    `order: ${input.order}`,
    `updatedAt: ${quote(input.updatedAt)}`,
    'source: "feishu"',
    `feishu: ${feishu}`,
    '---',
    '',
  ].join('\n')
}

function checkTranslations(manifest: FeishuManifest) {
  if (!feishuConfig.requireEnglish) return
  for (const doc of manifest.docs) {
    for (const locale of SITE_LOCALES) {
      if (!doc.locales[locale]) {
        errors.push(`${doc.slug} (${locale}): missing translation`)
      }
    }
  }
}

async function cleanupStaleDocuments(manifest: FeishuManifest) {
  if (options.dryRun) return
  const expected = new Set(manifest.docs.flatMap((doc) => Object.values(doc.locales).map((entry) => entry.file)))
  for (const locale of SITE_LOCALES) {
    const directory = join(feishuConfig.output.docsDir, LOCALE_DIRECTORIES[locale])
    const entries = await readdir(directory).catch(() => [] as string[])
    for (const entry of entries) {
      if (!entry.endsWith('.md')) continue
      const file = join(directory, entry)
      const relativeFile = relative(process.cwd(), file).replace(/\\/g, '/')
      if (!expected.has(relativeFile) && !writtenFiles.has(file)) {
        await unlink(file)
        warnings.push(`removed stale document ${relativeFile}`)
      }
    }
  }
}

async function writeIfChanged(file: string, content: string) {
  const previous = await import('node:fs/promises').then((fs) => fs.readFile(file, 'utf8')).catch(() => '')
  if (previous === content) return
  await mkdir(dirname(file), { recursive: true })
  await writeFile(file, content, 'utf8')
}

function validateConfig() {
  const slugs = new Set<string>()
  const nodes = new Set<string>()
  for (const doc of feishuConfig.docs) {
    if (slugs.has(doc.slug)) errors.push(`duplicate slug ${doc.slug} in feishu.config.ts`)
    slugs.add(doc.slug)
    for (const locale of SITE_LOCALES) {
      const node = doc.nodes[locale]
      if (!node) continue
      if (nodes.has(node)) errors.push(`wiki node ${node} is mapped more than once`)
      nodes.add(node)
      if (!feishuConfig.spaces[locale]?.spaceId) {
        warnings.push(`${doc.slug} (${locale}): spaces.${locale}.spaceId is empty`)
      }
    }
  }
}

function routeFor(locale: SiteLocale, slug: string) {
  return locale === 'zh-CN' ? `/docs/${slug}` : `/en/docs/${slug}`
}

function toIsoDate(value: string | undefined) {
  if (!value) return new Date().toISOString()
  const seconds = Number(value)
  if (Number.isFinite(seconds) && seconds > 0) return new Date(seconds * 1000).toISOString()
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? new Date().toISOString() : date.toISOString()
}

function errorMessage(error: unknown) {
  if (error instanceof FeishuError) return `${error.code}: ${error.message}`
  return error instanceof Error ? error.message : String(error)
}

function parseArgs(args: string[]): SyncOptions {
  const localeArg = args.find((arg) => arg.startsWith('--locale='))?.split('=')[1]
  return {
    dryRun: args.includes('--dry-run'),
    strict: args.includes('--strict'),
    report: args.includes('--report'),
    locale: SITE_LOCALES.includes(localeArg as SiteLocale) ? (localeArg as SiteLocale) : undefined,
    slug: args.find((arg) => arg.startsWith('--slug='))?.split('=')[1],
  }
}

function loadEnv() {
  if (!existsSync('.env.local')) return
  process.loadEnvFile('.env.local')
}

function printReport(report: FeishuSyncReport) {
  console.log(`Feishu sync: ${report.documents} documents, ${report.translatedDocuments} files`)
  for (const warning of report.warnings) console.warn(`warning: ${warning}`)
  for (const error of report.errors) console.error(`error: ${error}`)
}

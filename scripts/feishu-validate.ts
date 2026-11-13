import { existsSync } from 'node:fs'
import { readFile, readdir } from 'node:fs/promises'
import { join } from 'node:path'

import feishuConfig from '../feishu.config'
import { LOCALE_DIRECTORIES, SITE_LOCALES, type FeishuManifest } from '../shared/types/feishu'

const errors: string[] = []
const warnings: string[] = []

const manifest = await readManifest()

if (!manifest) {
  if (feishuConfig.docs.some((doc) => SITE_LOCALES.some((locale) => doc.nodes[locale]))) {
    errors.push('content/feishu/manifest.json is missing; run pnpm feishu:sync')
  } else {
    console.log('Feishu validation: no wiki nodes configured; nothing to validate.')
  }
} else {
  await validate(manifest)
}

for (const warning of warnings) console.warn(`warning: ${warning}`)
for (const error of errors) console.error(`error: ${error}`)
console.log(
  `Feishu validation: ${manifest?.docs.length ?? 0} documents, ${errors.length} error(s), ${warnings.length} warning(s)`,
)

if (errors.length) process.exit(1)

async function validate(data: FeishuManifest) {
  const slugs = new Set(data.docs.map((doc) => doc.slug))
  const expectedFiles = new Set<string>()

  for (const doc of data.docs) {
    for (const locale of SITE_LOCALES) {
      const entry = doc.locales[locale]
      if (!entry) {
        if (feishuConfig.requireEnglish) errors.push(`${doc.slug} (${locale}): missing translation`)
        continue
      }
      expectedFiles.add(entry.file)
      if (!existsSync(entry.file)) {
        errors.push(`${doc.slug} (${locale}): ${entry.file} is missing`)
        continue
      }
      const markdown = await readFile(entry.file, 'utf8')
      if (!markdown.includes(`slug: ${JSON.stringify(doc.slug)}`)) {
        errors.push(`${entry.file}: frontmatter slug does not match ${doc.slug}`)
      }
      if (!markdown.includes(`locale: ${JSON.stringify(locale)}`)) {
        errors.push(`${entry.file}: frontmatter locale does not match ${locale}`)
      }
      if (!markdown.includes('source: "feishu"')) {
        errors.push(`${entry.file}: not marked as a Feishu document`)
      }
      for (const match of markdown.matchAll(/!\[[^\]]*\]\((\/feishu\/[^)\s]+)\)/g)) {
        const publicPath = match[1] ? join('public', match[1]) : ''
        if (publicPath && !existsSync(publicPath)) {
          errors.push(`${entry.file}: image ${match[1]} is missing from public`)
        }
      }
      for (const match of markdown.matchAll(/https?:\/\/[^\s)<>"']*(?:feishu\.cn|larksuite\.com)[^\s)<>"']*/g)) {
        if (match[0].includes('/medias/')) {
          errors.push(`${entry.file}: remote Feishu image URL remains: ${match[0]}`)
        }
      }
      for (const match of markdown.matchAll(/\]\((\/(?:en\/)?docs\/[^)\s#]+)/g)) {
        const slug = match[1]?.split('/').pop()
        if (slug && !slugs.has(slug)) {
          errors.push(`${entry.file}: link points at unknown docs slug ${slug}`)
        }
      }
    }
  }

  for (const locale of SITE_LOCALES) {
    const directory = join(feishuConfig.output.docsDir, LOCALE_DIRECTORIES[locale])
    const entries = await readdir(directory).catch(() => [] as string[])
    for (const entry of entries) {
      if (!entry.endsWith('.md')) continue
      const file = `${feishuConfig.output.docsDir}/${LOCALE_DIRECTORIES[locale]}/${entry}`.replace(/\\/g, '/')
      if (!expectedFiles.has(file)) warnings.push(`${file} is not referenced by the manifest`)
    }
  }
}

async function readManifest(): Promise<FeishuManifest | undefined> {
  try {
    return JSON.parse(await readFile(feishuConfig.output.manifestPath, 'utf8')) as FeishuManifest
  } catch {
    return undefined
  }
}

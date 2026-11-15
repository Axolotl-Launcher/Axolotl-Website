import fs from 'node:fs'
import path from 'node:path'
import MiniSearch from 'minisearch'

const root = process.cwd()
const outputFile = path.join(root, 'public/search-index.json')

function readFile(relativePath) {
  return fs.readFileSync(path.join(root, relativePath), 'utf8')
}

function unquote(value) {
  if ((value.startsWith("'") && value.endsWith("'")) || (value.startsWith('"') && value.endsWith('"'))) {
    return value.slice(1, -1)
  }
  return value
}

function parseFrontmatter(raw) {
  if (!raw.startsWith('---')) return { data: {}, body: raw }
  const end = raw.indexOf('\n---', 3)
  if (end === -1) return { data: {}, body: raw }
  const header = raw.slice(3, end).trim()
  const body = raw.slice(raw.indexOf('\n', end + 4) + 1)
  const data = {}
  for (const line of header.split('\n')) {
    const match = /^([A-Za-z][\w-]*):\s*(.*)$/.exec(line)
    if (match) data[match[1]] = unquote(match[2].trim())
  }
  return { data, body }
}

function stripMarkdown(markdown) {
  return markdown
    .replace(/^---[\s\S]*?---\s*/, '')
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/!\[[^\]]*\]\([^)]*\)/g, ' ')
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/[#>*_`~]+/g, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

const documents = []
const manifest = JSON.parse(readFile('content/feishu/manifest.json'))

for (const doc of manifest.docs ?? []) {
  for (const [locale, meta] of Object.entries(doc.locales ?? {})) {
    if (!meta?.file || !meta?.title) continue
    const filePath = path.join(root, meta.file)
    if (!fs.existsSync(filePath)) continue
    documents.push({
      id: `doc:${locale}:${doc.slug}`,
      type: 'doc',
      locale,
      title: meta.title,
      description: meta.description ?? '',
      body: stripMarkdown(fs.readFileSync(filePath, 'utf8')).slice(0, 6000),
      url: `/docs/${doc.slug}`,
    })
  }
}

for (const [directory, fallbackLocale] of [
  ['zh-cn', 'zh-CN'],
  ['en-us', 'en-US'],
]) {
  const articleDirectory = path.join(root, 'content/articles', directory)
  if (!fs.existsSync(articleDirectory)) continue

  for (const entry of fs.readdirSync(articleDirectory)) {
    if (!entry.endsWith('.md')) continue
    const raw = fs.readFileSync(path.join(articleDirectory, entry), 'utf8')
    const { data, body } = parseFrontmatter(raw)
    if (data.draft === 'true') continue
    const slug = entry.replace(/\.md$/, '')
    documents.push({
      id: `article:${data.locale ?? fallbackLocale}:${slug}`,
      type: 'article',
      locale: data.locale ?? fallbackLocale,
      title: data.title ?? slug,
      description: data.description ?? '',
      body: stripMarkdown(body).slice(0, 6000),
      url: `/articles/${slug}`,
    })
  }
}

const index = new MiniSearch({
  fields: ['title', 'description', 'body'],
  storeFields: ['title', 'description', 'url', 'locale', 'type'],
  idField: 'id',
})

index.addAll(documents)
fs.mkdirSync(path.dirname(outputFile), { recursive: true })
fs.writeFileSync(outputFile, JSON.stringify(index))

console.log(`Search index: ${documents.length} documents → ${path.relative(root, outputFile)}`)

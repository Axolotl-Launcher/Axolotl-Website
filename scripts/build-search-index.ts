import fs from 'node:fs'
import path from 'node:path'
import MiniSearch from 'minisearch'

const root = process.cwd()
const outputFile = path.join(root, 'public/search-index.json')

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

for (const [directory, fallbackLocale] of [
  ['zh-cn', 'zh-CN'],
  ['en-us', 'en-US'],
]) {
  const docsDirectory = path.join(root, 'content/docs', directory)
  if (!fs.existsSync(docsDirectory)) continue

  for (const file of fs.readdirSync(docsDirectory).filter((name) => name.endsWith('.md'))) {
    const { data, body } = parseFrontmatter(fs.readFileSync(path.join(docsDirectory, file), 'utf8'))
    if (!data.slug || !data.title) continue
    const locale = data.locale ?? fallbackLocale
    documents.push({
      id: `doc:${locale}:${data.slug}`,
      type: 'doc',
      locale,
      title: data.title,
      description: data.description ?? '',
      body: stripMarkdown(body).slice(0, 6000),
      url: locale === 'zh-CN' ? `/docs/${data.slug}` : `/en/docs/${data.slug}`,
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

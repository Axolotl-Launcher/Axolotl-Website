import fs from 'node:fs'
import path from 'node:path'

const root = process.cwd()

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
  let listKey = null
  for (const line of header.split('\n')) {
    const match = /^([A-Za-z][\w-]*):\s*(.*)$/.exec(line)
    if (match) {
      const value = match[2].trim()
      if (value) {
        data[match[1]] = unquote(value)
        listKey = null
      } else {
        data[match[1]] = []
        listKey = match[1]
      }
    } else if (listKey) {
      const item = /^\s*-\s*(.*)$/.exec(line)
      if (item) data[listKey].push(unquote(item[1].trim()))
    }
  }
  return { data, body }
}

const posts = []
for (const [directory, fallbackLocale] of [
  ['zh-cn', 'zh-CN'],
  ['en-us', 'en-US'],
]) {
  const base = path.join(root, 'content/blog', directory)
  if (!fs.existsSync(base)) continue

  for (const slug of fs.readdirSync(base)) {
    const slugDirectory = path.join(base, slug)
    if (!fs.statSync(slugDirectory).isDirectory()) continue

    const versions = []
    let locale = fallbackLocale
    for (const file of fs
      .readdirSync(slugDirectory)
      .filter((name) => name.endsWith('.md'))
      .sort()) {
      const timestamp = Number(file.replace(/\.md$/, ''))
      if (!Number.isFinite(timestamp)) continue
      const raw = fs.readFileSync(path.join(slugDirectory, file), 'utf8')
      const { data, body } = parseFrontmatter(raw)
      if (data.locale) locale = data.locale
      if (data.draft === 'true') continue
      versions.push({
        timestamp,
        title: data.title ?? slug,
        description: data.description ?? '',
        authors: Array.isArray(data.authors) ? data.authors : [],
        tags: Array.isArray(data.tags) ? data.tags : [],
        cover: data.cover ?? null,
        body: body.trim(),
      })
    }

    versions.sort((a, b) => a.timestamp - b.timestamp)
    versions.forEach((version, index) => {
      version.isUpdate = index > 0
    })
    if (versions.length) posts.push({ slug, locale, versions })
  }
}

// Match Prettier's JSON output so the committed shared index passes `prettier --check`.
const serialized = `${JSON.stringify({ posts }, null, 2)}\n`
fs.mkdirSync(path.join(root, 'public'), { recursive: true })
fs.writeFileSync(path.join(root, 'public/blog-index.json'), serialized)
fs.writeFileSync(path.join(root, 'shared/blog-index.json'), serialized)

const versionCount = posts.reduce((total, post) => total + post.versions.length, 0)
console.log(`Blog index: ${posts.length} posts, ${versionCount} versions`)

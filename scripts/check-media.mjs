import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

/**
 * Fails the build when a prerendered page or stylesheet points at a local image,
 * font, or other media file that the static output does not contain.
 *
 * nuxt-link-checker only inspects `<a href>` links, so it cannot catch a missing
 * `img.src`, `srcset` candidate, CSS `url()`, or an `og:image` in a meta tag.
 * This guard closes that gap after `nuxt generate` has written `.output/public`.
 */

const root = fileURLToPath(new URL('..', import.meta.url))
const output = path.join(root, '.output/public')
const siteHosts = new Set(['axlmc.org', 'www.axlmc.org'])
const mediaExtensions = new Set([
  '.avif',
  '.gif',
  '.ico',
  '.jpeg',
  '.jpg',
  '.mp4',
  '.otf',
  '.png',
  '.svg',
  '.ttf',
  '.webm',
  '.webp',
  '.woff',
  '.woff2',
])

if (!fs.existsSync(output)) {
  console.error('[media] .output/public is missing; run the build before checking media.')
  process.exit(1)
}

/** Every file below `directory`, recursively. */
function walk(directory) {
  const files = []
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const file = path.join(directory, entry.name)
    if (entry.isDirectory()) files.push(...walk(file))
    else files.push(file)
  }
  return files
}

/** Resolves a URL from a page or stylesheet to an absolute file path, or null when it is not local. */
function localFile(url, baseDirectory) {
  const value = url.trim().replaceAll('&amp;', '&')
  if (!value || value.startsWith('data:') || value.startsWith('blob:')) return null

  let pathname = value.split(/[?#]/, 1)[0]
  if (value.startsWith('//')) {
    const parsed = new URL(`https:${value}`)
    if (!siteHosts.has(parsed.host)) return null
    pathname = parsed.pathname
  } else if (/^https?:\/\//i.test(value)) {
    const parsed = new URL(value)
    if (!siteHosts.has(parsed.host)) return null
    pathname = parsed.pathname
  }

  let decoded
  try {
    decoded = decodeURIComponent(pathname)
  } catch {
    decoded = pathname
  }

  if (decoded.endsWith('/')) return null
  return decoded.startsWith('/') ? path.join(output, decoded) : path.resolve(baseDirectory, decoded)
}

/** True when a reference is one of the asset kinds this guard owns. */
function isMedia(url) {
  const pathname = url.trim().split(/[?#]/, 1)[0]
  if (pathname.startsWith('/_ipx/')) return true
  return mediaExtensions.has(path.extname(pathname).toLowerCase())
}

/** Records a missing reference once per (referrer, url) pair. */
function record(missing, file, url) {
  const resolved = localFile(url, path.dirname(file))
  if (!resolved || !isMedia(url)) return
  if (fs.existsSync(resolved)) return
  const key = `${file}\u0000${url}`
  if (!missing.has(key)) missing.set(key, { file, url })
}

function checkCss(missing, file, css) {
  for (const match of css.matchAll(/url\(\s*(['"]?)([^'")]+)\1\s*\)/g)) {
    record(missing, file, match[2])
  }
}

function checkHtml(missing, file) {
  const html = fs.readFileSync(file, 'utf8')

  for (const match of html.matchAll(/\b(?:src|poster|href)="([^"]+)"/g)) {
    record(missing, file, match[1])
  }

  for (const match of html.matchAll(/\bsrcset="([^"]+)"/g)) {
    for (const candidate of match[1].split(',')) {
      const url = candidate.trim().split(/\s+/, 1)[0]
      if (url) record(missing, file, url)
    }
  }

  for (const match of html.matchAll(/<meta\b[^>]*>/g)) {
    const tag = match[0]
    if (!/(?:og:image|twitter:image)/.test(tag)) continue
    const content = tag.match(/\bcontent="([^"]+)"/)
    if (content) record(missing, file, content[1])
  }

  for (const match of html.matchAll(/<style\b[^>]*>([\s\S]*?)<\/style>/g)) {
    checkCss(missing, file, match[1])
  }
}

const files = walk(output)
const pages = files.filter((file) => file.endsWith('.html'))
const stylesheets = files.filter((file) => file.endsWith('.css'))
const missing = new Map()

for (const page of pages) checkHtml(missing, page)
for (const stylesheet of stylesheets) checkCss(missing, stylesheet, fs.readFileSync(stylesheet, 'utf8'))

if (missing.size > 0) {
  console.error(`[media] ${missing.size} missing media reference(s):`)
  for (const { file, url } of missing.values()) {
    console.error(`  ${url} — referenced by ${path.relative(output, file).replaceAll('\\', '/')}`)
  }
  process.exit(1)
}

console.log(`[media] checked ${pages.length} pages and ${stylesheets.length} stylesheets; all local media exists.`)

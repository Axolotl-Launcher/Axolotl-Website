import { createHash } from 'node:crypto'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

/**
 * Renders a repository's contributor card as an SVG with every avatar inlined as a
 * data URL, a build-time rewrite of https://github.com/Axolotl-Launcher/contributors-img.
 * `pnpm dev` and `pnpm build` run it before Nuxt; the card lands in
 * public/contributors.svg and is served at /contributors.svg.
 *
 * Contributors come from the GitHub API with bots dropped; the former contributors
 * listed in scripts/former-contributors.json (vendored from that service) are stripped
 * before the card keeps at most AXOLOTL_CONTRIBUTORS_MAX (default 100) of them, drawn
 * in AXOLOTL_CONTRIBUTORS_COLUMNS (default 12) columns of 64px avatars. Anonymous
 * contributors appear only with AXOLOTL_CONTRIBUTORS_ANON=true.
 * AXOLOTL_CONTRIBUTORS_REPO picks the repository (default Axolotl-Launcher/Axolotl),
 * AXOLOTL_CONTRIBUTORS=off skips generation, GITHUB_TOKEN authenticates the lookup and
 * FORMER_CONTRIBUTORS_FILE overrides the vendored exclusion list.
 *
 * Contributor data and avatars are cached in .cache/contributors-img/ for three days,
 * the lifetime the service gave its HTTP cache, so repeated builds do not refetch them.
 * A failed fetch fails the build in CI; elsewhere it only warns and the site keeps the
 * card it already has.
 */

const DEFAULT_REPOSITORY = 'Axolotl-Launcher/Axolotl'
const ITEM_SIZE = 64
const GAP = 4
const PER_PAGE = 100
/** The service capped paging here; more contributors than this never fit a usable card. */
const MAX_PAGES = 10
const CACHE_TTL = 3 * 24 * 60 * 60 * 1000
const AVATAR_CONCURRENCY = 16
const RETRYABLE_STATUS = new Set([500, 502, 503, 504])
const NOREPLY_LOGIN = /^(?:\d+\+)?([^@]+)@users\.noreply\.github\.com$/

const root = fileURLToPath(new URL('..', import.meta.url))
const target = path.join(root, 'public/contributors.svg')
const cacheDirectory = path.join(root, '.cache/contributors-img')
const formerFile = process.env.FORMER_CONTRIBUTORS_FILE?.trim()
  ? path.resolve(root, process.env.FORMER_CONTRIBUTORS_FILE.trim())
  : path.join(root, 'scripts/former-contributors.json')

const repository = process.env.AXOLOTL_CONTRIBUTORS_REPO?.trim() || DEFAULT_REPOSITORY
const maxCount = positiveInteger(process.env.AXOLOTL_CONTRIBUTORS_MAX, 100)
const columns = positiveInteger(process.env.AXOLOTL_CONTRIBUTORS_COLUMNS, 12)
const includeAnonymous = process.env.AXOLOTL_CONTRIBUTORS_ANON === 'true'

function log(message) {
  console.log(`[contributors] ${message}`)
}

function positiveInteger(value, fallback) {
  const parsed = Number.parseInt(value ?? '', 10)
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback
}

const hash = (algorithm, value) => createHash(algorithm).update(value).digest('hex')
const sleep = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds))

/** Retries timeouts, connection failures, 5xx and GitHub's 202 "still computing" answer. */
async function fetchWithRetry(url, options = {}, timeout = 30_000) {
  let lastError
  for (let attempt = 0; attempt < 3; attempt++) {
    if (attempt > 0) await sleep(500 * 2 ** (attempt - 1))
    let response
    try {
      response = await fetch(url, { ...options, signal: AbortSignal.timeout(timeout) })
    } catch (error) {
      lastError = error
      continue
    }
    if (response.status === 202 || RETRYABLE_STATUS.has(response.status)) {
      lastError = new Error(`${url} answered ${response.status}`)
      continue
    }
    return response
  }
  throw lastError
}

async function github(url) {
  const headers = { accept: 'application/vnd.github+json', 'x-github-api-version': '2022-11-28' }
  const token = process.env.GITHUB_TOKEN || process.env.GITHUB_AUTH_TOKEN
  if (token) headers.authorization = `Bearer ${token}`
  const response = await fetchWithRetry(url, { headers })
  const body = await response.json().catch(() => ({ message: response.statusText }))
  if (response.status === 404) throw new Error(`Repository not found: ${repository}`)
  if (!response.ok) {
    const reset = response.headers.get('x-ratelimit-reset')
    const hint =
      response.headers.get('x-ratelimit-remaining') === '0' && reset
        ? `; the rate limit resets at ${new Date(Number(reset) * 1000).toISOString()}`
        : ''
    throw new Error(`GitHub answered ${response.status}: ${body.message}${hint}`)
  }
  return { body, headers: response.headers }
}

function toContributor(item) {
  switch ((item.type ?? '').toLowerCase()) {
    case 'bot':
      return null
    case 'anonymous':
      return {
        id: 0,
        login: item.name,
        name: item.name,
        email: item.email,
        avatarUrl: `https://www.gravatar.com/avatar/${hash('md5', item.email ?? '')}?d=mp`,
        contributions: item.contributions,
      }
    default:
      return {
        id: item.id,
        login: item.login,
        avatarUrl: item.avatar_url,
        htmlUrl: item.html_url,
        contributions: item.contributions,
      }
  }
}

async function fetchContributors() {
  const all = []
  let url = `https://api.github.com/repos/${repository}/contributors?anon=true&per_page=${PER_PAGE}`
  for (let page = 1; page <= MAX_PAGES; page++) {
    const { body, headers } = await github(url)
    all.push(...body)
    const next = headers.get('link')?.match(/<([^>]+)>;\s*rel="next"/)?.[1]
    if (!next) break
    if (page === MAX_PAGES) {
      log(`Reached the ${MAX_PAGES}-page cap for ${repository}; the rest are dropped`)
      break
    }
    url = next
  }
  return all.map(toContributor).filter(Boolean)
}

const normalize = (value) => (value ?? '').toLowerCase().trim()
/** Display names and logins differ only in separators ("Old Name" vs "old-name"). */
const identity = (value) => normalize(value).replace(/[ \-_]/g, '')

function loadFormerContributors() {
  const file = JSON.parse(fs.readFileSync(formerFile, 'utf8'))
  if (!normalize(file.repository)) throw new Error(`${formerFile} must set repository`)
  if (!file.formerContributors?.length) throw new Error(`${formerFile} has no entries`)
  const list = {
    repository: normalize(file.repository),
    logins: new Set(),
    names: new Set(),
    emails: new Set(),
  }
  for (const entry of file.formerContributors) {
    let login = identity(entry.login)
    if (!login) login = identity(NOREPLY_LOGIN.exec((entry.email ?? '').trim())?.[1] ?? '')
    if (login) list.logins.add(login)
    const name = identity(entry.name)
    if (name) list.names.add(name)
    const email = normalize(entry.email)
    if (email) list.emails.add(email)
  }
  return list
}

function isFormer(list, contributor) {
  const login = identity(contributor.login)
  if (login && (list.logins.has(login) || list.names.has(login))) return true
  const name = identity(contributor.name)
  if (name && list.names.has(name)) return true
  const email = normalize(contributor.email)
  return Boolean(email && list.emails.has(email))
}

function readCache(file) {
  try {
    const cached = JSON.parse(fs.readFileSync(file, 'utf8'))
    if (Date.now() - Date.parse(cached.fetchedAt) < CACHE_TTL) return cached
  } catch {
    // Missing or stale cache: fetch it again.
  }
  return null
}

function writeCache(file, value) {
  fs.mkdirSync(path.dirname(file), { recursive: true })
  fs.writeFileSync(file, JSON.stringify({ fetchedAt: new Date().toISOString(), ...value }))
}

function pruneAvatarCache() {
  const directory = path.join(cacheDirectory, 'avatars')
  if (!fs.existsSync(directory)) return
  for (const name of fs.readdirSync(directory)) {
    const file = path.join(directory, name)
    if (Date.now() - fs.statSync(file).mtimeMs > CACHE_TTL) fs.rmSync(file)
  }
}

async function avatarDataURL(avatarUrl) {
  const url = new URL(avatarUrl)
  url.searchParams.set('size', String(ITEM_SIZE))
  url.searchParams.set('s', String(ITEM_SIZE))
  const cacheFile = path.join(cacheDirectory, 'avatars', `${hash('sha1', url.href)}.json`)
  const cached = readCache(cacheFile)
  if (cached) return cached.dataUrl
  const response = await fetchWithRetry(url.href, {}, 10_000)
  if (!response.ok) {
    throw new Error(`Failed to fetch avatar ${url.href}: status ${response.status}`)
  }
  const contentType = response.headers.get('content-type') ?? 'image/png'
  const body = Buffer.from(await response.arrayBuffer())
  const dataUrl = `data:${contentType};base64,${body.toString('base64')}`
  writeCache(cacheFile, { dataUrl })
  return dataUrl
}

async function mapLimit(items, limit, worker) {
  let next = 0
  async function run() {
    while (next < items.length) {
      const index = next++
      await worker(items[index], index)
    }
  }
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, run))
}

const escapeXML = (value) =>
  value.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;')

/** The same layout the service rendered: 64px circles on a 4px grid, avatars as patterns. */
function renderSVG(contributors) {
  const columnCount = Math.min(columns, contributors.length)
  const rowCount = Math.ceil(contributors.length / columnCount)
  const width = ITEM_SIZE * columnCount + GAP * (columnCount - 1)
  const height = ITEM_SIZE * rowCount + GAP * (rowCount - 1)
  const tiles = contributors.map((contributor, index) => {
    const x = (index % columnCount) * (ITEM_SIZE + GAP)
    const y = Math.floor(index / columnCount) * (ITEM_SIZE + GAP)
    const fill = `fill${index}`
    return [
      `<svg x="${x}" y="${y}" width="${ITEM_SIZE}" height="${ITEM_SIZE}">`,
      `<title>${escapeXML(contributor.login ?? '')}</title>`,
      `<circle cx="${ITEM_SIZE / 2}" cy="${ITEM_SIZE / 2}" r="${ITEM_SIZE / 2}" stroke="#c0c0c0" stroke-width="1" fill="url(#${fill})" />`,
      '<defs>',
      `<pattern id="${fill}" x="0" y="0" width="${ITEM_SIZE}" height="${ITEM_SIZE}" patternUnits="userSpaceOnUse">`,
      `<image x="0" y="0" width="${ITEM_SIZE}" height="${ITEM_SIZE}" xlink:href="${contributor.avatarUrl}" />`,
      '</pattern>',
      '</defs>',
      '</svg>',
    ].join('\n')
  })
  return (
    '<?xml version="1.0"?>\n' +
    `<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" ` +
    'xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">\n' +
    `${tiles.join('\n')}\n</svg>\n`
  )
}

async function generate() {
  if (!/^[\w\-._]+\/[\w\-._]+$/.test(repository)) {
    throw new Error(`Invalid repository name: ${repository}`)
  }
  const former = loadFormerContributors()
  pruneAvatarCache()

  const cacheFile = path.join(cacheDirectory, `contributors-${repository.replaceAll('/', '-')}.json`)
  let contributors = readCache(cacheFile)?.contributors
  if (contributors) {
    log(`Using cached contributors for ${repository}`)
  } else {
    contributors = await fetchContributors()
    writeCache(cacheFile, { contributors })
    log(`Fetched ${contributors.length} contributors for ${repository}`)
  }

  if (former.repository === repository.toLowerCase()) {
    const before = contributors.length
    contributors = contributors.filter((contributor) => !isFormer(former, contributor))
    if (contributors.length !== before) {
      log(`Stripped ${before - contributors.length} former contributors`)
    }
  }
  if (!includeAnonymous) {
    contributors = contributors.filter((contributor) => contributor.id !== 0)
  }
  contributors = contributors.slice(0, maxCount)
  if (contributors.length === 0) {
    log(`No contributors to draw for ${repository}; keeping the current card`)
    return
  }

  await mapLimit(contributors, AVATAR_CONCURRENCY, async (contributor) => {
    contributor.avatarUrl = await avatarDataURL(contributor.avatarUrl)
  })

  const svg = renderSVG(contributors)
  if (fs.existsSync(target) && fs.readFileSync(target, 'utf8') === svg) {
    log(`The contributors card is unchanged (${contributors.length} contributors)`)
    return
  }
  fs.mkdirSync(path.dirname(target), { recursive: true })
  fs.writeFileSync(target, svg)
  log(`Wrote public/contributors.svg with ${contributors.length} contributors`)
}

if (process.env.AXOLOTL_CONTRIBUTORS?.trim() === 'off') {
  log('AXOLOTL_CONTRIBUTORS=off: keeping the contributors card the site has, if any')
} else {
  try {
    await generate()
  } catch (error) {
    console.warn(`[contributors] ${error.message}`)
    // A deployment must show the current card; development keeps working offline.
    if (process.env.CI) process.exitCode = 1
    else log('The site keeps the contributors card it has, if any')
  }
}

import { createHash } from 'node:crypto'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import zlib from 'node:zlib'

/**
 * Puts the launcher frontend's web demo build where the site serves it, at
 * /launcher-demo/<version>/demo/index.html. nuxt.config.ts hands that entry page to
 * /demo, which frames it; without one, /demo shows a download link.
 *
 * By default the build is the web demo package of the latest stable release of
 * Axolotl-Launcher/Axolotl, or of the newest earlier stable release that has one,
 * checked against the asset's SHA-256 digest and kept until a newer release ships one.
 * `AXOLOTL_WEB_DEMO` overrides that: a path to a web demo build
 * (apps/app-frontend/demo/dist) or package (.zip) uses it instead, `off` none.
 * `GITHUB_TOKEN`, when set, authenticates the release lookup.
 */

const REPOSITORY = 'Axolotl-Launcher/Axolotl'
const ASSET_SUFFIX = '_web_demo.zip'
const ENTRY = 'demo/index.html'
/** Far above the ~50 MB package and its ~110 MB of files, so only a broken release hits them. */
const MAX_PACKAGE_SIZE = 512 * 1024 * 1024
const MAX_UNPACKED_SIZE = 2 * 1024 * 1024 * 1024
const root = fileURLToPath(new URL('..', import.meta.url))
const target = path.join(root, 'src/public/launcher-demo')

function log(message) {
    console.log(`[launcher-demo] ${message}`)
}

/** Removes every served demo except that of `version` (all of them for null). */
function keepOnly(version) {
    for (const name of fs.existsSync(target) ? fs.readdirSync(target) : []) {
        if (name !== version) fs.rmSync(path.join(target, name), { recursive: true, force: true })
    }
}

/**
 * Serves `files` (relative path → contents) as the demo of `version`; other versions
 * are removed only once it is written. The entry page is written last, so its presence
 * marks a complete build for the cache check and nuxt.config.ts.
 */
function install(version, files) {
    if (!files.has(ENTRY)) throw new Error(`The web demo build has no ${ENTRY}`)
    const directory = path.join(target, version)
    fs.rmSync(directory, { recursive: true, force: true })
    const ordered = [...files].sort(([a], [b]) => Number(a === ENTRY) - Number(b === ENTRY))
    for (const [name, contents] of ordered) {
        const file = path.join(directory, name)
        fs.mkdirSync(path.dirname(file), { recursive: true })
        fs.writeFileSync(file, contents)
    }
    keepOnly(version)
}

function readDirectory(directory) {
    const files = new Map()
    for (const entry of fs.readdirSync(directory, { recursive: true, withFileTypes: true })) {
        if (!entry.isFile()) continue
        const file = path.join(entry.parentPath, entry.name)
        files.set(path.relative(directory, file).replaceAll('\\', '/'), fs.readFileSync(file))
    }
    return files
}

/** Reads the files of a ZIP archive whose entries are stored or deflated, as `zip` writes them. */
function unzip(archive) {
    const end = archive.lastIndexOf(Buffer.from([0x50, 0x4b, 0x05, 0x06]))
    if (end < 0) throw new Error('The web demo package is not a ZIP archive')
    const count = archive.readUInt16LE(end + 10)
    let offset = archive.readUInt32LE(end + 16)
    if (count === 0xffff || offset === 0xffffffff)
        throw new Error('ZIP64 archives are not supported')
    const files = new Map()
    let unpacked = 0
    for (let index = 0; index < count; index++) {
        if (archive.readUInt32LE(offset) !== 0x02014b50) throw new Error('Corrupt ZIP directory')
        const flags = archive.readUInt16LE(offset + 8)
        const method = archive.readUInt16LE(offset + 10)
        const crc = archive.readUInt32LE(offset + 16)
        const size = archive.readUInt32LE(offset + 20)
        const unpackedSize = archive.readUInt32LE(offset + 24)
        const nameLength = archive.readUInt16LE(offset + 28)
        const header = archive.readUInt32LE(offset + 42)
        const name = archive.toString('utf8', offset + 46, offset + 46 + nameLength)
        offset +=
            46 + nameLength + archive.readUInt16LE(offset + 30) + archive.readUInt16LE(offset + 32)
        if (name.endsWith('/')) continue
        // Entries are written below the demo's own directory only.
        if (
            name
                .split('/')
                .some((part) => !part || part === '.' || part === '..' || /[\\:]/.test(part))
        ) {
            throw new Error(`Unsafe path in the web demo package: ${name}`)
        }
        if (flags & 1 || archive.readUInt32LE(header) !== 0x04034b50) {
            throw new Error(`Unreadable entry in the web demo package: ${name}`)
        }
        const start =
            header + 30 + archive.readUInt16LE(header + 26) + archive.readUInt16LE(header + 28)
        const data = archive.subarray(start, start + size)
        if (method !== 0 && method !== 8)
            throw new Error(`${name} uses compression method ${method}`)
        unpacked += unpackedSize
        if (unpacked > MAX_UNPACKED_SIZE) throw new Error('The web demo package unpacks too large')
        const contents =
            method === 8
                ? zlib.inflateRawSync(data, { maxOutputLength: Math.max(unpackedSize, 1) })
                : data
        if (contents.length !== unpackedSize || zlib.crc32(contents) !== crc) {
            throw new Error(`${name} is corrupt`)
        }
        files.set(name, contents)
    }
    return files
}

async function github(endpoint) {
    const headers = { accept: 'application/vnd.github+json', 'x-github-api-version': '2022-11-28' }
    if (process.env.GITHUB_TOKEN) headers.authorization = `Bearer ${process.env.GITHUB_TOKEN}`
    const url = `https://api.github.com/repos/${REPOSITORY}${endpoint}`
    const response = await fetch(url, { headers, signal: AbortSignal.timeout(30_000) })
    const body = await response.json().catch(() => ({ message: response.statusText }))
    if (!response.ok) throw new Error(`GitHub answered ${response.status}: ${body.message}`)
    return body
}

const demoAsset = (release) =>
    release.assets.find((candidate) => candidate.name.endsWith(ASSET_SUFFIX))

async function installLatestRelease() {
    // `latest` is the newest release that is neither a draft nor a prerelease.
    const latest = await github('/releases/latest')
    // Releases are listed newest first.
    const release = demoAsset(latest)
        ? latest
        : (await github('/releases?per_page=100')).find(
              (candidate) => !candidate.draft && !candidate.prerelease && demoAsset(candidate),
          )
    if (!release) {
        keepOnly(null)
        log('No stable release has a web demo package; /demo shows a download link')
        return
    }
    if (release !== latest) {
        log(`${latest.tag_name} has no web demo package; using the one of ${release.tag_name}`)
    }
    const asset = demoAsset(release)
    const version = release.tag_name.replace(/^v/, '')
    if (!/^\d[\w.+-]*$/.test(version)) throw new Error(`Unexpected release tag ${release.tag_name}`)
    if (fs.existsSync(path.join(target, version, ENTRY))) {
        keepOnly(version)
        log(`Using the web demo of ${release.tag_name}, downloaded before`)
        return
    }
    if (!asset.digest?.startsWith('sha256:')) throw new Error(`${asset.name} has no SHA-256 digest`)
    if (asset.size > MAX_PACKAGE_SIZE) throw new Error(`${asset.name} is too large`)
    log(`Downloading ${asset.name} (${(asset.size / 1024 / 1024).toFixed(1)} MiB)`)
    const download = await fetch(asset.browser_download_url, {
        signal: AbortSignal.timeout(10 * 60_000),
    })
    if (!download.ok) throw new Error(`GitHub answered ${download.status} for ${asset.name}`)
    const archive = Buffer.from(await download.arrayBuffer())
    const digest = `sha256:${createHash('sha256').update(archive).digest('hex')}`
    if (digest !== asset.digest) {
        throw new Error(`${asset.name} has digest ${digest}, but the release lists ${asset.digest}`)
    }
    install(version, unzip(archive))
    log(`Installed the web demo of ${release.tag_name}`)
}

const override = process.env.AXOLOTL_WEB_DEMO?.trim()
if (override === 'off') {
    keepOnly(null)
    log('AXOLOTL_WEB_DEMO=off: /demo shows a download link')
} else if (override) {
    const source = path.resolve(override)
    const files = fs.statSync(source).isDirectory()
        ? readDirectory(source)
        : unzip(fs.readFileSync(source))
    install('local', files)
    log(`Installed the web demo from ${source}`)
} else {
    try {
        await installLatestRelease()
    } catch (error) {
        console.warn(`[launcher-demo] ${error.message}`)
        // A deployment must show the current release; development keeps working offline.
        if (process.env.CI) process.exitCode = 1
        else log('/demo keeps the web demo it has, if any, or shows a download link')
    }
}

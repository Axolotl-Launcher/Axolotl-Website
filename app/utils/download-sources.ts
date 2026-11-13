export type ReleaseChannel = 'release' | 'beta'

export interface ReleaseAsset {
  name: string
  relative_path: string
  sha256?: string
}

export interface LauncherRelease {
  version: string
  tag_name: string
  assets: ReleaseAsset[]
}

const DOWNLOAD_SOURCE_IDS = ['update-server', 'github', 'gitlink'] as const
export type DownloadSourceId = (typeof DOWNLOAD_SOURCE_IDS)[number]
export type DownloadSource = 'auto' | DownloadSourceId

export interface DownloadSourceDefinition {
  id: DownloadSourceId
  label: string
  description: string
  assetUrl: (release: LauncherRelease, asset: ReleaseAsset) => string
}

export interface DownloadEndpoints {
  updateServerUrl: string
  updateArtifactUrl: string
}

export interface DownloadSourcesOptions extends DownloadEndpoints {
  githubUrl: string
  gitlinkReleasesUrl: string
}

function encodePath(value: string) {
  return value.split('/').map(encodeURIComponent).join('/')
}

export function createDownloadSources(options: DownloadSourcesOptions): DownloadSourceDefinition[] {
  return [
    {
      id: 'update-server',
      label: 'Update Server',
      description: 'Download through the official Axolotl update service.',
      assetUrl: (_release, asset) => options.updateArtifactUrl + '/' + encodePath(asset.relative_path),
    },
    {
      id: 'github',
      label: 'GitHub',
      description: 'Download from the official GitHub release.',
      assetUrl: (release, asset) =>
        options.githubUrl +
        '/releases/download/' +
        encodeURIComponent(release.tag_name) +
        '/' +
        encodeURIComponent(asset.name),
    },
    {
      id: 'gitlink',
      label: 'GitLink',
      description: 'Download from the GitLink mirror.',
      assetUrl: (release, asset) =>
        options.gitlinkReleasesUrl + '/' + encodeURIComponent(release.tag_name) + '/' + encodeURIComponent(asset.name),
    },
  ]
}

export function isDownloadSource(value: unknown): value is DownloadSource {
  return value === 'auto' || (DOWNLOAD_SOURCE_IDS as readonly unknown[]).includes(value)
}

export function getDownloadSource(id: DownloadSource, sources: readonly DownloadSourceDefinition[]) {
  const source = id === 'auto' ? sources[0] : sources.find((candidate) => candidate.id === id)
  if (!source) throw new Error('Unknown download source: ' + id)
  return source
}

export function getDownloadCatalogUrl(channel: ReleaseChannel, endpoints: DownloadEndpoints) {
  if (channel !== 'release' && channel !== 'beta') throw new Error('Unknown release channel: ' + channel)
  return endpoints.updateServerUrl + '/api/downloads/latest?channel=' + channel
}

function record(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function unsafeComponent(value: string) {
  return Array.from(value).some((character) => {
    const code = character.charCodeAt(0)
    return code < 32 || code === 127 || code === 92
  })
}

function relativePath(
  download: Record<string, unknown>,
  version: string,
  filename: string,
  endpoints: DownloadEndpoints,
) {
  let value = download.relative_path
  if (value === undefined && typeof download.url === 'string') {
    const url = new URL(download.url, endpoints.updateServerUrl)
    if (
      ![endpoints.updateServerUrl, endpoints.updateArtifactUrl].includes(url.origin) ||
      url.username ||
      url.password ||
      url.search ||
      url.hash
    ) {
      throw new Error('Invalid Update Server URL for ' + filename)
    }
    value = url.pathname.split('/').map(decodeURIComponent).join('/')
  }
  if (typeof value !== 'string') throw new Error('Missing relative_path for ' + filename)
  const normalized = value.startsWith('/') ? value.slice(1) : value
  const segments = normalized.split('/')
  if (
    segments.some((part) => !part || part === '.' || part === '..' || unsafeComponent(part)) ||
    segments[0] !== 'dist' ||
    segments[1] !== version ||
    segments.at(-1) !== filename
  ) {
    throw new Error('Invalid relative_path for ' + filename)
  }
  return normalized
}

export function normalizeDownloadCatalog(payload: unknown, endpoints: DownloadEndpoints): LauncherRelease | null {
  if (payload === null || payload === undefined || payload === '') return null
  const versionPattern =
    /^[0-9]+[.][0-9]+[.][0-9]+(?:-[0-9A-Za-z-]+(?:[.][0-9A-Za-z-]+)*)?(?:[+][0-9A-Za-z-]+(?:[.][0-9A-Za-z-]+)*)?$/
  if (
    !record(payload) ||
    typeof payload.version !== 'string' ||
    payload.version !== payload.version.trim() ||
    !versionPattern.test(payload.version) ||
    !Array.isArray(payload.downloads)
  ) {
    throw new Error('Invalid Update Server download catalog')
  }
  const version = payload.version
  const tag = payload.release_tag ?? payload.tag_name ?? payload.tag ?? 'v' + version
  if (tag !== 'v' + version) throw new Error('Update Server version and tag do not match')
  const names = new Set<string>()
  const assets = payload.downloads.map((download: unknown): ReleaseAsset => {
    if (
      !record(download) ||
      typeof download.filename !== 'string' ||
      !download.filename ||
      download.filename.includes('/') ||
      unsafeComponent(download.filename) ||
      ['.', '..'].includes(download.filename) ||
      names.has(download.filename)
    ) {
      throw new Error('Invalid or duplicate Update Server attachment name')
    }
    names.add(download.filename)
    if (
      download.sha256 !== undefined &&
      (typeof download.sha256 !== 'string' || !/^[a-f0-9]{64}$/i.test(download.sha256))
    ) {
      throw new Error('Invalid SHA-256 for ' + download.filename)
    }
    return {
      name: download.filename,
      relative_path: relativePath(download, version, download.filename, endpoints),
      ...(typeof download.sha256 === 'string' ? { sha256: download.sha256 } : {}),
    }
  })
  return { version, tag_name: tag, assets }
}

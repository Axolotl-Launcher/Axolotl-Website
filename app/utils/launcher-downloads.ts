import {
  type DownloadSourceDefinition,
  type DownloadSourceId,
  getDownloadSource,
  type LauncherRelease,
  type ReleaseChannel,
} from './download-sources'

export type DownloadStatus = 'idle' | 'pending' | 'success' | 'error'
export type HeroDownloadState = 'loading' | 'ready' | 'error'

export function shouldDegradeDownload(state: HeroDownloadState, elapsedMs: number, limitMs = 2500) {
  return state === 'loading' && elapsedMs >= limitMs
}

export function hasLauncherDownloads(
  release: LauncherRelease | null | undefined,
  sources: readonly DownloadSourceDefinition[],
) {
  return Object.values(resolveLauncherDownloads(release, 'update-server', sources)).some(Boolean)
}

export function resolveLauncherDownloads(
  release: LauncherRelease | null | undefined,
  source: DownloadSourceId,
  sources: readonly DownloadSourceDefinition[],
) {
  const definition = getDownloadSource(source, sources)
  function findAsset(patterns: RegExp[]) {
    if (!release) return null
    const asset = patterns
      .map((pattern) => release.assets.find((candidate) => pattern.test(candidate.name)))
      .find(Boolean)
    if (!asset) return null
    return definition.assetUrl(release, asset)
  }

  return {
    windows: findAsset([/x64-setup\.exe$/i, /\.exe$/i]),
    mac: findAsset([/universal\.dmg$/i, /\.dmg$/i]),
    appImage: findAsset([/(amd64|x86_64)\.AppImage$/i]),
    deb: findAsset([/_amd64\.deb$/i, /(amd64|x86_64).*\.deb$/i]),
    rpm: findAsset([/(x86_64|amd64).*\.rpm$/i]),
  }
}

export function getDownloadAvailability(status: DownloadStatus, link: string | null) {
  if (status === 'error') return 'error'
  if (status !== 'success') return 'loading'
  return link ? 'ready' : 'unavailable'
}

export function getReleasePage(channel: ReleaseChannel, release: LauncherRelease | null | undefined, baseUrl: string) {
  if (release?.tag_name) return `${baseUrl}/tag/${encodeURIComponent(release.tag_name)}`
  return channel === 'release' ? `${baseUrl}/latest` : baseUrl
}

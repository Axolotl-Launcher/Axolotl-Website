export type DownloadPlatform = 'windows' | 'mac' | 'linux'
export type DownloadFormat = 'installer' | 'portable' | 'dmg' | 'appimage' | 'deb' | 'rpm'

export const DOWNLOAD_PLATFORMS: readonly DownloadPlatform[] = ['windows', 'mac', 'linux']
export const DOWNLOAD_FORMATS: readonly DownloadFormat[] = ['installer', 'portable', 'dmg', 'appimage', 'deb', 'rpm']

export const DOWNLOAD_LINK_KEY_BY_FORMAT = {
  installer: 'windows',
  portable: 'portable',
  dmg: 'mac',
  appimage: 'appImage',
  deb: 'deb',
  rpm: 'rpm',
} as const

export function isDownloadPlatform(value: unknown): value is DownloadPlatform {
  return typeof value === 'string' && DOWNLOAD_PLATFORMS.includes(value as DownloadPlatform)
}

export function isDownloadFormat(value: unknown): value is DownloadFormat {
  return typeof value === 'string' && DOWNLOAD_FORMATS.includes(value as DownloadFormat)
}

export function defaultFormatForPlatform(platform: DownloadPlatform): DownloadFormat {
  if (platform === 'mac') return 'dmg'
  if (platform === 'linux') return 'appimage'
  return 'installer'
}

export function downloadFormatMatches(platform: DownloadPlatform, format: DownloadFormat) {
  if (platform === 'linux') return format === 'appimage' || format === 'deb' || format === 'rpm'
  if (platform === 'mac') return format === 'dmg'
  return format === 'installer' || format === 'portable'
}

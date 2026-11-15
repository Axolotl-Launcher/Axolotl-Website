export type PlatformId = 'windows' | 'mac' | 'linux'

export interface DeviceFlags {
  isWindows: boolean
  isMacOS: boolean
  isLinux: boolean
  isMobileOrTablet?: boolean
  isCrawler?: boolean
}

export const FALLBACK_PLATFORM: PlatformId = 'windows'

export function detectDesktopPlatform(flags: DeviceFlags): PlatformId | null {
  if (flags.isCrawler || flags.isMobileOrTablet) return null
  if (flags.isWindows) return 'windows'
  if (flags.isMacOS) return 'mac'
  if (flags.isLinux) return 'linux'
  return null
}

export function resolvePlatform(flags: DeviceFlags): PlatformId {
  return detectDesktopPlatform(flags) ?? FALLBACK_PLATFORM
}

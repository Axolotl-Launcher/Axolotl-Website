import { describe, expect, it } from 'vitest'
import { detectDesktopPlatform, resolvePlatform } from './platform'

const desktop = {
  isWindows: false,
  isMacOS: false,
  isLinux: false,
}

describe('detectDesktopPlatform', () => {
  it('detects supported desktop systems', () => {
    expect(detectDesktopPlatform({ ...desktop, isWindows: true })).toBe('windows')
    expect(detectDesktopPlatform({ ...desktop, isMacOS: true })).toBe('mac')
    expect(detectDesktopPlatform({ ...desktop, isLinux: true })).toBe('linux')
  })

  it('returns null for unsupported systems', () => {
    expect(detectDesktopPlatform(desktop)).toBeNull()
    expect(detectDesktopPlatform({ ...desktop, isWindows: true, isMobileOrTablet: true })).toBeNull()
    expect(detectDesktopPlatform({ ...desktop, isMacOS: true, isCrawler: true })).toBeNull()
  })
})

describe('resolvePlatform', () => {
  it('falls back to Windows for unsupported systems', () => {
    expect(resolvePlatform(desktop)).toBe('windows')
    expect(resolvePlatform({ ...desktop, isLinux: true, isMobileOrTablet: true })).toBe('windows')
  })
})

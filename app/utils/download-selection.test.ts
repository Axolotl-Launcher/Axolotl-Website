import { describe, expect, it } from 'vitest'
import {
  defaultFormatForPlatform,
  downloadFormatMatches,
  isDownloadFormat,
  isDownloadPlatform,
} from './download-selection'

describe('isDownloadPlatform', () => {
  it('accepts supported platforms', () => {
    expect(isDownloadPlatform('windows')).toBe(true)
    expect(isDownloadPlatform('mac')).toBe(true)
    expect(isDownloadPlatform('linux')).toBe(true)
  })

  it('rejects everything else', () => {
    expect(isDownloadPlatform('ios')).toBe(false)
    expect(isDownloadPlatform('')).toBe(false)
    expect(isDownloadPlatform(null)).toBe(false)
    expect(isDownloadPlatform(['windows'])).toBe(false)
  })
})

describe('isDownloadFormat', () => {
  it('accepts supported formats', () => {
    for (const format of ['installer', 'dmg', 'appimage', 'deb', 'rpm']) {
      expect(isDownloadFormat(format)).toBe(true)
    }
  })

  it('rejects everything else', () => {
    expect(isDownloadFormat('exe')).toBe(false)
    expect(isDownloadFormat(undefined)).toBe(false)
  })
})

describe('defaultFormatForPlatform', () => {
  it('picks the native format for each platform', () => {
    expect(defaultFormatForPlatform('windows')).toBe('installer')
    expect(defaultFormatForPlatform('mac')).toBe('dmg')
    expect(defaultFormatForPlatform('linux')).toBe('appimage')
  })
})

describe('downloadFormatMatches', () => {
  it('accepts every linux package and rejects cross-platform formats', () => {
    expect(downloadFormatMatches('linux', 'deb')).toBe(true)
    expect(downloadFormatMatches('linux', 'rpm')).toBe(true)
    expect(downloadFormatMatches('linux', 'installer')).toBe(false)
    expect(downloadFormatMatches('windows', 'installer')).toBe(true)
    expect(downloadFormatMatches('windows', 'dmg')).toBe(false)
    expect(downloadFormatMatches('mac', 'dmg')).toBe(true)
    expect(downloadFormatMatches('mac', 'appimage')).toBe(false)
  })
})

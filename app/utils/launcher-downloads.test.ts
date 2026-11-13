import { describe, expect, it } from 'vitest'

import { createDownloadSources, type LauncherRelease } from './download-sources'
import { getDownloadAvailability, getReleasePage, resolveLauncherDownloads } from './launcher-downloads'

const sources = createDownloadSources({
  updateServerUrl: 'https://update.axlmc.org',
  updateArtifactUrl: 'https://dist.axlmc.org',
  githubUrl: 'https://github.com/Axolotl-Launcher/Axolotl',
  gitlinkReleasesUrl: 'https://www.gitlink.org.cn/xinvxueyuan/Axolotl/releases/download',
})

const release: LauncherRelease = {
  version: '1.11.0',
  tag_name: 'v1.11.0',
  assets: [
    {
      name: 'Axolotl_1.11.0_x64-setup.exe',
      relative_path: 'dist/1.11.0/Axolotl_1.11.0_x64-setup.exe',
    },
    {
      name: 'Axolotl_1.11.0_universal.dmg',
      relative_path: 'dist/1.11.0/Axolotl_1.11.0_universal.dmg',
    },
    {
      name: 'Axolotl_1.11.0_amd64.AppImage',
      relative_path: 'dist/1.11.0/Axolotl_1.11.0_amd64.AppImage',
    },
    {
      name: 'Axolotl_1.11.0_amd64.deb',
      relative_path: 'dist/1.11.0/Axolotl_1.11.0_amd64.deb',
    },
    {
      name: 'Axolotl-1.11.0-1.x86_64.rpm',
      relative_path: 'dist/1.11.0/Axolotl-1.11.0-1.x86_64.rpm',
    },
  ],
}

describe('launcher downloads', () => {
  it('resolves every published platform', () => {
    const links = resolveLauncherDownloads(release, 'update-server', sources)
    expect(links).toEqual({
      windows: 'https://dist.axlmc.org/dist/1.11.0/Axolotl_1.11.0_x64-setup.exe',
      mac: 'https://dist.axlmc.org/dist/1.11.0/Axolotl_1.11.0_universal.dmg',
      appImage: 'https://dist.axlmc.org/dist/1.11.0/Axolotl_1.11.0_amd64.AppImage',
      deb: 'https://dist.axlmc.org/dist/1.11.0/Axolotl_1.11.0_amd64.deb',
      rpm: 'https://dist.axlmc.org/dist/1.11.0/Axolotl-1.11.0-1.x86_64.rpm',
    })
  })

  it('returns null when a platform is absent', () => {
    expect(resolveLauncherDownloads(null, 'github', sources)).toEqual({
      windows: null,
      mac: null,
      appImage: null,
      deb: null,
      rpm: null,
    })
  })

  it('maps fetch states to availability', () => {
    expect(getDownloadAvailability('idle', null)).toBe('loading')
    expect(getDownloadAvailability('error', null)).toBe('error')
    expect(getDownloadAvailability('success', 'https://example.test/a')).toBe('ready')
    expect(getDownloadAvailability('success', null)).toBe('unavailable')
  })

  it('builds release pages per channel', () => {
    expect(getReleasePage('release', release, 'https://github.com/Axolotl-Launcher/Axolotl/releases')).toBe(
      'https://github.com/Axolotl-Launcher/Axolotl/releases/tag/v1.11.0',
    )
    expect(getReleasePage('beta', null, 'https://github.com/Axolotl-Launcher/Axolotl/releases')).toBe(
      'https://github.com/Axolotl-Launcher/Axolotl/releases',
    )
  })
})

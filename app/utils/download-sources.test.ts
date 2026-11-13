import { describe, expect, it } from 'vitest'

import {
  createDownloadSources,
  getDownloadCatalogUrl,
  getDownloadSource,
  isDownloadSource,
  normalizeDownloadCatalog,
} from './download-sources'

const endpoints = {
  updateServerUrl: 'https://update.axlmc.org',
  updateArtifactUrl: 'https://dist.axlmc.org',
}

const options = {
  ...endpoints,
  githubUrl: 'https://github.com/Axolotl-Launcher/Axolotl',
  gitlinkReleasesUrl: 'https://www.gitlink.org.cn/xinvxueyuan/Axolotl/releases/download',
}

describe('download sources', () => {
  it('builds catalog URLs per channel', () => {
    expect(getDownloadCatalogUrl('release', endpoints)).toBe(
      'https://update.axlmc.org/api/downloads/latest?channel=release',
    )
    expect(getDownloadCatalogUrl('beta', endpoints)).toBe('https://update.axlmc.org/api/downloads/latest?channel=beta')
    expect(() => getDownloadCatalogUrl('nightly' as never, endpoints)).toThrow('Unknown release channel')
  })

  it('normalizes a valid catalog and builds source URLs', () => {
    const release = normalizeDownloadCatalog(
      {
        version: '1.11.0',
        release_tag: 'v1.11.0',
        downloads: [
          {
            filename: 'Axolotl_1.11.0_x64-setup.exe',
            relative_path: 'dist/1.11.0/Axolotl_1.11.0_x64-setup.exe',
            sha256: 'a'.repeat(64),
          },
        ],
      },
      endpoints,
    )

    expect(release).toEqual({
      version: '1.11.0',
      tag_name: 'v1.11.0',
      assets: [
        {
          name: 'Axolotl_1.11.0_x64-setup.exe',
          relative_path: 'dist/1.11.0/Axolotl_1.11.0_x64-setup.exe',
          sha256: 'a'.repeat(64),
        },
      ],
    })

    const sources = createDownloadSources(options)
    expect(getDownloadSource('auto', sources).id).toBe('update-server')
    expect(getDownloadSource('github', sources).assetUrl(release!, release!.assets[0]!)).toBe(
      'https://github.com/Axolotl-Launcher/Axolotl/releases/download/v1.11.0/Axolotl_1.11.0_x64-setup.exe',
    )
    expect(getDownloadSource('gitlink', sources).assetUrl(release!, release!.assets[0]!)).toBe(
      'https://www.gitlink.org.cn/xinvxueyuan/Axolotl/releases/download/v1.11.0/Axolotl_1.11.0_x64-setup.exe',
    )
  })

  it('accepts URLs only from configured update origins', () => {
    const release = normalizeDownloadCatalog(
      {
        version: '1.11.0',
        downloads: [
          {
            filename: 'Axolotl_1.11.0_x64-setup.exe',
            url: 'https://dist.axlmc.org/dist/1.11.0/Axolotl_1.11.0_x64-setup.exe',
          },
        ],
      },
      endpoints,
    )
    expect(release?.assets[0]?.relative_path).toBe('dist/1.11.0/Axolotl_1.11.0_x64-setup.exe')

    expect(() =>
      normalizeDownloadCatalog(
        {
          version: '1.11.0',
          downloads: [{ filename: 'x.exe', url: 'https://evil.example/dist/1.11.0/x.exe' }],
        },
        endpoints,
      ),
    ).toThrow('Invalid Update Server URL')
  })

  it('rejects path traversal, duplicate names and mismatched tags', () => {
    expect(() =>
      normalizeDownloadCatalog(
        {
          version: '1.11.0',
          downloads: [{ filename: 'x.exe', relative_path: 'dist/1.11.0/../x.exe' }],
        },
        endpoints,
      ),
    ).toThrow('Invalid relative_path')

    expect(() =>
      normalizeDownloadCatalog(
        {
          version: '1.11.0',
          downloads: [
            { filename: 'x.exe', relative_path: 'dist/1.11.0/x.exe' },
            { filename: 'x.exe', relative_path: 'dist/1.11.0/x.exe' },
          ],
        },
        endpoints,
      ),
    ).toThrow('duplicate')

    expect(() =>
      normalizeDownloadCatalog({ version: '1.11.0', release_tag: 'v1.10.0', downloads: [] }, endpoints),
    ).toThrow('do not match')
  })

  it('validates source ids and empty payloads', () => {
    expect(isDownloadSource('auto')).toBe(true)
    expect(isDownloadSource('update-server')).toBe(true)
    expect(isDownloadSource('ftp')).toBe(false)
    expect(normalizeDownloadCatalog('', endpoints)).toBeNull()
  })
})

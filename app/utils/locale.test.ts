import { describe, expect, it } from 'vitest'

import { docsPath, toContentLocale } from './locale'

describe('locale routes', () => {
  it('maps i18n locale codes to content locales', () => {
    expect(toContentLocale('zh-CN')).toBe('zh-CN')
    expect(toContentLocale('en')).toBe('en-US')
    expect(toContentLocale('fr')).toBe('zh-CN')
  })

  it('builds docs paths per locale', () => {
    expect(docsPath('zh-CN')).toBe('/docs')
    expect(docsPath('zh-CN', 'installation')).toBe('/docs/installation')
    expect(docsPath('en')).toBe('/en/docs')
    expect(docsPath('en', 'installation')).toBe('/en/docs/installation')
  })
})

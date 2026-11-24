import { describe, expect, it } from 'vitest'

import { docsPath, rewriteDocsLink, toContentLocale } from './locale'

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

describe('fallback document links', () => {
  it('keeps Chinese links unchanged', () => {
    expect(rewriteDocsLink('/docs/installation', 'zh-CN')).toBe('/docs/installation')
    expect(rewriteDocsLink('/', 'zh-CN')).toBe('/')
  })

  it('prefixes root-relative links for English readers', () => {
    expect(rewriteDocsLink('/docs/installation', 'en')).toBe('/en/docs/installation')
    expect(rewriteDocsLink('/', 'en')).toBe('/en')
  })

  it('leaves external, anchor and already-prefixed links alone', () => {
    expect(rewriteDocsLink('https://example.com/docs', 'en')).toBe('https://example.com/docs')
    expect(rewriteDocsLink('//cdn.example.com/x', 'en')).toBe('//cdn.example.com/x')
    expect(rewriteDocsLink('#section', 'en')).toBe('#section')
    expect(rewriteDocsLink('/en/docs/installation', 'en')).toBe('/en/docs/installation')
    expect(rewriteDocsLink('/en', 'en')).toBe('/en')
  })
})

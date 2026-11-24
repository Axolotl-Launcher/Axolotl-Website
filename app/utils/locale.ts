import type { SiteLocale } from '#shared/types/docs'

export function toContentLocale(locale: string): SiteLocale {
  return locale === 'en' ? 'en-US' : 'zh-CN'
}

export function docsPath(locale: string, slug?: string): string {
  const prefix = locale === 'zh-CN' ? '/docs' : '/en/docs'
  return slug ? `${prefix}/${slug}` : prefix
}

/**
 * The Chinese originals link to other docs with root-relative URLs such as
 * `/docs/installation`. Serving one under `/en/docs/<slug>` would drop the
 * visitor back into the Chinese site, so a fallback document rewrites those
 * links to the locale prefix of the page that renders it and leaves external
 * links, anchors and already-prefixed paths untouched.
 */
export function rewriteDocsLink(href: string, locale: string): string {
  if (locale === 'zh-CN' || !href.startsWith('/')) return href
  if (href.startsWith('//') || href.startsWith('/en/') || href === '/en') return href
  return href === '/' ? '/en' : `/en${href}`
}

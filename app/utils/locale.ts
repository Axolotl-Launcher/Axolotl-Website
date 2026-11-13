import type { SiteLocale } from '#shared/types/feishu'

export function toContentLocale(locale: string): SiteLocale {
  return locale === 'en' ? 'en-US' : 'zh-CN'
}

export function docsPath(locale: string, slug?: string): string {
  const prefix = locale === 'zh-CN' ? '/docs' : '/en/docs'
  return slug ? `${prefix}/${slug}` : prefix
}

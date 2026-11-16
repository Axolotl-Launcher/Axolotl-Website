export const SITE_LOCALES = ['zh-CN', 'en-US'] as const

export type SiteLocale = (typeof SITE_LOCALES)[number]

export const LOCALE_DIRECTORIES: Record<SiteLocale, string> = {
  'zh-CN': 'zh-cn',
  'en-US': 'en-us',
}

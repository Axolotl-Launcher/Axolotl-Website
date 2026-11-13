export const SITE_LOCALES = ['zh-CN', 'en-US'] as const

export type SiteLocale = (typeof SITE_LOCALES)[number]

export const LOCALE_DIRECTORIES: Record<SiteLocale, string> = {
  'zh-CN': 'zh-cn',
  'en-US': 'en-us',
}

export interface FeishuConfig {
  /**
   * Knowledge base spaces, one per locale. Only the id is required; the app
   * must be a member of the space and have the wiki readonly scope.
   */
  spaces: Partial<Record<SiteLocale, { spaceId: string }>>
  docs: FeishuDocConfig[]
  output: {
    docsDir: string
    assetsDir: string
    manifestPath: string
    reportPath: string
  }
  /** Public web origin of the tenant, used for "open in Feishu" links. */
  webBase?: string
  /** Fail validation when a configured document has no translation. */
  requireEnglish?: boolean
}

export type FeishuGroup = string | Partial<Record<SiteLocale, string>>

export interface FeishuDocConfig {
  slug: string
  group: FeishuGroup
  order: number
  descriptions?: Partial<Record<SiteLocale, string>>
  /** Wiki node tokens keyed by the locale they contain. */
  nodes: Partial<Record<SiteLocale, string>>
}

export interface FeishuManifest {
  version: 1
  docs: FeishuManifestDoc[]
}

export interface FeishuManifestDoc {
  slug: string
  group: string
  order: number
  locales: Partial<Record<SiteLocale, FeishuManifestLocale>>
}

export interface FeishuManifestLocale {
  title: string
  description: string
  updatedAt: string
  nodeToken: string
  objToken: string
  file: string
  hash: string
  url?: string
}

export interface FeishuSyncReport {
  generatedAt: string
  ok: boolean
  documents: number
  translatedDocuments: number
  errors: string[]
  warnings: string[]
}

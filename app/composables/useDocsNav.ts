import type { SiteLocale } from '#shared/types/docs'

export interface DocsNavItem {
  title: string
  description: string
  slug: string
  group: string
  order: number
  updatedAt: string
  /** The entry rendered is the Chinese original because this locale has no translation. */
  fallback: boolean
}

export interface DocsNavGroup {
  name: string
  items: DocsNavItem[]
}

interface DocsEntryLike {
  title?: unknown
  description?: unknown
  slug?: unknown
  group?: unknown
  order?: unknown
  updatedAt?: unknown
}

function toNavItem(entry: DocsEntryLike, fallback: boolean): DocsNavItem {
  return {
    title: typeof entry.title === 'string' ? entry.title : '',
    description: typeof entry.description === 'string' ? entry.description : '',
    slug: typeof entry.slug === 'string' ? entry.slug : '',
    group: typeof entry.group === 'string' ? entry.group : 'Docs',
    order: typeof entry.order === 'number' ? entry.order : 0,
    updatedAt: typeof entry.updatedAt === 'string' ? entry.updatedAt : '',
    fallback,
  }
}

export function useDocsNav() {
  const { locale } = useI18n()
  const contentLocale = computed<SiteLocale>(() => toContentLocale(locale.value))

  const { data: docs } = useAsyncData(
    () => `docs-nav-${contentLocale.value}`,
    async () => {
      const entries = await queryCollection('docs').where('locale', '=', contentLocale.value).all()
      const translated = entries.map((entry) => toNavItem(entry, false))
      if (contentLocale.value === 'zh-CN') return translated

      // A locale that is only partly translated still needs the rest of the
      // knowledge base. Fill the gaps slug by slug from the Chinese originals
      // and let each consumer mark those entries as such; the detail page
      // already renders them with the same fallback note. Falling back on
      // "this locale has no documents at all" instead would drop every
      // untranslated page the moment the first translation landed.
      const originals = await queryCollection('docs').where('locale', '=', 'zh-CN').all()
      const missing = originals
        .filter((original) => !translated.some((entry) => entry.slug === original.slug))
        .map((original) => toNavItem(original, true))
      return [...translated, ...missing]
    },
    { watch: [contentLocale], default: () => [] as DocsNavItem[] },
  )

  const fallback = computed(() => (docs.value ?? []).some((doc) => doc.fallback))

  /**
   * The search index stores one document per locale, so a locale-wide boolean
   * cannot express "translated here, original there". These are the exact
   * search-document IDs this locale renders, translations and fallbacks alike.
   */
  const indexIds = computed(
    () =>
      new Set(
        (docs.value ?? []).map((doc) => `doc:${doc.fallback ? 'zh-CN' : contentLocale.value}:${doc.slug}`),
      ),
  )

  const groups = computed<DocsNavGroup[]>(() => {
    const grouped = new Map<string, DocsNavItem[]>()
    for (const doc of docs.value ?? []) {
      const items = grouped.get(doc.group) ?? []
      items.push(doc)
      grouped.set(doc.group, items)
    }
    return [...grouped.entries()].map(([name, items]) => ({
      name,
      items: items.sort((left, right) => left.order - right.order || left.title.localeCompare(right.title)),
    }))
  })

  return { docs, groups, contentLocale, fallback, indexIds }
}

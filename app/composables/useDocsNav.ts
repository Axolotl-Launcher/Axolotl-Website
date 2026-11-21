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
      if (entries.length || contentLocale.value === 'zh-CN') {
        return entries.map((entry) => toNavItem(entry, false))
      }

      // An untranslated locale still needs a working knowledge base. List the
      // Chinese originals and let each consumer mark them as such; the detail
      // page already renders those documents with the same fallback note.
      const originals = await queryCollection('docs').where('locale', '=', 'zh-CN').all()
      return originals.map((entry) => toNavItem(entry, true))
    },
    { watch: [contentLocale], default: () => [] as DocsNavItem[] },
  )

  const fallback = computed(() => (docs.value ?? []).some((doc) => doc.fallback))

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

  return { docs, groups, contentLocale, fallback }
}

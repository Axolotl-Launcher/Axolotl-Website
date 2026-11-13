import type { SiteLocale } from '#shared/types/feishu'

export interface DocsNavItem {
  title: string
  description: string
  slug: string
  group: string
  order: number
  updatedAt: string
}

export interface DocsNavGroup {
  name: string
  items: DocsNavItem[]
}

export function useDocsNav() {
  const { locale } = useI18n()
  const contentLocale = computed<SiteLocale>(() => toContentLocale(locale.value))

  const { data: docs } = useAsyncData(
    () => `docs-nav-${contentLocale.value}`,
    async () => {
      const entries = await queryCollection('docs').where('locale', '=', contentLocale.value).all()
      return entries
        .map((entry) => ({
          title: entry.title ?? '',
          description: entry.description ?? '',
          slug: entry.slug ?? '',
          group: entry.group ?? 'Docs',
          order: entry.order ?? 0,
          updatedAt: entry.updatedAt ?? '',
        }))
        .sort((left, right) => left.order - right.order || left.title.localeCompare(right.title))
    },
    { watch: [contentLocale], default: () => [] as DocsNavItem[] },
  )

  const groups = computed<DocsNavGroup[]>(() => {
    const grouped = new Map<string, DocsNavItem[]>()
    for (const doc of docs.value ?? []) {
      const items = grouped.get(doc.group) ?? []
      items.push(doc)
      grouped.set(doc.group, items)
    }
    return [...grouped.entries()].map(([name, items]) => ({ name, items }))
  })

  return { docs, groups, contentLocale }
}

import type { SiteLocale } from '#shared/types/docs'
import { LOCALE_DIRECTORIES } from '#shared/types/docs'
import { content } from '~/utils/content'

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
      const directory = LOCALE_DIRECTORIES[contentLocale.value]
      const entries = await content.list()
      return entries
        .filter((entry) => entry.path.startsWith(`/docs/${directory}/`))
        .map((entry) => ({
          title: entry.data.title ?? '',
          description: entry.data.description ?? '',
          slug: entry.data.slug ?? '',
          group: entry.data.group ?? 'Docs',
          order: entry.data.order ?? 0,
          updatedAt: entry.data.updatedAt ?? '',
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

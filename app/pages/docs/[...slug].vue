<script setup lang="ts">
import { MarkdownDocument } from '@comark/vue'
import { LOCALE_DIRECTORIES } from '#shared/types/docs'
import { content } from '~/utils/content'

const route = useRoute()
const { t, locale } = useI18n()
const localePath = useLocalePath()
const site = useSiteConfig()

const contentLocale = computed(() => toContentLocale(locale.value))
const slug = computed(() => {
  const value = route.params.slug
  return Array.isArray(value) ? value.join('/') : (value ?? '')
})

const { data } = await useAsyncData(
  () => `doc-${contentLocale.value}-${slug.value}`,
  async () => {
    if (!slug.value) return { page: null, fallback: false }

    const directory = LOCALE_DIRECTORIES[contentLocale.value]
    const primary = await content.get(`/docs/${directory}/${slug.value}`)
    if (primary) return { page: primary, fallback: false }

    if (contentLocale.value !== 'zh-CN') {
      const original = await content.get(`/docs/zh-cn/${slug.value}`)
      if (original) return { page: original, fallback: true }
    }

    return { page: null, fallback: false }
  },
  { watch: [contentLocale, slug] },
)

interface TocLink {
  id: string
  text: string
  depth: number
  children?: TocLink[]
}

const page = computed(() => data.value?.page ?? null)
const fallback = computed(() => data.value?.fallback ?? false)
const tocLinks = computed(() => (page.value?.meta?.toc as { links?: TocLink[] } | undefined)?.links ?? [])

if (!page.value) {
  throw createError({ statusCode: 404, statusMessage: t('docs.notFound') })
}

const canonical = computed(() => `${site.url}${localePath({ path: docsPath(locale.value, slug.value) })}`)

useSeoMeta({
  title: () => (page.value ? `${page.value.data.title}` : t('docs.notFound')),
  description: () => page.value?.data.description ?? '',
  ogType: 'article',
  articleModifiedTime: () => page.value?.data.updatedAt,
})

useHead(() => ({
  link: [{ rel: 'canonical', href: canonical.value }],
  script: [
    {
      type: 'application/ld+json',
      innerHTML: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'TechArticle',
        headline: page.value?.data.title,
        description: page.value?.data.description,
        inLanguage: contentLocale.value,
        dateModified: page.value?.data.updatedAt,
        mainEntityOfPage: canonical.value,
        publisher: { '@type': 'Organization', name: 'Axolotl Launcher', url: site.url },
      }),
    },
  ],
}))

const updatedLabel = computed(() => {
  if (!page.value?.data.updatedAt) return ''
  const date = new Date(page.value.data.updatedAt)
  if (Number.isNaN(date.getTime())) return ''
  return new Intl.DateTimeFormat(locale.value, { dateStyle: 'medium' }).format(date)
})
</script>

<template>
  <DocsShell v-if="page" :toc="tocLinks">
    <article class="max-w-4xl">
      <p class="font-mono text-micro font-semibold tracking-[0.22em] text-accent uppercase">{{ page.data.group }}</p>
      <h1 class="mt-4 text-section">{{ page.data.title }}</h1>
      <p v-if="page.data.description" class="mt-4 text-lead text-fg-muted">{{ page.data.description }}</p>

      <div class="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 text-caption text-fg-subtle">
        <span v-if="updatedLabel">{{ t('docs.updatedAt', { date: updatedLabel }) }}</span>
      </div>

      <div
        v-if="fallback"
        class="mt-6 rounded-card border border-accent/30 bg-accent-soft px-4 py-3 text-caption text-fg-muted"
        role="note"
      >
        {{ t('docs.translationFallback') }}
      </div>

      <div class="docs-prose prose mt-9 max-w-none">
        <MarkdownDocument :value="page" />
      </div>
    </article>
  </DocsShell>
</template>

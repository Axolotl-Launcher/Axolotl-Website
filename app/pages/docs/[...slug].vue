<script setup lang="ts">
import { MarkdownDocument } from '@comark/vue'
import { parseMarkdown as parseComark } from '@comark/vue/parse'
import shiki from '@comark/vue/plugins/shiki'
import toc from '@comark/vue/plugins/toc'

const route = useRoute()
const { t, locale } = useI18n()
const localePath = useLocalePath()
const site = useSiteConfig()
const { studioPath, prepareStudio, canEdit } = useStudioEdit()

const contentLocale = computed(() => toContentLocale(locale.value))
const slug = computed(() => {
  const value = route.params.slug
  return Array.isArray(value) ? value.join('/') : (value ?? '')
})

const { data } = await useAsyncData(
  () => `doc-${contentLocale.value}-${slug.value}`,
  async () => {
    if (!slug.value) return { page: null, fallback: false, document: null }

    const primary = await queryCollection('docs')
      .where('locale', '=', contentLocale.value)
      .where('slug', '=', slug.value)
      .first()
    if (primary) {
      return {
        page: primary,
        fallback: false,
        document: await parseComark(primary.rawbody ?? '', { plugins: [toc(), shiki()] }),
      }
    }

    if (contentLocale.value !== 'zh-CN') {
      const original = await queryCollection('docs')
        .where('locale', '=', 'zh-CN')
        .where('slug', '=', slug.value)
        .first()
      if (original) {
        return {
          page: original,
          fallback: true,
          document: await parseComark(original.rawbody ?? '', { plugins: [toc(), shiki()] }),
        }
      }
    }

    return { page: null, fallback: false, document: null }
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
const document = computed(() => data.value?.document ?? null)
const tocLinks = computed(() => (document.value?.meta?.toc as { links?: TocLink[] } | undefined)?.links ?? [])
const fallback = computed(() => data.value?.fallback ?? false)

if (!page.value) {
  throw createError({ statusCode: 404, statusMessage: t('docs.notFound') })
}

const canonical = computed(() => `${site.url}${localePath({ path: docsPath(locale.value, slug.value) })}`)

/** The subset of Comark's node transform this page relies on. */
interface MarkdownNodeTransformContext {
  tag: string
  props: Record<string, unknown>
}

/**
 * A fallback document is the Chinese original: its internal links point at
 * `/docs/…`, which would switch an English reader to the Chinese site. The
 * transform must be a stable reference — a new function on every render would
 * re-render the whole document — so it reads the current locale and fallback
 * flag itself instead of being rebuilt from them.
 */
const linkTransform = ({ tag, props }: MarkdownNodeTransformContext) => {
  if (!fallback.value || tag !== 'a') return undefined
  const href = props.href
  if (typeof href !== 'string') return undefined
  return { props: { ...props, href: rewriteDocsLink(href, locale.value) } }
}

useSeoMeta({
  title: () => (page.value ? `${page.value.title}` : t('docs.notFound')),
  description: () => page.value?.description ?? '',
  ogType: 'article',
  articleModifiedTime: () => page.value?.updatedAt,
})

useHead(() => ({
  link: [{ rel: 'canonical', href: canonical.value }],
  script: [
    {
      type: 'application/ld+json',
      innerHTML: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'TechArticle',
        headline: page.value?.title,
        description: page.value?.description,
        inLanguage: contentLocale.value,
        dateModified: page.value?.updatedAt,
        mainEntityOfPage: canonical.value,
        publisher: { '@type': 'Organization', name: 'Axolotl Launcher', url: site.url },
      }),
    },
  ],
}))

const updatedLabel = computed(() => {
  if (!page.value?.updatedAt) return ''
  const date = new Date(page.value.updatedAt)
  if (Number.isNaN(date.getTime())) return ''
  return new Intl.DateTimeFormat(locale.value, { dateStyle: 'medium' }).format(date)
})
</script>

<template>
  <DocsShell v-if="page && document" :toc="tocLinks">
    <article :data-content-id="page.id" class="max-w-4xl">
      <p class="eyebrow text-accent-strong">{{ page.group }}</p>
      <h1 class="mt-4 text-section">{{ page.title }}</h1>
      <p v-if="page.description" class="mt-4 text-lead text-fg-muted">{{ page.description }}</p>

      <div class="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 text-caption text-fg-subtle">
        <span v-if="updatedLabel">{{ t('docs.updatedAt', { date: updatedLabel }) }}</span>
        <a
          v-if="canEdit"
          :href="studioPath"
          class="ml-auto inline-flex items-center gap-1 font-semibold text-accent-strong"
          @click="prepareStudio"
        >
          {{ t('docs.edit') }} →
        </a>
      </div>

      <div
        v-if="fallback"
        class="mt-6 rounded-card border border-accent/30 bg-accent-soft px-4 py-3 text-caption text-fg-muted"
        role="note"
      >
        {{ t('docs.translationFallback') }}
      </div>

      <div class="docs-prose prose mt-9 max-w-none">
        <MarkdownDocument :value="document" :transform-node="linkTransform" />
      </div>
    </article>
  </DocsShell>
</template>

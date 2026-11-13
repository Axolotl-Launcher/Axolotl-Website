<script setup lang="ts">
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
    const primary = await queryCollection('docs')
      .where('locale', '=', contentLocale.value)
      .where('slug', '=', slug.value)
      .first()
    if (primary) return { page: primary, fallback: false }

    if (contentLocale.value !== 'zh-CN') {
      const original = await queryCollection('docs')
        .where('locale', '=', 'zh-CN')
        .where('slug', '=', slug.value)
        .first()
      if (original) return { page: original, fallback: true }
    }
    return { page: null, fallback: false }
  },
  { watch: [contentLocale, slug] },
)

const page = computed(() => data.value?.page)
const fallback = computed(() => data.value?.fallback ?? false)

if (!page.value) {
  throw createError({ statusCode: 404, statusMessage: t('docs.notFound') })
}

const canonical = computed(() => `${site.url}${localePath({ path: docsPath(locale.value, slug.value) })}`)

useSeoMeta({
  title: () => (page.value ? `${page.value.title} — Axolotl Launcher` : t('docs.notFound')),
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
  <DocsShell v-if="page" :toc="page.body?.toc?.links">
    <article class="max-w-3xl">
      <p class="font-mono text-micro font-semibold tracking-[0.22em] text-accent uppercase">{{ page.group }}</p>
      <h1 class="mt-4 text-section">{{ page.title }}</h1>
      <p v-if="page.description" class="mt-4 text-lead text-fg-muted">{{ page.description }}</p>

      <div class="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 text-caption text-fg-subtle">
        <span v-if="updatedLabel">{{ t('docs.updatedAt', { date: updatedLabel }) }}</span>
        <a
          v-if="page.feishu?.url"
          :href="page.feishu.url"
          target="_blank"
          rel="noopener noreferrer"
          class="link-underline inline-flex items-center gap-1.5 text-accent"
        >
          {{ t('docs.openInFeishu') }}
          <Icon name="lucide:arrow-up-right" class="size-3.5" />
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
        <ContentRenderer :value="page" />
      </div>
    </article>
  </DocsShell>
</template>

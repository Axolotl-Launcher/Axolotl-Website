<script setup lang="ts">
const route = useRoute()
const { t, locale } = useI18n()
const localePath = useLocalePath()
const site = useSiteConfig()

const contentLocale = computed(() => toContentLocale(locale.value))
const slug = computed(() => String(route.params.slug ?? ''))

const { data: article } = await useAsyncData(
  () => `article-${contentLocale.value}-${slug.value}`,
  () =>
    queryCollection('articles')
      .where('locale', '=', contentLocale.value)
      .where('path', '=', `/${contentLocale.value === 'zh-CN' ? 'zh-cn' : 'en-us'}/${slug.value}`)
      .first(),
  { watch: [contentLocale, slug] },
)

if (!article.value) {
  throw createError({ statusCode: 404, statusMessage: t('articles.empty') })
}

const canonical = computed(() => `${site.url}${localePath({ path: `/articles/${slug.value}` })}`)

function formatDate(value: string | undefined) {
  if (!value) return ''
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  return new Intl.DateTimeFormat(locale.value, { dateStyle: 'medium' }).format(date)
}

useSeoMeta({
  title: () => (article.value ? `${article.value.title} — Axolotl Launcher` : t('articles.title')),
  description: () => article.value?.description ?? '',
  ogType: 'article',
  articlePublishedTime: () => article.value?.publishedAt,
  articleModifiedTime: () => article.value?.updatedAt,
  ogImage: () => article.value?.cover,
})

useHead(() => ({
  link: [{ rel: 'canonical', href: canonical.value }],
  script: [
    {
      type: 'application/ld+json',
      innerHTML: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'Article',
        headline: article.value?.title,
        description: article.value?.description,
        datePublished: article.value?.publishedAt,
        dateModified: article.value?.updatedAt ?? article.value?.publishedAt,
        inLanguage: contentLocale.value,
        mainEntityOfPage: canonical.value,
        author: (article.value?.authors ?? []).map((name) => ({ '@type': 'Person', name })),
        publisher: { '@type': 'Organization', name: 'Axolotl Launcher', url: site.url },
      }),
    },
  ],
}))
</script>

<template>
  <article v-if="article" class="site-container max-w-3xl py-10 sm:py-14">
    <NuxtLink :to="localePath({ path: '/articles' })" class="link-underline text-caption font-semibold text-accent">
      ← {{ t('articles.backToArticles') }}
    </NuxtLink>

    <header class="mt-6">
      <div class="flex flex-wrap items-center gap-x-3 gap-y-1 text-micro text-fg-subtle">
        <time :datetime="article.publishedAt">{{
          t('articles.published', { date: formatDate(article.publishedAt) })
        }}</time>
        <span v-if="article.authors?.length">· {{ article.authors.join(', ') }}</span>
      </div>
      <h1 class="mt-4 text-section">{{ article.title }}</h1>
      <p v-if="article.description" class="mt-4 text-lead text-fg-muted">{{ article.description }}</p>
      <div v-if="article.tags?.length" class="mt-5 flex flex-wrap gap-2">
        <span
          v-for="tag in article.tags ?? []"
          :key="tag"
          class="rounded-full border border-border bg-surface-1 px-2.5 py-1 text-micro text-fg-subtle"
        >
          {{ tag }}
        </span>
      </div>
    </header>

    <NuxtImg
      v-if="article.cover"
      :src="article.cover"
      :alt="article.title"
      width="1280"
      height="640"
      class="mt-8 aspect-[2/1] w-full rounded-card border border-border object-cover"
    />

    <div class="docs-prose prose mt-9 max-w-none">
      <ContentRenderer :value="article" />
    </div>

    <p v-if="article.updatedAt" class="mt-10 border-t border-divider pt-4 text-caption text-fg-subtle">
      {{ t('articles.updated', { date: formatDate(article.updatedAt) }) }}
    </p>
  </article>
</template>

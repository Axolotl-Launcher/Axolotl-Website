<script setup lang="ts">
const { t, locale } = useI18n()
const localePath = useLocalePath()

const contentLocale = computed(() => toContentLocale(locale.value))
const { data: articles } = await useAsyncData(
  () => `articles-index-${contentLocale.value}`,
  () =>
    queryCollection('articles')
      .where('locale', '=', contentLocale.value)
      .where('draft', '=', false)
      .order('publishedAt', 'DESC')
      .all(),
  { watch: [contentLocale] },
)

function articleSlug(path: string) {
  return path.split('/').filter(Boolean).pop() ?? ''
}

function formatDate(value: string) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return new Intl.DateTimeFormat(locale.value, { dateStyle: 'medium' }).format(date)
}

useSeoMeta({
  title: () => `${t('articles.title')} — Axolotl Launcher`,
  description: () => t('articles.lead'),
  ogTitle: () => `${t('articles.title')} — Axolotl Launcher`,
  ogDescription: () => t('articles.lead'),
  ogType: 'website',
})
</script>

<template>
  <div class="site-container py-10 sm:py-14">
    <header class="max-w-2xl">
      <p class="font-mono text-micro font-semibold tracking-[0.22em] text-accent uppercase">
        {{ t('articles.eyebrow') }}
      </p>
      <h1 class="mt-4 text-section">{{ t('articles.title') }}</h1>
      <p class="mt-4 text-lead text-fg-muted">{{ t('articles.lead') }}</p>
    </header>

    <div v-if="articles?.length" class="mt-12 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
      <article
        v-for="article in articles"
        :key="article.path"
        class="group relative flex flex-col overflow-hidden rounded-card border border-border bg-surface-1 transition-colors hover:border-border-strong"
      >
        <NuxtImg
          v-if="article.cover"
          :src="article.cover"
          :alt="article.title"
          width="640"
          height="360"
          loading="lazy"
          class="aspect-video w-full object-cover"
        />
        <div class="flex flex-1 flex-col p-5">
          <div class="flex flex-wrap items-center gap-2 text-micro text-fg-subtle">
            <time :datetime="article.publishedAt">{{
              t('articles.published', { date: formatDate(article.publishedAt) })
            }}</time>
            <span v-if="article.tags?.length" aria-hidden="true">·</span>
            <span v-for="tag in (article.tags ?? []).slice(0, 2)" :key="tag" class="text-accent">{{ tag }}</span>
          </div>
          <h2 class="mt-3 text-card font-semibold">
            <NuxtLink
              :to="localePath({ path: `/articles/${articleSlug(article.path)}` })"
              class="after:absolute after:inset-0"
            >
              {{ article.title }}
            </NuxtLink>
          </h2>
          <p v-if="article.description" class="mt-2 line-clamp-3 text-body leading-relaxed text-fg-muted">
            {{ article.description }}
          </p>
          <span class="mt-auto pt-4 text-caption font-semibold text-accent">{{ t('articles.readArticle') }} →</span>
        </div>
      </article>
    </div>

    <p
      v-else
      class="mt-12 rounded-card border border-dashed border-border-strong bg-surface-1 p-8 text-body text-fg-muted"
    >
      {{ t('articles.empty') }}
    </p>
  </div>
</template>

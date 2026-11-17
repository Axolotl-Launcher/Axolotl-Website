<script setup lang="ts">
import { blogSlug } from '~~/shared/blog'

const { t, locale } = useI18n()
const localePath = useLocalePath()

const contentLocale = computed(() => toContentLocale(locale.value))
const { data: posts } = await useAsyncData(
  () => `blog-index-${contentLocale.value}`,
  () =>
    queryCollection('blog')
      .where('locale', '=', contentLocale.value)
      .where('draft', '=', false)
      .order('publishedAt', 'DESC')
      .all(),
  { watch: [contentLocale] },
)

function formatDate(value: string) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return new Intl.DateTimeFormat(locale.value, { dateStyle: 'medium' }).format(date)
}

useSeoMeta({
  title: () => `${t('blog.indexTitle')} — Axolotl Launcher`,
  description: () => t('blog.lead'),
  ogTitle: () => `${t('blog.indexTitle')} — Axolotl Launcher`,
  ogDescription: () => t('blog.lead'),
  ogType: 'website',
})
</script>

<template>
  <div class="site-container py-10 sm:py-14">
    <header class="max-w-2xl">
      <p class="font-mono text-micro font-semibold tracking-[0.22em] text-accent uppercase">
        {{ t('blog.eyebrow') }}
      </p>
      <h1 class="mt-4 text-section">{{ t('blog.indexTitle') }}</h1>
      <p class="mt-4 text-lead text-fg-muted">{{ t('blog.lead') }}</p>
    </header>

    <div v-if="posts?.length" class="mt-12 columns-1 gap-5 sm:columns-2 xl:columns-3">
      <article
        v-for="post in posts"
        :key="post.path"
        class="group relative mb-5 flex break-inside-avoid flex-col overflow-hidden rounded-card border border-border bg-surface-1 transition-colors hover:border-border-strong"
      >
        <NuxtImg
          v-if="post.cover"
          :src="post.cover"
          :alt="post.title"
          width="640"
          height="360"
          loading="lazy"
          class="aspect-video w-full object-cover"
        />
        <div class="flex flex-1 flex-col p-5">
          <div class="flex flex-wrap items-center gap-2 text-micro text-fg-subtle">
            <time :datetime="post.publishedAt">{{ formatDate(post.publishedAt) }}</time>
            <span v-if="post.tags?.length" aria-hidden="true">·</span>
            <span v-for="tag in (post.tags ?? []).slice(0, 2)" :key="tag" class="text-accent">{{ tag }}</span>
          </div>
          <h2 class="mt-3 text-card font-semibold">
            <NuxtLink :to="localePath({ path: `/blog/${blogSlug(post.stem)}` })" class="after:absolute after:inset-0">
              {{ post.title }}
            </NuxtLink>
          </h2>
          <p v-if="post.description" class="mt-2 line-clamp-3 text-body leading-relaxed text-fg-muted">
            {{ post.description }}
          </p>
          <span class="mt-auto pt-4 text-caption font-semibold text-accent">{{ t('blog.readMore') }} →</span>
        </div>
      </article>
    </div>

    <p
      v-else
      class="mt-12 rounded-card border border-dashed border-border-strong bg-surface-1 p-8 text-body text-fg-muted"
    >
      {{ t('blog.empty') }}
    </p>
  </div>
</template>

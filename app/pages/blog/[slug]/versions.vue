<script setup lang="ts">
import blogIndex from '~~/shared/blog-index.json'
import { BLOG_MAIN_AUTHOR, blogCoauthor, type BlogPost, type BlogVersion } from '~~/shared/blog'

const { t, locale } = useI18n()
const localePath = useLocalePath()
const route = useRoute()

const slug = computed(() => {
  const value = (route.params as Record<string, unknown>).slug
  return typeof value === 'string' ? value : ''
})
const post = computed(
  () =>
    (blogIndex.posts as BlogPost[]).find(
      (item) => item.slug === slug.value && item.locale === toContentLocale(locale.value),
    ) ?? null,
)
const versions = computed(() => (post.value ? [...post.value.versions].reverse() : []))
const articleTitle = computed(() => post.value?.versions.at(-1)?.title ?? t('blog.versionsTitle'))

function formatDate(timestamp: number) {
  return new Intl.DateTimeFormat(locale.value, { dateStyle: 'medium' }).format(new Date(timestamp * 1000))
}

function authors(version: BlogVersion) {
  const names = version.authors.length ? version.authors : [BLOG_MAIN_AUTHOR.name]
  return names.map((name) =>
    name === BLOG_MAIN_AUTHOR.name
      ? { name, avatar: BLOG_MAIN_AUTHOR.avatar }
      : { name, avatar: blogCoauthor(name).avatar },
  )
}

useSeoMeta({
  title: () => `${t('blog.versionsTitle')} — ${articleTitle.value}`,
  description: () => t('blog.versionsLead'),
})
</script>

<template>
  <div class="site-container site-container--wide py-10 sm:py-14">
    <div class="mx-auto max-w-4xl">
      <NuxtLink
        :to="localePath({ path: `/blog/${slug}` })"
        class="inline-flex items-center gap-1 text-caption font-semibold text-accent-strong"
      >
        ← {{ t('blog.backToArticle') }}
      </NuxtLink>

      <p class="mt-6 font-mono text-micro font-semibold tracking-[0.22em] text-accent uppercase">BLOG</p>
      <h1 class="mt-3 text-section text-balance">{{ articleTitle }}</h1>
      <p class="mt-3 text-lead text-fg-muted">{{ t('blog.versionsLead') }}</p>

      <ol v-if="versions.length" class="mt-8 space-y-3">
        <li v-for="version in versions" :key="version.timestamp">
          <NuxtLink
            :to="localePath({ path: `/blog/${slug}`, query: { t: version.timestamp } })"
            class="flex items-center justify-between gap-4 rounded-card border border-border bg-surface-1 p-4 transition-colors hover:border-border-strong"
          >
            <div class="min-w-0">
              <div class="flex flex-wrap items-center gap-2 text-micro text-fg-subtle">
                <time :datetime="new Date(version.timestamp * 1000).toISOString()">
                  {{ formatDate(version.timestamp) }}
                </time>
                <span v-if="version.isUpdate" class="rounded-pill bg-accent/10 px-2 py-0.5 font-semibold text-accent">
                  {{ t('blog.updated') }}
                </span>
              </div>
              <p v-if="version.description" class="mt-1 line-clamp-2 text-caption leading-relaxed text-fg-muted">
                {{ version.description }}
              </p>
            </div>
            <div class="flex shrink-0 items-center gap-3">
              <div class="flex -space-x-2">
                <img
                  v-for="author in authors(version)"
                  :key="author.name"
                  :src="author.avatar"
                  :alt="author.name"
                  :title="author.name"
                  width="32"
                  height="32"
                  class="size-8 rounded-full border-2 border-surface-0 bg-surface-2 object-cover"
                />
              </div>
              <Icon name="lucide:chevron-right" class="size-4 text-fg-subtle" aria-hidden="true" />
            </div>
          </NuxtLink>
        </li>
      </ol>
      <p v-else class="mt-8 text-caption text-fg-muted">{{ t('blog.empty') }}</p>
    </div>
  </div>
</template>

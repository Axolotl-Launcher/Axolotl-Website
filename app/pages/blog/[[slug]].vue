<script setup lang="ts">
import BlogAuthors from '~/components/blog/BlogAuthors.vue'
import BlogLicense from '~/components/blog/BlogLicense.vue'
import BlogTimeline from '~/components/blog/BlogTimeline.vue'
import blogIndex from '~~/shared/blog-index.json'
import { BLOG_MAIN_AUTHOR, type BlogPost, type BlogVersionEntry } from '~~/shared/blog'

const { t, locale } = useI18n()
const localePath = useLocalePath()
const route = useRoute()
const config = useRuntimeConfig()

const contentLocale = computed(() => toContentLocale(locale.value))
const posts = computed(() => (blogIndex.posts as BlogPost[]).filter((post) => post.locale === contentLocale.value))

const entries = computed<BlogVersionEntry[]>(() =>
  posts.value
    .flatMap((post) =>
      post.versions.map((version, index) => ({
        ...version,
        slug: post.slug,
        latest: index === post.versions.length - 1,
      })),
    )
    .sort((a, b) => b.timestamp - a.timestamp),
)

const slug = computed(() => {
  const value = (route.params as Record<string, unknown>).slug
  return typeof value === 'string' ? value : ''
})
const queryTimestamp = computed(() => {
  const value = Number(route.query.t)
  return Number.isFinite(value) && value > 0 ? value : null
})

const selectedPost = computed(() => {
  if (slug.value) return posts.value.find((post) => post.slug === slug.value) ?? null
  return posts.value.find((post) => post.slug === entries.value[0]?.slug) ?? null
})

if (slug.value && !selectedPost.value) {
  throw createError({ statusCode: 404, statusMessage: t('blog.notFound'), fatal: true })
}

const selectedVersion = computed(() => {
  if (!selectedPost.value) return null
  const versions = selectedPost.value.versions
  if (queryTimestamp.value) {
    return (
      versions.find((version) => version.timestamp === queryTimestamp.value) ??
      [...versions].reverse().find((version) => version.timestamp <= queryTimestamp.value!) ??
      versions[0]
    )
  }
  return versions[versions.length - 1] ?? null
})

const latestTimestamp = computed(() => selectedPost.value?.versions.at(-1)?.timestamp ?? null)
const isHistory = computed(
  () => Boolean(queryTimestamp.value) && selectedVersion.value?.timestamp !== latestTimestamp.value,
)
const latestLink = computed(() =>
  selectedPost.value ? localePath({ path: `/blog/${selectedPost.value.slug}` }) : localePath({ path: '/blog' }),
)
const dateText = computed(() =>
  selectedVersion.value
    ? new Intl.DateTimeFormat(locale.value, { dateStyle: 'long' }).format(
        new Date(selectedVersion.value.timestamp * 1000),
      )
    : '',
)
const bylineText = computed(() => {
  const authors = selectedVersion.value?.authors?.filter(Boolean) ?? []
  if (!authors.length) return BLOG_MAIN_AUTHOR.name
  return authors.join(locale.value.startsWith('zh') ? '、' : ', ')
})

useSeoMeta({
  title: () => (selectedVersion.value ? `${selectedVersion.value.title} — Axolotl Launcher` : t('blog.empty')),
  description: () => selectedVersion.value?.description ?? t('blog.lead'),
  robots: () => (isHistory.value ? 'noindex, follow' : 'index, follow'),
})

useHead(() => ({
  link: [{ rel: 'canonical', href: `${config.public.siteUrl}${latestLink.value}` }],
}))
</script>

<template>
  <div class="site-container site-container--wide py-10 sm:py-14">
    <div class="grid gap-10 lg:grid-cols-[15rem_minmax(0,1fr)] xl:grid-cols-[15rem_minmax(0,1fr)_16rem] xl:gap-12">
      <aside class="hidden lg:block">
        <div class="no-scrollbar sticky top-24 max-h-[calc(100dvh-8rem)] overflow-y-auto pr-2" data-lenis-prevent>
          <p class="font-mono text-micro font-semibold tracking-[0.18em] text-fg-subtle uppercase">
            {{ t('blog.timeline') }}
          </p>
          <BlogTimeline class="mt-4" :entries="entries" />
        </div>
      </aside>

      <div class="min-w-0">
        <details class="mb-6 rounded-panel border border-border bg-surface-1 p-4 lg:hidden">
          <summary class="flex cursor-pointer list-none items-center justify-between gap-3 text-sm font-semibold">
            {{ t('blog.timeline') }}
            <Icon name="lucide:chevron-down" class="size-4 transition-transform group-open:rotate-180" />
          </summary>
          <BlogTimeline class="mt-4" :entries="entries" />
        </details>

        <article v-if="selectedVersion" class="mx-auto max-w-3xl">
          <header>
            <div class="flex flex-wrap items-center justify-between gap-3">
              <p class="font-mono text-micro font-semibold tracking-[0.22em] text-accent uppercase">
                {{ t('blog.eyebrow') }}
              </p>
              <NuxtLink
                :to="localePath({ path: '/articles' })"
                class="inline-flex items-center gap-1 text-caption font-semibold text-accent-strong"
              >
                {{ t('blog.allArticles') }} →
              </NuxtLink>
            </div>
            <h1 class="mt-3 text-section text-balance">{{ selectedVersion.title }}</h1>
            <div class="mt-4 flex flex-wrap items-center gap-2 text-micro text-fg-subtle">
              <span class="inline-flex items-center gap-1 rounded-pill bg-surface-2 px-2 py-0.5">
                <Icon name="lucide:pen-line" class="size-3" aria-hidden="true" />
                {{ t('blog.byline') }} {{ bylineText }}
              </span>
              <span aria-hidden="true">·</span>
              <time :datetime="new Date(selectedVersion.timestamp * 1000).toISOString()">
                {{ dateText }}
              </time>
              <span
                v-if="selectedVersion.isUpdate"
                class="rounded-pill bg-accent/10 px-2 py-0.5 font-semibold text-accent"
              >
                {{ t('blog.updated') }}
              </span>
              <span v-if="isHistory" class="rounded-pill border border-border px-2 py-0.5">
                {{ t('blog.history') }}
              </span>
            </div>
            <p class="mt-4 text-lead text-fg-muted">{{ selectedVersion.description }}</p>
            <NuxtLink
              v-if="selectedPost"
              :to="localePath({ path: `/blog/${selectedPost.slug}/versions` })"
              class="mt-3 inline-flex items-center gap-1 text-caption font-semibold text-accent-strong"
            >
              {{ t('blog.versions') }} →
            </NuxtLink>
            <div
              v-if="isHistory"
              class="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-card border border-border bg-surface-1 px-4 py-3 text-caption text-fg-muted"
            >
              <span>{{ t('blog.historyNotice') }}</span>
              <NuxtLink :to="latestLink" class="font-semibold text-accent-strong">
                {{ t('blog.viewLatest') }} →
              </NuxtLink>
            </div>
          </header>
          <div class="docs-prose prose mt-8 max-w-none">
            <MDC :value="selectedVersion.body" />
          </div>
          <footer v-if="selectedVersion.tags.length" class="mt-12 border-t border-divider pt-6">
            <p class="font-mono text-micro font-semibold tracking-[0.16em] text-fg-subtle uppercase">
              {{ t('blog.tags') }}
            </p>
            <ul class="mt-3 flex flex-wrap gap-2">
              <li v-for="tag in selectedVersion.tags" :key="tag">
                <span
                  class="inline-flex items-center rounded-pill border border-border bg-surface-1 px-2.5 py-1 text-micro text-fg-muted"
                >
                  #{{ tag }}
                </span>
              </li>
            </ul>
          </footer>
        </article>
        <p v-else class="text-caption text-fg-muted">{{ t('blog.empty') }}</p>
      </div>

      <aside class="lg:col-span-2 xl:col-span-1">
        <div class="sticky top-24 space-y-4">
          <BlogAuthors v-if="selectedVersion" :authors="selectedVersion.authors" />
          <BlogLicense />
        </div>
      </aside>
    </div>
  </div>
</template>

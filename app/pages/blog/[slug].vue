<script setup lang="ts">
import { Markdown } from '@comark/vue'
import { parseMarkdown as parseComark } from '@comark/vue/parse'
import shiki from '@comark/vue/plugins/shiki'
import { BLOG_MAIN_AUTHOR, blogSlug, type BlogContentLocale, type BlogPost } from '~~/shared/blog'

const { t, locale } = useI18n()
const localePath = useLocalePath()
const route = useRoute()
const site = useSiteConfig()
const { sponsors } = useSponsors()
const { studioPath, prepareStudio } = useStudioEdit()

const contentLocale = computed(() => toContentLocale(locale.value))
const slug = computed(() => {
  const value = (route.params as Record<string, unknown>).slug
  return typeof value === 'string' ? value : ''
})

interface BlogCollectionItem {
  id: string
  path: string
  stem: string
  locale: BlogContentLocale
  title?: string
  description?: string
  publishedAt: string
  updatedAt: string
  authors?: string[]
  tags?: string[]
  cover?: string | null
  draft?: boolean
  sponsored?: boolean
  rawbody?: string
}

function toBlogPost(entry: BlogCollectionItem): BlogPost {
  return {
    id: entry.id,
    path: entry.path,
    stem: entry.stem,
    slug: blogSlug(entry.stem),
    locale: entry.locale,
    title: entry.title ?? '',
    description: entry.description ?? '',
    publishedAt: entry.publishedAt,
    updatedAt: entry.updatedAt,
    authors: entry.authors ?? [],
    tags: entry.tags ?? [],
    cover: entry.cover ?? null,
    draft: entry.draft ?? false,
    sponsored: entry.sponsored ?? false,
    rawbody: entry.rawbody,
  }
}

const { data } = await useAsyncData(
  () => `blog-post-${contentLocale.value}-${slug.value}`,
  async () => {
    const entries = await queryCollection('blog')
      .where('locale', '=', contentLocale.value)
      .where('draft', '=', false)
      .order('publishedAt', 'DESC')
      .all()
    const posts = entries.map(toBlogPost)
    const post = posts.find((entry) => entry.slug === slug.value) ?? null
    return {
      posts,
      post,
      document: post ? await parseComark(post.rawbody ?? '', { plugins: [shiki()] }) : null,
    }
  },
  { watch: [contentLocale, slug] },
)

const posts = computed(() => data.value?.posts ?? [])
const post = computed(() => data.value?.post ?? null)
const document = computed(() => data.value?.document ?? null)

if (!post.value) {
  throw createError({ statusCode: 404, statusMessage: t('blog.notFound'), fatal: true })
}

const canonical = computed(() => `${site.url}${localePath({ path: `/blog/${slug.value}` })}`)
const isUpdated = computed(() => post.value && post.value.updatedAt !== post.value.publishedAt)

function formatDate(value: string) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return new Intl.DateTimeFormat(locale.value, { dateStyle: 'long' }).format(date)
}

const publishedText = computed(() => (post.value ? formatDate(post.value.publishedAt) : ''))
const updatedText = computed(() => (post.value ? formatDate(post.value.updatedAt) : ''))
const bylineText = computed(() => {
  const authors = post.value?.authors.filter(Boolean) ?? []
  if (!authors.length) return BLOG_MAIN_AUTHOR.name
  return authors.join(locale.value.startsWith('zh') ? '、' : ', ')
})

useSeoMeta({
  title: () => (post.value ? `${post.value.title} — Axolotl Launcher` : t('blog.notFound')),
  description: () => post.value?.description ?? t('blog.lead'),
  ogType: 'article',
  articlePublishedTime: () => post.value?.publishedAt,
  articleModifiedTime: () => post.value?.updatedAt,
  robots: 'index, follow',
})

useHead(() => ({
  link: [{ rel: 'canonical', href: canonical.value }],
  script: [
    {
      type: 'application/ld+json',
      innerHTML: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'BlogPosting',
        headline: post.value?.title,
        description: post.value?.description,
        datePublished: post.value?.publishedAt,
        dateModified: post.value?.updatedAt,
        inLanguage: contentLocale.value,
        mainEntityOfPage: canonical.value,
        author: (post.value?.authors.length ? post.value.authors : [BLOG_MAIN_AUTHOR.name]).map((name) => ({
          '@type': 'Person',
          name,
        })),
        publisher: { '@type': 'Organization', name: 'Axolotl Launcher', url: site.url },
      }),
    },
  ],
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
          <BlogTimeline class="mt-4" :posts="posts" />
        </div>
      </aside>

      <div class="min-w-0">
        <details class="mb-6 rounded-panel border border-border bg-surface-1 p-4 lg:hidden">
          <summary class="flex cursor-pointer list-none items-center justify-between gap-3 text-sm font-semibold">
            {{ t('blog.timeline') }}
            <Icon name="lucide:chevron-down" class="size-4 transition-transform group-open:rotate-180" />
          </summary>
          <BlogTimeline class="mt-4" :posts="posts" />
        </details>

        <article v-if="post && document" :data-content-id="post.id" class="mx-auto max-w-3xl">
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
            <h1 class="mt-3 text-section text-balance">{{ post.title }}</h1>
            <div class="mt-4 flex flex-wrap items-center gap-2 text-micro text-fg-subtle">
              <span class="inline-flex items-center gap-1 rounded-pill bg-surface-2 px-2 py-0.5">
                <Icon name="lucide:pen-line" class="size-3" aria-hidden="true" />
                {{ t('blog.byline') }} {{ bylineText }}
              </span>
              <span aria-hidden="true">·</span>
              <time :datetime="post.publishedAt">{{ publishedText }}</time>
              <span v-if="isUpdated" class="rounded-pill bg-accent/10 px-2 py-0.5 font-semibold text-accent">
                {{ t('blog.updated') }} {{ updatedText }}
              </span>
              <a
                :href="studioPath"
                class="ml-auto inline-flex items-center gap-1 font-semibold text-accent-strong"
                @click="prepareStudio"
              >
                {{ t('blog.edit') }} →
              </a>
            </div>
            <p class="mt-4 text-lead text-fg-muted">{{ post.description }}</p>
          </header>
          <div class="docs-prose prose mt-8 max-w-none">
            <Markdown :value="post.rawbody ?? ''" :plugins="[shiki()]" />
          </div>
          <footer v-if="post.tags.length" class="mt-12 border-t border-divider pt-6">
            <p class="font-mono text-micro font-semibold tracking-[0.16em] text-fg-subtle uppercase">
              {{ t('blog.tags') }}
            </p>
            <ul class="mt-3 flex flex-wrap gap-2">
              <li v-for="tag in post.tags" :key="tag">
                <span
                  class="inline-flex items-center rounded-pill border border-border bg-surface-1 px-2.5 py-1 text-micro text-fg-muted"
                >
                  #{{ tag }}
                </span>
              </li>
            </ul>
          </footer>
          <SponsorInline v-if="post.sponsored" :sponsors="sponsors" :label="t('sponsors.article')" class="mt-8" />
        </article>
        <p v-else class="text-caption text-fg-muted">{{ t('blog.empty') }}</p>
      </div>

      <aside class="lg:col-span-2 xl:col-span-1">
        <div class="sticky top-24 space-y-4">
          <BlogAuthors v-if="post" :authors="post.authors" />
          <BlogLicense />
        </div>
      </aside>
    </div>
  </div>
</template>

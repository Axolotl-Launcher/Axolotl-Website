<script setup lang="ts">
import type { BlogPost } from '~~/shared/blog'

const props = defineProps<{ posts: BlogPost[] }>()

const { t, locale } = useI18n()
const localePath = useLocalePath()
const route = useRoute()

const currentSlug = computed(() => {
  const value = (route.params as Record<string, unknown>).slug
  return typeof value === 'string' ? value : ''
})

function link(post: BlogPost) {
  return localePath({ path: `/blog/${post.slug}` })
}

function isActive(post: BlogPost) {
  return post.slug === currentSlug.value
}

function isUpdated(post: BlogPost) {
  return post.updatedAt !== post.publishedAt
}

function formatDate(value: string) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return new Intl.DateTimeFormat(locale.value, { dateStyle: 'medium' }).format(date)
}
</script>

<template>
  <nav :aria-label="t('blog.timeline')">
    <ol class="relative space-y-1 border-l border-divider pl-4">
      <li v-for="post in props.posts" :key="post.path" class="relative">
        <span
          class="absolute top-3.5 -left-[1.32rem] size-2 rounded-full ring-2 ring-surface-0"
          :class="isActive(post) ? 'bg-accent' : 'bg-border-strong'"
          aria-hidden="true"
        />
        <NuxtLink
          :to="link(post)"
          class="block rounded-btn px-2 py-1.5 transition-colors"
          :class="isActive(post) ? 'bg-accent-soft text-accent' : 'text-fg-muted hover:bg-surface-2 hover:text-fg'"
        >
          <span class="flex items-center justify-between gap-2 text-micro text-fg-subtle">
            <time :datetime="post.publishedAt">{{ formatDate(post.publishedAt) }}</time>
            <span
              v-if="isUpdated(post)"
              class="rounded-pill bg-accent/10 px-1.5 py-0.5 text-[0.625rem] font-semibold text-accent"
            >
              {{ t('blog.updated') }}
            </span>
          </span>
          <span class="mt-0.5 block text-caption leading-snug font-semibold">{{ post.title }}</span>
        </NuxtLink>
      </li>
    </ol>
  </nav>
</template>

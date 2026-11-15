<script setup lang="ts">
import type { BlogVersionEntry } from '~~/shared/blog'

const props = defineProps<{ entries: BlogVersionEntry[] }>()

const { t, locale } = useI18n()
const localePath = useLocalePath()
const route = useRoute()

const currentSlug = computed(() => {
  const value = (route.params as Record<string, unknown>).slug
  return typeof value === 'string' ? value : ''
})
const currentTimestamp = computed(() => Number(route.query.t))

function link(entry: BlogVersionEntry) {
  return localePath({ path: `/blog/${entry.slug}`, query: { t: entry.timestamp } })
}

function isActive(entry: BlogVersionEntry) {
  if (currentSlug.value) {
    if (entry.slug !== currentSlug.value) return false
    return currentTimestamp.value ? entry.timestamp === currentTimestamp.value : entry.latest
  }
  return entry.timestamp === props.entries[0]?.timestamp
}

function formatDate(timestamp: number) {
  return new Intl.DateTimeFormat(locale.value, { dateStyle: 'medium' }).format(new Date(timestamp * 1000))
}
</script>

<template>
  <nav :aria-label="t('blog.timeline')">
    <ol class="relative space-y-1 border-l border-divider pl-4">
      <li v-for="entry in props.entries" :key="`${entry.slug}-${entry.timestamp}`" class="relative">
        <span
          class="absolute top-3.5 -left-[1.32rem] size-2 rounded-full ring-2 ring-surface-0"
          :class="isActive(entry) ? 'bg-accent' : 'bg-border-strong'"
          aria-hidden="true"
        />
        <NuxtLink
          :to="link(entry)"
          class="block rounded-btn px-2 py-1.5 transition-colors"
          :class="isActive(entry) ? 'bg-accent-soft text-accent' : 'text-fg-muted hover:bg-surface-2 hover:text-fg'"
        >
          <span class="flex items-center justify-between gap-2 text-micro text-fg-subtle">
            <time :datetime="new Date(entry.timestamp * 1000).toISOString()">
              {{ formatDate(entry.timestamp) }}
            </time>
            <span
              v-if="entry.isUpdate"
              class="rounded-pill bg-accent/10 px-1.5 py-0.5 text-[0.625rem] font-semibold text-accent"
            >
              {{ t('blog.updated') }}
            </span>
          </span>
          <span class="mt-0.5 block text-caption leading-snug font-semibold">{{ entry.title }}</span>
        </NuxtLink>
      </li>
    </ol>
  </nav>
</template>

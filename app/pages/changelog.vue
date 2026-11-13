<script setup lang="ts">
import catalog from '../../releases/catalog.json'

interface LocalizedText {
  'zh-CN'?: string
  'en-US'?: string
  [locale: string]: string | undefined
}

interface ChangeGroup {
  added?: LocalizedText[]
  changed?: LocalizedText[]
  fixed?: LocalizedText[]
}

interface Announcement {
  id: string
  version: string
  publishedAt: string
  title: LocalizedText
  changes: ChangeGroup
}

const { t, locale } = useI18n()
const config = useRuntimeConfig()

const announcements = (catalog.announcements as Announcement[])
  .slice()
  .sort((a, b) => b.publishedAt.localeCompare(a.publishedAt))
const visible = ref(12)
const hasMore = computed(() => visible.value < announcements.length)

const changeKinds = [
  { key: 'added' as const, label: 'changelog.added' },
  { key: 'changed' as const, label: 'changelog.changed' },
  { key: 'fixed' as const, label: 'changelog.fixed' },
]

function localized(value: LocalizedText | undefined) {
  if (!value) return ''
  return value[locale.value] ?? value['en-US'] ?? value['zh-CN'] ?? ''
}

function changesOf(group: ChangeGroup | undefined, key: keyof ChangeGroup) {
  return (group?.[key] ?? []).map(localized).filter(Boolean)
}

function formatDate(value: string) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return new Intl.DateTimeFormat(locale.value, { dateStyle: 'long' }).format(date)
}

useSeoMeta({
  title: `${t('changelog.title')} — Axolotl Launcher`,
  description: t('changelog.lead'),
  ogTitle: `${t('changelog.title')} — Axolotl Launcher`,
  ogDescription: t('changelog.lead'),
  ogType: 'website',
})
</script>

<template>
  <div class="site-container py-10 sm:py-14">
    <header class="max-w-2xl">
      <p class="font-mono text-micro font-semibold tracking-[0.22em] text-accent uppercase">
        {{ t('changelog.eyebrow') }}
      </p>
      <h1 class="mt-4 text-section">{{ t('changelog.title') }}</h1>
      <p class="mt-4 text-lead text-fg-muted">{{ t('changelog.lead') }}</p>
    </header>

    <ol v-if="announcements.length" class="mt-12 border-l border-divider">
      <li
        v-for="(entry, index) in announcements"
        v-show="index < visible"
        :key="entry.id"
        class="relative pb-12 pl-6 last:pb-0 sm:pl-8"
      >
        <span
          class="absolute top-2 -left-[5px] size-[9px] rounded-full border-2 border-surface-0 bg-accent"
          aria-hidden="true"
        />
        <div class="flex flex-wrap items-baseline gap-x-3 gap-y-1">
          <h2 class="text-card font-semibold">{{ localized(entry.title) || entry.version }}</h2>
          <span class="rounded-full border border-border bg-surface-1 px-2 py-0.5 font-mono text-micro text-fg-subtle">
            v{{ entry.version }}
          </span>
          <time :datetime="entry.publishedAt" class="text-caption text-fg-subtle">
            {{ t('changelog.published', { date: formatDate(entry.publishedAt) }) }}
          </time>
        </div>

        <div class="mt-5 space-y-4">
          <div v-for="kind in changeKinds" :key="kind.key">
            <template v-if="changesOf(entry.changes, kind.key).length">
              <p class="font-mono text-micro font-semibold tracking-[0.16em] text-fg-subtle uppercase">
                {{ t(kind.label) }}
              </p>
              <ul class="mt-2 space-y-1.5">
                <li
                  v-for="(change, changeIndex) in changesOf(entry.changes, kind.key)"
                  :key="`${entry.id}-${kind.key}-${changeIndex}`"
                  class="flex gap-2 text-body leading-relaxed text-fg-muted"
                >
                  <span class="mt-[0.62em] size-1 shrink-0 rounded-full bg-border-strong" aria-hidden="true" />
                  {{ change }}
                </li>
              </ul>
            </template>
          </div>
        </div>

        <a
          :href="`${config.public.githubUrl}/releases/tag/v${entry.version}`"
          target="_blank"
          rel="noopener noreferrer"
          class="link-underline mt-5 inline-flex items-center gap-1.5 text-caption font-semibold text-accent"
        >
          {{ t('changelog.viewRelease') }}
          <Icon name="lucide:arrow-up-right" class="size-3.5" />
        </a>
      </li>
    </ol>

    <p v-else class="mt-12 text-body text-fg-muted">{{ t('changelog.empty') }}</p>

    <div v-if="hasMore" class="mt-4 border-t border-divider pt-6">
      <BaseButton variant="secondary" @click="visible += 12">{{ t('changelog.loadMore') }}</BaseButton>
    </div>
  </div>
</template>

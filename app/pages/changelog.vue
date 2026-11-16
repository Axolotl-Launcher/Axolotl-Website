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

const allAnnouncements = (catalog.announcements as Announcement[])
  .slice()
  .sort((a, b) => b.publishedAt.localeCompare(a.publishedAt))

// Tabs and filtering come from the channel registry, so a new channel only
// needs a definition there and a label in the locale files.
const channel = ref(changelogChannels[0].value)
const channelTabs = computed(() => changelogChannels.map((item) => ({ value: item.value, label: t(item.labelKey) })))
const activeChannel = computed(
  () => changelogChannels.find((item) => item.value === channel.value) ?? changelogChannels[0],
)
const announcements = computed(() => allAnnouncements.filter((entry) => activeChannel.value.matches(entry)))

const visible = ref(12)
const hasMore = computed(() => visible.value < announcements.value.length)

watch(channel, () => {
  visible.value = 12
})

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
  title: `${t('changelog.title')}`,
  description: t('changelog.lead'),
  ogTitle: `${t('changelog.title')}`,
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

    <BaseTabs v-model="channel" class="mt-8" :options="channelTabs" :label="t('changelog.channelLabel')" />

    <Transition
      mode="out-in"
      enter-active-class="transition duration-200 ease-out motion-reduce:transition-none"
      enter-from-class="translate-y-1 opacity-0"
      enter-to-class="translate-y-0 opacity-100"
      leave-active-class="transition duration-150 ease-in motion-reduce:transition-none"
      leave-from-class="translate-y-0 opacity-100"
      leave-to-class="-translate-y-1 opacity-0"
    >
      <ol v-if="announcements.length" :key="channel" class="mt-10 border-l border-divider">
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
            <span
              class="rounded-full border border-border bg-surface-1 px-2 py-0.5 font-mono text-micro text-fg-subtle"
            >
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

      <p v-else :key="`${channel}-empty`" class="mt-12 text-body text-fg-muted">{{ t('changelog.empty') }}</p>
    </Transition>

    <div v-if="hasMore" class="mt-4 border-t border-divider pt-6">
      <BaseButton variant="secondary" @click="visible += 12">{{ t('changelog.loadMore') }}</BaseButton>
    </div>
  </div>
</template>

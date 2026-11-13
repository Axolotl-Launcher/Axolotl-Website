<script setup lang="ts">
import data from '~/data/supporters.json'

interface Supporter {
  userId: string
  name: string
  avatarUrl: string
  profileUrl: string
  lastSupportedAt: string
}

const { t } = useI18n()
const localePath = useLocalePath()
const supporters = computed(() => (data.supporters as Supporter[]).filter((person) => person.name))

function initials(name: string) {
  return [...name].slice(0, 2).join('').toUpperCase()
}

useSeoMeta({
  title: () => `${t('thanks.title')} — Axolotl Launcher`,
  description: () => t('thanks.lead'),
  ogTitle: () => `${t('thanks.title')} — Axolotl Launcher`,
  ogDescription: () => t('thanks.lead'),
  ogType: 'website',
})
</script>

<template>
  <div class="site-container py-10 sm:py-14">
    <header class="max-w-2xl">
      <p class="font-mono text-micro font-semibold tracking-[0.22em] text-accent uppercase">
        {{ t('thanks.eyebrow') }}
      </p>
      <h1 class="mt-4 text-section">{{ t('thanks.title') }}</h1>
      <p class="mt-4 text-lead text-fg-muted">{{ t('thanks.lead') }}</p>
      <p class="mt-4 text-caption text-fg-subtle">{{ t('thanks.count', { count: supporters.length }) }}</p>
    </header>

    <ul v-if="supporters.length" class="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      <li v-for="person in supporters" :key="person.userId">
        <a
          :href="person.profileUrl"
          target="_blank"
          rel="noopener noreferrer"
          class="flex items-center gap-3 rounded-card border border-border bg-surface-1 p-4 no-underline transition-colors hover:border-border-strong hover:bg-surface-2"
        >
          <span
            class="grid size-10 shrink-0 place-items-center rounded-full bg-accent-soft text-caption font-bold text-accent"
            aria-hidden="true"
          >
            {{ initials(person.name) }}
          </span>
          <span class="min-w-0">
            <span class="block truncate text-body font-semibold text-fg">{{ person.name }}</span>
            <span class="block text-micro text-fg-subtle">Afdian</span>
          </span>
          <Icon name="lucide:arrow-up-right" class="ml-auto size-4 text-fg-subtle" />
        </a>
      </li>
    </ul>

    <p
      v-else
      class="mt-10 rounded-card border border-dashed border-border-strong bg-surface-1 p-8 text-body text-fg-muted"
    >
      {{ t('thanks.empty') }}
    </p>

    <div class="mt-10">
      <BaseButton :to="localePath({ path: '/support' })" variant="secondary">{{
        t('thanks.backToSupport')
      }}</BaseButton>
    </div>
  </div>
</template>

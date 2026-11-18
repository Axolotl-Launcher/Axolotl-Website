<script setup lang="ts">
const { t } = useI18n()
const localePath = useLocalePath()
const config = useRuntimeConfig()
const demoPath = computed(() => config.public.launcherDemo.replace(/\/$/, ''))
const demoAvailable = computed(() => Boolean(demoPath.value))

const title = computed(() => `${t('demo.title')}`)

useSeoMeta({
  title: () => title.value,
  description: () => t('demo.lead'),
  ogTitle: () => title.value,
  ogDescription: () => t('demo.lead'),
  ogType: 'website',
})
</script>

<template>
  <div class="site-container py-8 sm:py-10">
    <header class="mx-auto flex max-w-5xl flex-wrap items-end justify-between gap-4">
      <div class="max-w-xl">
        <p class="eyebrow text-accent-strong">
          {{ t('demo.eyebrow') }}
        </p>
        <h1 class="mt-3 text-section">{{ t('demo.title') }}</h1>
        <p class="mt-3 text-body text-fg-muted">{{ t('demo.lead') }}</p>
      </div>
      <BaseButton :to="localePath({ path: '/download' })" variant="secondary" size="sm">
        {{ t('demo.download') }}
      </BaseButton>
    </header>

    <div class="mx-auto mt-8 max-w-5xl">
      <LauncherDemo v-if="demoAvailable" :label="t('demo.title')" :src="demoPath" class="shadow-floating" />
      <div
        v-else
        class="flex aspect-[1280/800] items-center justify-center rounded-[10px] border border-border bg-surface-2 p-8 text-center"
      >
        <div class="max-w-sm">
          <Icon name="lucide:monitor-off" class="mx-auto size-8 text-fg-subtle" aria-hidden="true" />
          <p class="mt-4 text-body text-fg-muted">{{ t('demo.unavailable') }}</p>
          <BaseButton :to="localePath({ path: '/download' })" class="mt-5">{{ t('demo.download') }}</BaseButton>
        </div>
      </div>
    </div>
  </div>
</template>

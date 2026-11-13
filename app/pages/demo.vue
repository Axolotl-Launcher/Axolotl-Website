<script setup lang="ts">
const { t } = useI18n()
const config = useRuntimeConfig()
const demoPath = computed(() => config.public.launcherDemo.replace(/\/$/, ''))

const title = computed(() => `${t('demo.title')} — Axolotl Launcher`)

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
        <p class="font-mono text-micro font-semibold tracking-[0.22em] text-accent uppercase">
          {{ t('demo.eyebrow') }}
        </p>
        <h1 class="mt-3 text-section">{{ t('demo.title') }}</h1>
        <p class="mt-3 text-body text-fg-muted">{{ t('demo.lead') }}</p>
      </div>
      <BaseButton to="/download" variant="secondary" size="sm">{{ t('demo.download') }}</BaseButton>
    </header>

    <div class="mx-auto mt-8 max-w-5xl">
      <LauncherDemo :label="t('demo.title')" :src="demoPath" class="shadow-floating" />
    </div>
  </div>
</template>

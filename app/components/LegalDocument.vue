<script setup lang="ts">
defineProps<{
  eyebrow: string
  title: string
  description: string
  updatedAt: string
}>()

const { t } = useI18n()
</script>

<template>
  <article class="site-container max-w-3xl py-10 sm:py-14">
    <header class="max-w-2xl">
      <p class="font-mono text-micro font-semibold tracking-[0.22em] text-accent uppercase">{{ eyebrow }}</p>
      <h1 class="mt-4 text-section">{{ title }}</h1>
      <p class="mt-4 text-lead text-fg-muted">{{ description }}</p>
      <p class="mt-4 text-caption text-fg-subtle">{{ t('legal.updated', { date: updatedAt }) }}</p>
    </header>

    <div class="docs-prose prose mt-9 max-w-none rounded-card border border-border bg-surface-1 p-6 sm:p-9">
      <slot />
    </div>
  </article>
</template>

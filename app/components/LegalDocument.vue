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
  <article class="mx-auto w-full max-w-[48rem] py-10 sm:py-14">
    <header>
      <p class="eyebrow text-accent-strong">{{ eyebrow }}</p>
      <h1 class="mt-4 text-section">{{ title }}</h1>
      <p class="mt-4 text-lead text-fg-muted">{{ description }}</p>
      <p class="mt-4 text-caption text-fg-subtle">{{ t('legal.updated', { date: updatedAt }) }}</p>
    </header>

    <div class="docs-prose prose mt-9 max-w-none rounded-card border border-border bg-surface-1 p-6 sm:p-9">
      <slot />
    </div>
  </article>
</template>

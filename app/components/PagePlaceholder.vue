<script setup lang="ts">
defineProps<{
  eyebrow?: string
  title: string
  description?: string
}>()
</script>

<template>
  <section class="site-container py-section">
    <p v-if="eyebrow" class="font-mono text-micro font-semibold tracking-[0.18em] text-accent uppercase">
      {{ eyebrow }}
    </p>
    <h1 class="mt-4 text-display">{{ title }}</h1>
    <p v-if="description" class="mt-5 max-w-2xl text-lead text-fg-muted">{{ description }}</p>
    <slot />
  </section>
</template>

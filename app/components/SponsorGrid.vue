<script setup lang="ts">
import type { Sponsor } from '~/types/sponsors'

defineProps<{ sponsors: Sponsor[] }>()

const { t } = useI18n()
</script>

<template>
  <div class="grid gap-4 md:grid-cols-3">
    <a
      v-for="sponsor in sponsors"
      :key="sponsor.id"
      :href="sponsor.url"
      target="_blank"
      rel="sponsored noopener noreferrer"
      class="group relative isolate overflow-hidden rounded-panel border border-border bg-surface-1 p-6 transition-colors select-none hover:border-border-strong"
    >
      <span
        class="pointer-events-none absolute -top-12 -right-12 size-32 rounded-full bg-accent/10 opacity-0 blur-2xl transition-opacity group-hover:opacity-100"
        aria-hidden="true"
      />
      <img
        :src="sponsor.logo"
        alt=""
        width="160"
        height="40"
        loading="lazy"
        decoding="async"
        class="h-10 w-auto max-w-[10rem] opacity-80 dark:brightness-0 dark:invert"
      />
      <h3 class="mt-5 text-card font-semibold">{{ sponsor.name }}</h3>
      <p class="mt-2 text-caption leading-relaxed text-fg-muted">{{ sponsor.description }}</p>
      <span class="mt-4 inline-flex items-center gap-1 text-caption font-semibold text-accent-strong">
        {{ t('sponsors.visit') }}
        <Icon
          name="lucide:arrow-up-right"
          class="size-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 motion-reduce:transform-none"
          aria-hidden="true"
        />
      </span>
    </a>
  </div>
</template>

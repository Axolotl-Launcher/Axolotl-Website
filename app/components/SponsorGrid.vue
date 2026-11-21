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
      class="group relative isolate flex flex-col overflow-hidden rounded-panel border border-border bg-surface-1 p-6 transition-colors select-none hover:border-border-strong"
    >
      <span
        class="pointer-events-none absolute -top-12 -right-12 size-32 rounded-full bg-accent/10 opacity-0 blur-2xl transition-opacity group-hover:opacity-100"
        aria-hidden="true"
      />
      <img
        :src="sponsor.logoLight"
        alt=""
        loading="lazy"
        decoding="async"
        class="block h-14 object-contain dark:hidden"
      />
      <img
        :src="sponsor.logoDark"
        alt=""
        loading="lazy"
        decoding="async"
        class="hidden h-14 object-contain dark:block"
      />
      <h3 class="mt-5 text-card font-semibold">{{ sponsor.name }}</h3>
      <p class="mt-2 text-caption leading-relaxed text-fg-muted">{{ sponsor.description }}</p>
      <span class="mt-auto inline-flex items-center gap-1 pt-4 text-caption font-semibold text-accent-strong">
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

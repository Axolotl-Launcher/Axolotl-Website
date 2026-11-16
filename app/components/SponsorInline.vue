<script setup lang="ts">
import type { Sponsor } from '~/types/sponsors'

defineProps<{ sponsors: Sponsor[]; label?: string }>()
</script>

<template>
  <div>
    <p v-if="label" class="font-mono text-micro font-semibold tracking-[0.16em] text-fg-subtle uppercase">
      {{ label }}
    </p>
    <ul class="mt-3 flex flex-col gap-2 sm:flex-row">
      <li v-for="sponsor in sponsors" :key="sponsor.id" class="sm:flex-1">
        <a
          :href="sponsor.url"
          target="_blank"
          rel="sponsored noopener noreferrer"
          class="group flex h-full items-center gap-3 rounded-card border border-border bg-surface-1 px-4 py-3 transition-colors hover:border-border-strong"
        >
          <img
            :src="sponsor.logo"
            alt=""
            width="96"
            height="24"
            loading="lazy"
            decoding="async"
            class="h-6 w-auto max-w-[6rem] shrink-0 opacity-80 dark:brightness-0 dark:invert"
          />
          <span class="min-w-0 flex-1 truncate text-caption font-semibold text-fg">{{ sponsor.name }}</span>
          <Icon
            name="lucide:arrow-up-right"
            class="size-3.5 shrink-0 text-fg-subtle transition-colors group-hover:text-accent"
            aria-hidden="true"
          />
        </a>
      </li>
    </ul>
  </div>
</template>

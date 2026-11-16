<script setup lang="ts">
import type { Sponsor } from '~/types/sponsors'

defineProps<{ sponsors: Sponsor[]; label?: string }>()
</script>

<template>
  <div>
    <p v-if="label" class="font-mono text-micro font-semibold tracking-[0.16em] text-fg-subtle uppercase">
      {{ label }}
    </p>
    <ul class="mt-3 flex flex-wrap items-center gap-x-10 gap-y-5">
      <li v-for="sponsor in sponsors" :key="sponsor.id">
        <a
          :href="sponsor.url"
          target="_blank"
          rel="sponsored noopener noreferrer"
          class="inline-flex opacity-70 transition-opacity hover:opacity-100"
        >
          <img
            :src="sponsor.logo"
            :alt="sponsor.name"
            width="96"
            height="24"
            loading="lazy"
            decoding="async"
            class="h-6 w-auto max-w-[7rem] dark:brightness-0 dark:invert"
          />
        </a>
      </li>
    </ul>
  </div>
</template>

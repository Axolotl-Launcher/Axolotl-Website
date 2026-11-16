<script setup lang="ts">
import type { Sponsor } from '~/types/sponsors'

defineProps<{ sponsors: Sponsor[] }>()
</script>

<template>
  <ul class="grid grid-cols-1 items-center gap-8 sm:grid-cols-3">
    <li v-for="sponsor in sponsors" :key="sponsor.id" class="flex justify-center">
      <a
        :href="sponsor.url"
        target="_blank"
        rel="sponsored noopener noreferrer"
        class="inline-flex opacity-70 transition-opacity hover:opacity-100"
      >
        <img
          :src="sponsor.logo"
          :alt="sponsor.name"
          width="160"
          height="40"
          loading="lazy"
          decoding="async"
          class="h-10 w-auto max-w-[10rem] dark:brightness-0 dark:invert"
        />
      </a>
    </li>
  </ul>
</template>

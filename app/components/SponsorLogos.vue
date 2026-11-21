<script setup lang="ts">
import type { Sponsor } from '~/types/sponsors'

defineProps<{ sponsors: Sponsor[] }>()
</script>

<template>
  <ul class="flex flex-wrap items-center gap-x-6 gap-y-3 select-none">
    <li v-for="sponsor in sponsors" :key="sponsor.id">
      <a
        :href="sponsor.url"
        target="_blank"
        rel="sponsored noopener noreferrer"
        class="inline-flex opacity-70 transition-opacity hover:opacity-100"
      >
        <img
          :src="sponsor.logoLight"
          :alt="sponsor.name"
          width="120"
          height="30"
          loading="lazy"
          decoding="async"
          class="h-5 w-auto max-w-[7.5rem] block dark:hidden"
        />
        <img
          :src="sponsor.logoDark"
          :alt="sponsor.name"
          width="120"
          height="30"
          loading="lazy"
          decoding="async"
          class="h-5 w-auto max-w-[7.5rem] hidden dark:block"
        />
      </a>
    </li>
  </ul>
</template>

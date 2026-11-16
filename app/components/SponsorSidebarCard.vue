<script setup lang="ts">
import type { Sponsor } from '~/types/sponsors'

const props = defineProps<{ sponsor: Sponsor; dismissible?: boolean; storageKey?: string }>()

const { t } = useI18n()
const dismissed = ref(false)
const storageId = computed(() => `axolotl:sponsor-dismissed:${props.storageKey ?? props.sponsor.id}`)

onMounted(() => {
  try {
    dismissed.value = localStorage.getItem(storageId.value) === '1'
  } catch {
    dismissed.value = false
  }
})

function dismiss() {
  dismissed.value = true
  try {
    localStorage.setItem(storageId.value, '1')
  } catch {
    // Storage can be unavailable in private browsing; hiding for this visit is enough.
  }
}
</script>

<template>
  <div v-if="!dismissed" class="relative rounded-card border border-border bg-surface-1 p-3">
    <button
      v-if="dismissible"
      type="button"
      class="absolute top-1.5 right-1.5 grid size-6 place-items-center rounded-full text-fg-subtle transition-colors hover:bg-surface-2 hover:text-fg"
      :aria-label="t('sponsors.dismiss')"
      @click="dismiss"
    >
      <Icon name="lucide:x" class="size-3.5" aria-hidden="true" />
    </button>
    <p class="pr-7 font-mono text-micro font-semibold tracking-[0.16em] text-fg-subtle uppercase">
      {{ t('sponsors.docs') }}
    </p>
    <a :href="sponsor.url" target="_blank" rel="sponsored noopener noreferrer" class="mt-2 block">
      <img
        :src="sponsor.logo"
        :alt="sponsor.name"
        width="120"
        height="30"
        loading="lazy"
        decoding="async"
        class="h-7 w-auto max-w-[7.5rem] opacity-80 dark:brightness-0 dark:invert"
      />
      <span class="mt-2 block text-micro leading-relaxed text-fg-muted">{{ sponsor.description }}</span>
      <span class="mt-2 inline-flex items-center gap-1 text-micro font-semibold text-accent-strong">
        {{ t('sponsors.visit') }} →
      </span>
    </a>
  </div>
</template>

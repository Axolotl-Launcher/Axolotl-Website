<script setup lang="ts">
import { useIntersectionObserver, useLocalStorage, useMediaQuery } from '@vueuse/core'
import type { Sponsor } from '~/types/sponsors'

const props = withDefaults(
  defineProps<{
    sponsors: Sponsor[]
    dismissible?: boolean
    storageKey?: string
    startIndex?: number
  }>(),
  { dismissible: false, storageKey: 'docs', startIndex: 0 },
)

const { t } = useI18n()
const root = ref<HTMLElement>()
const paused = ref(false)
const visible = ref(true)
const index = ref(props.sponsors.length ? props.startIndex % props.sponsors.length : 0)
const current = computed(() => props.sponsors[index.value] ?? null)
const storageId = computed(() => `axolotl:sponsor-dismissed:${props.storageKey}`)
// Both documentation sponsor cards use the same key, so dismissing one hides
// both; VueUse syncs same-tab instances through its custom storage event.
const dismissed = useLocalStorage(storageId, false)
const reducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)')
let timer: ReturnType<typeof setInterval> | undefined

useIntersectionObserver(
  root,
  ([entry]) => {
    visible.value = entry?.isIntersecting ?? true
  },
  { threshold: 0 },
)

function stopTimer() {
  if (timer) {
    clearInterval(timer)
    timer = undefined
  }
}

function startTimer() {
  stopTimer()
  if (dismissed.value || props.sponsors.length < 2) return
  if (reducedMotion.value) return
  timer = setInterval(() => {
    // Offscreen cards do not rotate.
    if (!paused.value && !dismissed.value && visible.value) {
      index.value = (index.value + 1) % props.sponsors.length
    }
  }, 6000)
}

onMounted(startTimer)

onBeforeUnmount(stopTimer)

function select(next: number) {
  index.value = next
  startTimer()
}

function dismiss() {
  dismissed.value = true
  stopTimer()
}
</script>

<template>
  <div
    v-if="!dismissed && sponsors.length"
    ref="root"
    class="relative rounded-card border border-border bg-surface-1 px-3 pt-3 pb-10 select-none"
    @mouseenter="paused = true"
    @mouseleave="paused = false"
    @focusin="paused = true"
    @focusout="paused = false"
  >
    <button
      v-if="dismissible"
      type="button"
      class="absolute top-1.5 right-1.5 grid size-6 place-items-center rounded-full text-fg-subtle transition-colors hover:bg-surface-2 hover:text-fg"
      :aria-label="t('sponsors.dismiss')"
      @click="dismiss"
    >
      <Icon name="lucide:x" class="size-3.5" aria-hidden="true" />
    </button>
    <p class="eyebrow pr-7 text-fg-subtle">
      {{ t('sponsors.docs') }}
    </p>
    <!--
      Every sponsor occupies the same grid cell. The grid sizes that cell to
      the tallest copy, so rotating the carousel changes opacity only and never
      changes the card's height.
    -->
    <div class="mt-2 grid">
      <a
        v-for="(sponsor, sponsorIndex) in sponsors"
        :key="sponsor.id"
        :href="sponsor.url"
        target="_blank"
        rel="sponsored noopener noreferrer"
        class="col-start-1 row-start-1 block transition-[opacity,transform] duration-200 ease-out motion-reduce:transition-none"
        :class="sponsorIndex === index ? 'translate-x-0 opacity-100' : 'pointer-events-none -translate-x-2 opacity-0'"
        :aria-hidden="sponsorIndex !== index ? 'true' : undefined"
        :tabindex="sponsorIndex !== index ? -1 : undefined"
      >
        <img
          :src="sponsor.logoLight"
          :alt="sponsor.name"
          width="120"
          height="30"
          loading="lazy"
          decoding="async"
          class="block h-7 w-auto max-w-[7.5rem] opacity-80 dark:hidden"
        />
        <img
          :src="sponsor.logoDark"
          :alt="sponsor.name"
          width="120"
          height="30"
          loading="lazy"
          decoding="async"
          class="hidden h-7 w-auto max-w-[7.5rem] opacity-80 dark:block"
        />
        <span class="mt-2 line-clamp-3 block text-micro leading-relaxed text-fg-muted">{{ sponsor.description }}</span>
      </a>
    </div>
    <div class="pointer-events-none absolute inset-x-3 bottom-2.5 flex items-center justify-between gap-3">
      <a
        v-if="current"
        :href="current.url"
        target="_blank"
        rel="sponsored noopener noreferrer"
        class="pointer-events-auto inline-flex items-center gap-1 text-micro font-semibold text-accent-strong"
      >
        {{ t('sponsors.visit') }} →
      </a>
      <div v-if="sponsors.length > 1" class="pointer-events-auto -mr-1.5 flex items-center">
        <button
          v-for="(sponsor, dotIndex) in sponsors"
          :key="sponsor.id"
          type="button"
          class="grid size-6 place-items-center rounded-full"
          :aria-label="t('sponsors.showSponsor', { n: dotIndex + 1 })"
          :aria-current="dotIndex === index ? 'true' : undefined"
          @click="select(dotIndex)"
        >
          <span
            class="size-1.5 rounded-full transition-colors"
            :class="dotIndex === index ? 'bg-accent' : 'bg-border'"
            aria-hidden="true"
          />
        </button>
      </div>
    </div>
  </div>
</template>

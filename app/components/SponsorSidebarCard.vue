<script setup lang="ts">
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
const dismissed = ref(false)
const paused = ref(false)
const index = ref(props.sponsors.length ? props.startIndex % props.sponsors.length : 0)
const current = computed(() => props.sponsors[index.value] ?? null)
const storageId = computed(() => `axolotl:sponsor-dismissed:${props.storageKey}`)
let timer: ReturnType<typeof setInterval> | undefined

function stopTimer() {
  if (timer) {
    clearInterval(timer)
    timer = undefined
  }
}

function startTimer() {
  stopTimer()
  if (dismissed.value || props.sponsors.length < 2) return
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
  timer = setInterval(() => {
    if (!paused.value && !dismissed.value) {
      index.value = (index.value + 1) % props.sponsors.length
    }
  }, 6000)
}

onMounted(() => {
  try {
    dismissed.value = localStorage.getItem(storageId.value) === '1'
  } catch {
    dismissed.value = false
  }
  startTimer()
})

onBeforeUnmount(stopTimer)

function select(next: number) {
  index.value = next
  startTimer()
}

function dismiss() {
  dismissed.value = true
  stopTimer()
  try {
    localStorage.setItem(storageId.value, '1')
  } catch {
    // Storage can be unavailable in private browsing; hiding for this visit is enough.
  }
}
</script>

<template>
  <div
    v-if="!dismissed && current"
    class="relative rounded-card border border-border bg-surface-1 p-3"
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
    <p class="pr-7 font-mono text-micro font-semibold tracking-[0.16em] text-fg-subtle uppercase">
      {{ t('sponsors.docs') }}
    </p>
    <Transition name="sponsor-fade" mode="out-in">
      <a :key="current.id" :href="current.url" target="_blank" rel="sponsored noopener noreferrer" class="mt-2 block">
        <img
          :src="current.logo"
          :alt="current.name"
          width="120"
          height="30"
          loading="lazy"
          decoding="async"
          class="h-7 w-auto max-w-[7.5rem] opacity-80 dark:brightness-0 dark:invert"
        />
        <span class="mt-2 line-clamp-3 block text-micro leading-relaxed text-fg-muted">{{ current.description }}</span>
        <span class="mt-2 inline-flex items-center gap-1 text-micro font-semibold text-accent-strong">
          {{ t('sponsors.visit') }} →
        </span>
      </a>
    </Transition>
    <div v-if="sponsors.length > 1" class="mt-2 flex items-center gap-1">
      <button
        v-for="(sponsor, dotIndex) in sponsors"
        :key="sponsor.id"
        type="button"
        class="size-1.5 rounded-full transition-colors"
        :class="dotIndex === index ? 'bg-accent' : 'bg-border hover:bg-border-strong'"
        :aria-label="t('sponsors.showSponsor', { n: dotIndex + 1 })"
        :aria-current="dotIndex === index ? 'true' : undefined"
        @click="select(dotIndex)"
      />
    </div>
  </div>
</template>

<style scoped>
.sponsor-fade-enter-active,
.sponsor-fade-leave-active {
  transition:
    opacity 180ms ease,
    transform 180ms ease;
}

.sponsor-fade-enter-from {
  opacity: 0;
  transform: translateX(8px);
}

.sponsor-fade-leave-to {
  opacity: 0;
  transform: translateX(-8px);
}

@media (prefers-reduced-motion: reduce) {
  .sponsor-fade-enter-active,
  .sponsor-fade-leave-active {
    transition: none;
  }
}
</style>

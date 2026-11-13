<script setup lang="ts">
defineProps<{
  label: string
  src: string
}>()

const { t } = useI18n()
const PHONE = '(max-width: 767px)'

const stage = ref<HTMLElement | null>(null)
const started = ref(false)
const mounted = ref(false)
const prepared = ref(false)
const ready = ref(false)
const failed = ref(false)
const phone = ref(false)
const progress = ref(0)
const launchCount = ref(0)
let disposed = false
let phoneQuery: MediaQueryList | null = null

function start() {
  started.value = true
  progress.value = 25
  mounted.value = true
}

function startUnlessPhone() {
  phone.value = phoneQuery?.matches ?? false
  if (!started.value && !phone.value) start()
}

async function finishLoading() {
  progress.value = 100
  await nextTick()
  if (disposed) return
  prepared.value = true
}

function onSplashLeft() {
  ready.value = true
  if (document.activeElement === document.body) void nextTick(() => stage.value?.focus())
}

async function retry() {
  failed.value = false
  mounted.value = false
  prepared.value = false
  ready.value = false
  progress.value = 0
  launchCount.value++
  await nextTick()
  start()
}

onMounted(() => {
  phoneQuery = window.matchMedia(PHONE)
  phoneQuery.addEventListener('change', startUnlessPhone)
  startUnlessPhone()
})

onBeforeUnmount(() => {
  disposed = true
  phoneQuery?.removeEventListener('change', startUnlessPhone)
})
</script>

<template>
  <div
    class="relative aspect-[1280/800] w-full overflow-hidden rounded-[10px]"
    role="group"
    :aria-label="label"
    :aria-busy="!ready || undefined"
  >
    <div v-if="phone" class="flex aspect-[1280/800] items-center justify-center bg-surface-2 p-8 text-center">
      <p class="max-w-sm text-body text-fg-muted">{{ t('demo.phone') }}</p>
    </div>

    <template v-else>
      <div
        v-if="mounted && !failed"
        ref="stage"
        tabindex="-1"
        class="absolute inset-0 rounded-[10px] outline-none"
        :inert="!ready || undefined"
        :aria-hidden="!ready || undefined"
      >
        <LauncherDemoFrame
          :key="launchCount"
          :src="src"
          :label="label"
          @ready="finishLoading"
          @progress="progress = $event"
          @failed="failed = true"
        />
      </div>

      <Transition name="splash-fade" @after-leave="onSplashLeft">
        <LauncherSplash
          v-if="!prepared"
          class="z-10"
          :progress="progress"
          :loading-label="t('demo.loading')"
          :failure-label="t('demo.failed')"
          :retry-label="t('demo.retry')"
          :failed="failed"
          @retry="retry"
        />
      </Transition>
    </template>
  </div>
</template>

<style scoped>
.launcher-demo {
  aspect-ratio: 1280 / 800;
}

.splash-fade-leave-active {
  transition: opacity 300ms ease-in-out;
}

.splash-fade-leave-to {
  opacity: 0;
}

@media (prefers-reduced-motion: reduce) {
  .splash-fade-leave-active {
    transition-duration: 100ms;
  }
}
</style>

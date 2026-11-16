<script setup lang="ts">
import { useEventListener, useMediaQuery, useMutationObserver, useResizeObserver, useTimeoutFn } from '@vueuse/core'

const props = defineProps<{
  src: string
  label: string
}>()
const emit = defineEmits<{ ready: []; progress: [value: number]; failed: [] }>()

const READY_TIMEOUT = 90_000

type DemoTheme = 'light' | 'dark' | 'oled'

const prefersLight = useMediaQuery('(prefers-color-scheme: light)')

function siteTheme(): DemoTheme {
  const root = document.documentElement
  const selected = root.dataset.theme
  if (selected === 'light' || selected === 'dark' || selected === 'oled') return selected
  return prefersLight.value ? 'light' : 'dark'
}

const startTheme = siteTheme()
const frameSrc = computed(() => `${props.src}?theme=${startTheme}`)

const frame = ref<HTMLElement | null>(null)
const iframe = ref<HTMLIFrameElement | null>(null)
const themeRoot = ref<HTMLElement | null>(null)
const scale = ref(1)
let theme = startTheme
let ready = false
const { start: startReadyTimer, stop: stopReadyTimer } = useTimeoutFn(() => emit('failed'), READY_TIMEOUT, {
  immediate: false,
})

function postTheme() {
  iframe.value?.contentWindow?.postMessage(
    { type: 'axolotl-demo:theme', theme },
    new URL(props.src, location.href).origin,
  )
}

function followSiteTheme() {
  if (siteTheme() === theme) return
  theme = siteTheme()
  postTheme()
}

function onLoad() {
  if (theme !== startTheme) postTheme()
  if (!ready) emit('progress', 60)
}

function onMessage(event: MessageEvent) {
  if (ready || event.source !== iframe.value?.contentWindow) return
  if ((event.data as { type?: unknown } | null)?.type !== 'axolotl-demo:ready') return
  ready = true
  stopReadyTimer()
  emit('ready')
}

useEventListener('message', onMessage)
useResizeObserver(frame, ([entry]) => {
  if (entry) scale.value = entry.contentRect.width / 1280
})
useMutationObserver(themeRoot, followSiteTheme, { attributes: true, attributeFilter: ['data-theme'] })

onMounted(() => {
  themeRoot.value = document.documentElement
  startReadyTimer()
})
</script>

<template>
  <div ref="frame" class="absolute inset-0 overflow-hidden rounded-[10px]">
    <iframe
      ref="iframe"
      :src="frameSrc"
      :title="label"
      data-lenis-prevent
      class="absolute top-0 left-0 h-[800px] w-[1280px] origin-top-left border-0"
      :style="{ transform: `scale(${scale})` }"
      @load="onLoad"
    />
  </div>
</template>

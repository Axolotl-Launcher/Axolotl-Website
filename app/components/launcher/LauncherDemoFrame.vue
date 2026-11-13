<script setup lang="ts">
const props = defineProps<{
  src: string
  label: string
}>()
const emit = defineEmits<{ ready: []; progress: [value: number]; failed: [] }>()

const READY_TIMEOUT = 90_000

type DemoTheme = 'light' | 'dark' | 'oled'

function siteTheme(): DemoTheme {
  const root = document.documentElement
  const selected = root.dataset.theme
  if (selected === 'light' || selected === 'dark' || selected === 'oled') return selected
  return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark'
}

const startTheme = siteTheme()
const frameSrc = computed(() => `${props.src}?theme=${startTheme}`)

const frame = ref<HTMLElement | null>(null)
const iframe = ref<HTMLIFrameElement | null>(null)
const scale = ref(1)
let theme = startTheme
let resizeObserver: ResizeObserver | null = null
let themeObserver: MutationObserver | null = null
let readyTimer: ReturnType<typeof setTimeout> | undefined
let ready = false

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
  clearTimeout(readyTimer)
  emit('ready')
}

onMounted(() => {
  readyTimer = setTimeout(() => emit('failed'), READY_TIMEOUT)
  window.addEventListener('message', onMessage)
  resizeObserver = new ResizeObserver(([entry]) => {
    if (entry) scale.value = entry.contentRect.width / 1280
  })
  if (frame.value) resizeObserver.observe(frame.value)
  themeObserver = new MutationObserver(followSiteTheme)
  themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] })
})

onBeforeUnmount(() => {
  clearTimeout(readyTimer)
  window.removeEventListener('message', onMessage)
  resizeObserver?.disconnect()
  themeObserver?.disconnect()
})
</script>

<template>
  <div ref="frame" class="absolute inset-0 overflow-hidden rounded-[10px]">
    <iframe
      ref="iframe"
      :src="frameSrc"
      :title="label"
      class="absolute top-0 left-0 h-[800px] w-[1280px] origin-top-left border-0"
      :style="{ transform: `scale(${scale})` }"
      @load="onLoad"
    />
  </div>
</template>

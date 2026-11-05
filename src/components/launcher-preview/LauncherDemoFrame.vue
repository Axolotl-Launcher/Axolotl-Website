<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'

/**
 * The launcher frontend's web demo build in a frame, its 1280×800 window scaled to
 * fit. The build posts `axolotl-demo:ready` to this page once the
 * launcher has started, and shows the site's theme: it starts with the theme in its
 * `?theme=` query and switches when sent `axolotl-demo:theme`.
 */
const props = defineProps<{
    /** Entry page of the web demo build. */
    src: string
    /** Accessible name of the frame. */
    label: string
}>()
const emit = defineEmits<{ ready: []; progress: [value: number]; failed: [] }>()

/** How long the demo may take to load and start the launcher before it counts as failed. */
const READY_TIMEOUT = 90_000

type DemoTheme = 'light' | 'dark' | 'oled'

/** The theme the site shows, from the class its theme setting puts on `<html>`. */
function siteTheme(): DemoTheme {
    const classes = document.documentElement.classList
    if (classes.contains('light-mode')) return 'light'
    return classes.contains('oled-mode') ? 'oled' : 'dark'
}

// Only mounted in the browser. The query is fixed: a new `src` would reload the frame.
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

/** The page and its scripts have loaded; images it is still loading may hold this past `ready`. */
function onLoad() {
    // A theme the visitor picked while the page was still loading reached no listener.
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
    // Counts from here, so a page that never finishes loading fails too.
    readyTimer = setTimeout(() => emit('failed'), READY_TIMEOUT)
    window.addEventListener('message', onMessage)
    resizeObserver = new ResizeObserver(([entry]) => {
        if (entry) scale.value = entry.contentRect.width / 1280
    })
    if (frame.value) resizeObserver.observe(frame.value)
    themeObserver = new MutationObserver(followSiteTheme)
    themeObserver.observe(document.documentElement, {
        attributes: true,
        attributeFilter: ['class'],
    })
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
            class="absolute left-0 top-0 h-[800px] w-[1280px] origin-top-left border-0"
            :style="{ transform: `scale(${scale})` }"
            @load="onLoad"
        />
    </div>
</template>

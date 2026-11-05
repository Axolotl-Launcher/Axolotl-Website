<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'

/**
 * The launcher frontend's web demo build in a frame, its 1280×800 window scaled to fit
 * like the in-page preview's. The build posts `axolotl-demo:ready` to this page once
 * its first screen has painted.
 */
defineProps<{
    /** Entry page of the web demo build. */
    src: string
    /** Accessible name of the frame. */
    label: string
}>()
const emit = defineEmits<{ ready: []; progress: [value: number]; failed: [] }>()

/** How long the loaded page may take to paint its first screen before the launcher counts as failed. */
const READY_TIMEOUT = 60_000

const frame = ref<HTMLElement | null>(null)
const iframe = ref<HTMLIFrameElement | null>(null)
const scale = ref(1)
let resizeObserver: ResizeObserver | null = null
let readyTimer: ReturnType<typeof setTimeout> | undefined
let ready = false

/** The page and its scripts have loaded; images it is still loading may hold this past `ready`. */
function onLoad() {
    if (ready) return
    emit('progress', 60)
    clearTimeout(readyTimer)
    readyTimer = setTimeout(() => emit('failed'), READY_TIMEOUT)
}

function onMessage(event: MessageEvent) {
    if (ready || event.source !== iframe.value?.contentWindow) return
    if ((event.data as { type?: unknown } | null)?.type !== 'axolotl-demo:ready') return
    ready = true
    clearTimeout(readyTimer)
    emit('ready')
}

onMounted(() => {
    window.addEventListener('message', onMessage)
    resizeObserver = new ResizeObserver(([entry]) => {
        if (entry) scale.value = entry.contentRect.width / 1280
    })
    if (frame.value) resizeObserver.observe(frame.value)
})

onBeforeUnmount(() => {
    clearTimeout(readyTimer)
    window.removeEventListener('message', onMessage)
    resizeObserver?.disconnect()
})
</script>

<template>
    <div ref="frame" class="absolute inset-0 overflow-hidden rounded-[10px]">
        <iframe
            ref="iframe"
            :src="src"
            :title="label"
            class="absolute left-0 top-0 h-[800px] w-[1280px] origin-top-left border-0"
            :style="{ transform: `scale(${scale})` }"
            @load="onLoad"
        />
    </div>
</template>

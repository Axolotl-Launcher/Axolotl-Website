<script setup lang="ts">
import { defineMessages, useVIntl } from '@modrinth/ui'
import {
    type Component,
    defineAsyncComponent,
    nextTick,
    onBeforeUnmount,
    onMounted,
    ref,
} from 'vue'

import LauncherSplash from './shared/LauncherSplash.vue'

defineProps<{
    /** Accessible name of the launcher window. */
    label: string
}>()
const emit = defineEmits<{ close: [] }>()
const { formatMessage } = useVIntl()
const messages = defineMessages({
    loading: { id: 'axolotl-preview.loading', defaultMessage: 'Loading Axolotl Launcher' },
    failed: { id: 'axolotl-preview.failed', defaultMessage: 'The launcher could not load.' },
    retry: { id: 'axolotl-preview.retry', defaultMessage: 'Try again' },
})

/** Phone layouts never load the live launcher: it is too heavy for them. */
const PHONE = '(max-width: 767px)'

const stage = ref<HTMLElement | null>(null)
const started = ref(false)
const mounted = ref(false)
const prepared = ref(false)
const ready = ref(false)
const failed = ref(false)
const progress = ref(0)
const launchCount = ref(0)
let disposed = false
let phoneQuery: MediaQueryList | null = null
let previewModule: Promise<Component> | null = null

function loadPreview() {
    previewModule ??= import.meta.client
        ? import('./LauncherPreview.vue')
              .then((module) => module.default)
              .catch((error) => {
                  previewModule = null
                  throw error
              })
        : Promise.reject(new Error('The launcher preview runs in the browser'))
    return previewModule
}

const LauncherPreview = defineAsyncComponent({
    loader: loadPreview,
    onError(_error, _retry, fail) {
        failed.value = true
        fail()
    },
})

function start() {
    started.value = true
    progress.value = 5
    loadPreview()
        .then(() => {
            if (disposed) return
            progress.value = 25
            mounted.value = true
        })
        .catch(() => {
            if (!disposed) failed.value = true
        })
}

/** Starts the launcher once the page is not laid out for a phone. */
function startUnlessPhone() {
    if (!started.value && !phoneQuery?.matches) start()
}

async function finishLoading() {
    progress.value = 100
    await nextTick()
    if (disposed) return
    prepared.value = true
}

function onSplashLeft() {
    ready.value = true
    // Keyboard visitors land in the launcher unless they already moved elsewhere.
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
        class="launcher-demo relative w-full rounded-[10px]"
        role="group"
        :aria-label="label"
        :aria-busy="!ready || undefined"
    >
        <div
            v-if="mounted && !failed"
            ref="stage"
            tabindex="-1"
            class="launcher-demo-surface absolute inset-0 rounded-[10px] outline-none"
            :inert="!ready || undefined"
            :aria-hidden="!ready || undefined"
        >
            <LauncherPreview
                :key="launchCount"
                @ready="finishLoading"
                @progress="progress = $event"
                @failed="failed = true"
                @close="emit('close')"
            />
        </div>
        <!-- Rendered on the server, so the page's first paint is the launcher starting. -->
        <Transition name="splash-fade" @after-leave="onSplashLeft">
            <LauncherSplash
                v-if="!prepared"
                class="launcher-demo-surface z-10"
                :progress="progress"
                :loading-label="formatMessage(messages.loading)"
                :failure-label="formatMessage(messages.failed)"
                :retry-label="formatMessage(messages.retry)"
                :failed="failed"
                @retry="retry"
            />
        </Transition>
    </div>
</template>

<style scoped lang="scss">
.launcher-demo {
    aspect-ratio: 1280 / 800;
}

.launcher-demo-surface {
    box-shadow:
        0 0 0 0.5px rgb(0 0 0 / 50%),
        0 22px 70px 4px rgb(0 0 0 / 56%);
}

html.light-mode .launcher-demo-surface {
    box-shadow:
        0 0 0 0.5px rgb(0 0 0 / 18%),
        0 22px 70px 4px rgb(0 0 0 / 22%);
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

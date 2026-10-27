<script setup lang="ts">
import { PlayIcon } from '@modrinth/assets'
import { defineMessages, useVIntl } from '@modrinth/ui'
import {
    type Component,
    defineAsyncComponent,
    nextTick,
    onBeforeUnmount,
    onMounted,
    ref,
    watch,
} from 'vue'

import LauncherSplash from './shared/LauncherSplash.vue'

defineProps<{
    /** Accessible description of the launcher screen the poster shows. */
    label: string
}>()
const emit = defineEmits<{ close: [] }>()
const { formatMessage, locale } = useVIntl()
const messages = defineMessages({
    open: {
        id: 'axolotl-preview.open',
        defaultMessage: 'Try Axolotl Launcher in your browser',
    },
    loading: { id: 'axolotl-preview.loading', defaultMessage: 'Loading Axolotl Launcher' },
    failed: { id: 'axolotl-preview.failed', defaultMessage: 'The launcher could not load.' },
    retry: { id: 'axolotl-preview.retry', defaultMessage: 'Try again' },
})

declare global {
    interface Window {
        /** Set by the `<head>` script below until the component mounts. */
        __axolotlPosterClick?: { pending: boolean; stop: () => void }
    }
}

/** Phone layouts only ever show the poster: the live launcher is too heavy for them. */
const PHONE = '(max-width: 767px)'

/**
 * Starts the poster download from `<head>`, before the body is parsed, using the
 * same theme resolution as the site's `theme-init` script and the language the
 * i18n plugin ends up with: the `locale` cookie when there is one, else the
 * browser's first Chinese or English language, else Chinese. The poster is a CSS
 * background so that only the variant matching the visitor's theme and language
 * is fetched; `data-launcher-poster` carries the language to the stylesheet. Each
 * comes at 1280×800 and 2560×1600, picked by pixel density like the stylesheet's
 * `image-set`; phones always get the smaller one.
 *
 * The page hydrates only after its first paint, so it also remembers a click on the
 * poster that comes before (`window.__axolotlPosterClick`); the component opens the
 * launcher for it once mounted.
 */
const POSTER_PRELOAD = `(function(){try{var q={pending:false};var h=function(e){var p=e.target&&e.target.closest&&e.target.closest('.launcher-preview-poster');if(p)q.pending=true};document.addEventListener('click',h,true);q.stop=function(){document.removeEventListener('click',h,true)};window.__axolotlPosterClick=q}catch(e){}try{var t=localStorage.getItem('axolotl-theme');var r=t;if(!r||r==='system'){r=(window.matchMedia&&window.matchMedia('(prefers-color-scheme: light)').matches)?'light':'dark'}var g='zh';var c=document.cookie.match(/(?:^|; )locale=([^;]*)/);var v=c?decodeURIComponent(c[1]).trim():'';if(v){g=/^en/i.test(v)?'en':'zh'}else{var n=navigator.languages&&navigator.languages.length?navigator.languages:[navigator.language];for(var i=0;i<n.length;i++){var x=String(n[i]||'').trim();if(/^zh/i.test(x))break;if(/^en/i.test(x)){g='en';break}}}document.documentElement.setAttribute('data-launcher-poster',g);var b='/launcher-preview/poster-'+(r==='light'?'light':r==='oled'?'oled':'dark')+'-'+g;var l=document.createElement('link');l.rel='preload';l.as='image';l.href=b+'-1x.webp';if(!window.matchMedia('${PHONE}').matches){l.setAttribute('imagesrcset',b+'-1x.webp 1x, '+b+'-2x.webp 2x')}l.setAttribute('fetchpriority','high');document.head.appendChild(l)}catch(e){}})()`

useHead({
    script: [{ key: 'launcher-preview-poster', innerHTML: POSTER_PRELOAD }],
})

const poster = ref<HTMLElement | null>(null)
const stage = ref<HTMLElement | null>(null)
/** The visitor asked for the live launcher: nothing of it loads before. */
const opened = ref(false)
/** Known once mounted; until then the stylesheet keeps the poster inert on phones. */
const phone = ref(false)
let phoneQuery: MediaQueryList | null = null
const mounted = ref(false)
const prepared = ref(false)
const ready = ref(false)
const failed = ref(false)
const progress = ref(0)
const launchCount = ref(0)
let disposed = false
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

function open() {
    if (opened.value || phone.value) return
    opened.value = true
    start()
}

async function finishLoading() {
    progress.value = 100
    await nextTick()
    if (disposed) return
    prepared.value = true
}

function onSplashLeft() {
    // Keyboard visitors who opened the launcher continue inside it.
    const hadFocus = document.activeElement === poster.value
    ready.value = true
    if (hadFocus) void nextTick(() => stage.value?.focus())
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

// A language picked on the page switches the poster too.
watch(locale, (code) => {
    if (import.meta.client) {
        document.documentElement.setAttribute(
            'data-launcher-poster',
            code === 'en-US' ? 'en' : 'zh',
        )
    }
})

function syncPhone() {
    phone.value = phoneQuery?.matches ?? false
}

onMounted(() => {
    phoneQuery = window.matchMedia(PHONE)
    syncPhone()
    phoneQuery.addEventListener('change', syncPhone)
    // A click on the poster before the page hydrated.
    const earlyClick = window.__axolotlPosterClick
    earlyClick?.stop()
    window.__axolotlPosterClick = undefined
    if (earlyClick?.pending) open()
})

onBeforeUnmount(() => {
    disposed = true
    phoneQuery?.removeEventListener('change', syncPhone)
})
</script>

<template>
    <div
        class="launcher-preview-hero relative w-full rounded-[10px]"
        role="group"
        :aria-label="label"
        :aria-busy="(opened && !ready) || undefined"
    >
        <!-- The server-rendered poster is the page's largest paint; the live launcher
             loads only when the visitor asks for it, and never on a phone. Not
             `disabled` while loading: that would drop the keyboard focus the launcher
             takes over once it opens. -->
        <component
            :is="phone ? 'div' : 'button'"
            v-if="!ready"
            ref="poster"
            :type="phone ? undefined : 'button'"
            :role="phone ? 'img' : undefined"
            class="launcher-preview-poster launcher-preview-surface group absolute inset-0 flex items-center justify-center rounded-[10px] border-0 bg-surface-1 bg-cover bg-center bg-no-repeat p-0 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--color-focus-ring)] aria-disabled:cursor-progress max-md:pointer-events-none"
            :aria-label="phone ? label : formatMessage(messages.open)"
            :aria-disabled="(opened && !phone) || undefined"
            @click="open"
        >
            <span
                v-if="!opened && !phone"
                class="inline-flex items-center gap-2 rounded-full bg-brand px-5 py-3 text-[clamp(0.875rem,1.3vw,1rem)] font-bold text-brand-inverted shadow-lg transition-[transform,filter] duration-150 group-hover:scale-[1.04] group-hover:brightness-110 group-focus-visible:scale-[1.04] group-focus-visible:brightness-110 motion-reduce:transition-none max-md:hidden"
                aria-hidden="true"
            >
                <PlayIcon class="size-[1.1em] shrink-0" />
                {{ formatMessage(messages.open) }}
            </span>
        </component>
        <div
            v-if="mounted && !failed"
            ref="stage"
            tabindex="-1"
            class="launcher-preview-stage launcher-preview-surface absolute inset-0 rounded-[10px] outline-none"
            :class="{ 'launcher-preview-stage--ready': ready }"
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
        <Transition name="splash-fade" @after-leave="onSplashLeft">
            <LauncherSplash
                v-if="opened && !prepared"
                class="z-10"
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
@mixin poster($variant) {
    background-image: url('/launcher-preview/poster-#{$variant}-2x.webp');
    background-image: image-set(
        url('/launcher-preview/poster-#{$variant}-1x.webp') 1x,
        url('/launcher-preview/poster-#{$variant}-2x.webp') 2x
    );

    // A phone shows the poster at most ~400 CSS px wide: 1280 px covers any density.
    @media (max-width: 767px) {
        background-image: url('/launcher-preview/poster-#{$variant}-1x.webp');
    }
}

.launcher-preview-hero {
    aspect-ratio: 1280 / 800;
}

.launcher-preview-surface {
    box-shadow:
        0 0 0 0.5px rgb(0 0 0 / 50%),
        0 22px 70px 4px rgb(0 0 0 / 56%);
}

html.light-mode .launcher-preview-surface {
    box-shadow:
        0 0 0 0.5px rgb(0 0 0 / 18%),
        0 22px 70px 4px rgb(0 0 0 / 22%);
}

// The poster's image depends on the theme and language classes on <html>.
.launcher-preview-poster {
    @include poster('dark-zh');
}

html[data-launcher-poster='en'] .launcher-preview-poster {
    @include poster('dark-en');
}

html.light-mode .launcher-preview-poster {
    @include poster('light-zh');
}

html.light-mode[data-launcher-poster='en'] .launcher-preview-poster {
    @include poster('light-en');
}

html.oled-mode .launcher-preview-poster {
    @include poster('oled-zh');
}

html.oled-mode[data-launcher-poster='en'] .launcher-preview-poster {
    @include poster('oled-en');
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

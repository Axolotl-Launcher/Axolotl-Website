<script setup lang="ts">
import { PlayIcon } from '@modrinth/assets'
import { defineMessages, useVIntl } from '@modrinth/ui'
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'

defineProps<{
    /** Accessible description of the launcher screen the poster shows. */
    label: string
}>()
const { formatMessage, locale } = useVIntl()
const messages = defineMessages({
    open: {
        id: 'axolotl-preview.open',
        defaultMessage: 'Try Axolotl Launcher in your browser',
    },
})

/** The live launcher runs on its own page; phones only ever get the poster. */
const DEMO_PATH = '/demo'
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
 */
const POSTER_PRELOAD = `(function(){try{var t=localStorage.getItem('axolotl-theme');var r=t;if(!r||r==='system'){r=(window.matchMedia&&window.matchMedia('(prefers-color-scheme: light)').matches)?'light':'dark'}var g='zh';var c=document.cookie.match(/(?:^|; )locale=([^;]*)/);var v=c?decodeURIComponent(c[1]).trim():'';if(v){g=/^en/i.test(v)?'en':'zh'}else{var n=navigator.languages&&navigator.languages.length?navigator.languages:[navigator.language];for(var i=0;i<n.length;i++){var x=String(n[i]||'').trim();if(/^zh/i.test(x))break;if(/^en/i.test(x)){g='en';break}}}document.documentElement.setAttribute('data-launcher-poster',g);var b='/launcher-preview/poster-'+(r==='light'?'light':r==='oled'?'oled':'dark')+'-'+g;var l=document.createElement('link');l.rel='preload';l.as='image';l.href=b+'-1x.webp';if(!window.matchMedia('${PHONE}').matches){l.setAttribute('imagesrcset',b+'-1x.webp 1x, '+b+'-2x.webp 2x')}l.setAttribute('fetchpriority','high');document.head.appendChild(l)}catch(e){}})()`

useHead({
    script: [{ key: 'launcher-preview-poster', innerHTML: POSTER_PRELOAD }],
})

/** Known once mounted; until then the stylesheet keeps the poster inert on phones. */
const phone = ref(false)
let phoneQuery: MediaQueryList | null = null

function syncPhone() {
    phone.value = phoneQuery?.matches ?? false
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

onMounted(() => {
    phoneQuery = window.matchMedia(PHONE)
    syncPhone()
    phoneQuery.addEventListener('change', syncPhone)
})

onBeforeUnmount(() => {
    phoneQuery?.removeEventListener('change', syncPhone)
})
</script>

<template>
    <div class="launcher-preview-hero relative w-full rounded-[10px]">
        <!-- The server-rendered poster is the page's largest paint. It links to the live
             launcher's own page, except on a phone. A plain link, so it works before the
             page hydrates and the demo starts from a fresh document. -->
        <component
            :is="phone ? 'div' : 'a'"
            :href="phone ? undefined : DEMO_PATH"
            :role="phone ? 'img' : undefined"
            class="launcher-preview-poster launcher-preview-surface group absolute inset-0 flex items-center justify-center rounded-[10px] bg-surface-1 bg-cover bg-center bg-no-repeat no-underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--color-focus-ring)] max-md:pointer-events-none"
            :aria-label="phone ? label : formatMessage(messages.open)"
        >
            <span
                v-if="!phone"
                class="inline-flex items-center gap-2 rounded-full bg-brand px-5 py-3 text-[clamp(0.875rem,1.3vw,1rem)] font-bold text-brand-inverted shadow-lg transition-[transform,filter] duration-150 group-hover:scale-[1.04] group-hover:brightness-110 group-focus-visible:scale-[1.04] group-focus-visible:brightness-110 motion-reduce:transition-none max-md:hidden"
                aria-hidden="true"
            >
                <PlayIcon class="size-[1.1em] shrink-0" />
                {{ formatMessage(messages.open) }}
            </span>
        </component>
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
</style>

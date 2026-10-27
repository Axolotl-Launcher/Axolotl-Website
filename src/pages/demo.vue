<script setup lang="ts">
import { LeftArrowIcon } from '@modrinth/assets'
import { defineMessages, useVIntl } from '@modrinth/ui'

import LauncherDemo from '~/components/launcher-preview/LauncherDemo.vue'

definePageMeta({ layout: 'blank' })

const { formatMessage } = useVIntl()
const messages = defineMessages({
    title: { id: 'axolotl-demo.title', defaultMessage: 'Try Axolotl Launcher' },
    description: {
        id: 'axolotl-demo.description',
        defaultMessage:
            'Axolotl Launcher running in your browser, with sample instances, content and settings.',
    },
    window: { id: 'axolotl-demo.window', defaultMessage: 'Axolotl Launcher' },
    back: { id: 'axolotl-demo.back', defaultMessage: 'Back to home' },
    phone: {
        id: 'axolotl-demo.phone',
        defaultMessage: 'The launcher demo runs on a computer. Open this page on one to try it.',
    },
    download: { id: 'axolotl-demo.download', defaultMessage: 'Download Axolotl Launcher' },
})

const seoTitle = computed(() => `${formatMessage(messages.title)} - Axolotl Launcher`)

useSeoMeta({
    title: () => seoTitle.value,
    description: () => formatMessage(messages.description),
    ogTitle: () => seoTitle.value,
    ogDescription: () => formatMessage(messages.description),
    ogType: 'website',
    ogUrl: 'https://axlmc.org/demo',
    robots: 'index, follow',
})

useHead({
    link: [{ rel: 'canonical', href: 'https://axlmc.org/demo' }],
})
</script>

<template>
    <div class="flex min-h-svh flex-col items-center justify-center gap-4 px-4 py-6 md:px-8">
        <a
            href="/"
            class="inline-flex items-center gap-1.5 self-start text-sm font-semibold text-[var(--color-text-tertiary)] no-underline hover:text-[var(--color-text-primary)]"
        >
            <LeftArrowIcon class="size-4" aria-hidden="true" />
            {{ formatMessage(messages.back) }}
        </a>
        <!-- The launcher fills the page while keeping its 1280×800 shape. -->
        <div class="w-[min(100%,calc((100svh_-_6rem)_*_1.6))] max-md:hidden">
            <LauncherDemo :label="formatMessage(messages.window)" @close="navigateTo('/')" />
        </div>
        <div
            class="flex max-w-sm flex-1 flex-col items-center justify-center gap-4 text-center md:hidden"
        >
            <p class="m-0 text-[var(--color-text-primary)]">{{ formatMessage(messages.phone) }}</p>
            <a
                href="/#download"
                class="rounded-full bg-brand px-5 py-3 font-bold text-brand-inverted no-underline"
            >
                {{ formatMessage(messages.download) }}
            </a>
        </div>
    </div>
</template>

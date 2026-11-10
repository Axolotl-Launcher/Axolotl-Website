<script setup lang="ts">
import { useVIntl } from '@modrinth/ui'

/**
 * This website's landing page as it renders in a 632 px wide Edge tab, from a
 * screenshot of the real page, the way the 《凌晨零点》 film builds its pages.
 */
const { locale } = useVIntl()
const source = computed(
    () => `/download-help/axlmc-${locale.value === 'zh-CN' ? 'zh-CN' : 'en-US'}.webp`,
)
</script>

<template>
    <div class="absolute inset-0 overflow-hidden bg-[#121014]">
        <img :src="source" alt="" class="block w-[632px] max-w-none" decoding="async" />
    </div>
</template>

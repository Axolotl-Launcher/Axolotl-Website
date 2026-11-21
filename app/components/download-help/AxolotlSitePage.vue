<script setup lang="ts">
/**
 * This website's landing page as it renders in a 592 px wide Edge tab, from a
 * screenshot of the real page, the way the 《凌晨零点》 film builds its pages.
 */
const { locale } = useI18n()
const source = computed(() => `/download-help/axlmc-${locale.value === 'en' ? 'en-US' : 'zh-CN'}.webp`)
</script>

<template>
  <div class="absolute inset-0 overflow-hidden bg-[#121014]">
    <img :src="source" alt="" class="block w-[592px] max-w-none" decoding="async" />
  </div>
</template>

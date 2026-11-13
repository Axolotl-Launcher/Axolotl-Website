<script setup lang="ts">
import type { NuxtError } from '#app'

const props = defineProps<{ error: NuxtError }>()
const { t } = useI18n()

useSeoMeta({
  title: t('notFound.title'),
  robots: 'noindex',
})

function goHome() {
  clearError({ redirect: '/' })
}

const statusCode = computed(() => props.error.statusCode || 500)
</script>

<template>
  <div class="grid min-h-dvh place-items-center px-6">
    <div class="w-full max-w-xl">
      <p class="font-mono text-micro font-semibold tracking-[0.2em] text-accent uppercase">ERROR {{ statusCode }}</p>
      <h1 class="mt-4 text-display">{{ t('notFound.title') }}</h1>
      <p class="mt-4 text-lead text-fg-muted">{{ t('notFound.description') }}</p>
      <BaseButton class="mt-8" size="lg" @click="goHome">{{ t('notFound.action') }}</BaseButton>
    </div>
  </div>
</template>

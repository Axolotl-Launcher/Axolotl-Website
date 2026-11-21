<script setup lang="ts">
import axolotlLogo from '~/assets/images/axolotl.webp'
import cubeBackground from '~/assets/images/cube.webp'

withDefaults(
  defineProps<{
    progress: number
    loadingLabel?: string
    failed?: boolean
    failureLabel?: string
    retryLabel?: string
  }>(),
  { loadingLabel: '', failed: false, failureLabel: '', retryLabel: '' },
)

const emit = defineEmits<{ retry: [] }>()
</script>

<template>
  <div
    class="[container-type:inline-size] absolute inset-0 isolate overflow-hidden rounded-[inherit] bg-[#101215] text-[#f4f6f8]"
    :aria-busy="!failed"
  >
    <img
      :src="cubeBackground"
      alt=""
      aria-hidden="true"
      draggable="false"
      fetchpriority="high"
      class="pointer-events-none absolute top-1/2 left-1/2 h-[180%] w-[180%] max-w-none -translate-x-1/2 -translate-y-1/2 object-contain opacity-80"
    />
    <div
      aria-hidden="true"
      class="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(255,77,157,0.24)_0%,rgba(48,16,40,0.56)_97.29%),linear-gradient(0deg,rgba(22,18,28,0.68),rgba(22,18,28,0.68))]"
    />
    <div class="absolute inset-0 flex flex-col items-center justify-center gap-[1.25cqw] px-6">
      <img :src="axolotlLogo" alt="" aria-hidden="true" class="min-size-16 max-size-24 size-[10cqw]" />
      <p class="mt-[2cqw] text-[2.4cqw] font-bold tracking-[-0.03em]">Axolotl Launcher</p>

      <div v-if="!failed" class="mt-[1.5cqw] w-[42cqw] max-w-80">
        <div class="h-[0.5cqw] min-h-1 overflow-hidden rounded-full bg-white/15">
          <div
            class="h-full rounded-full bg-[#f472b6] transition-[width] duration-500 ease-out"
            :style="{ width: `${Math.max(4, Math.min(100, progress))}%` }"
          />
        </div>
        <p class="mt-[1cqw] text-center text-[1.3cqw] text-white/60">{{ loadingLabel }}</p>
      </div>

      <div v-else class="mt-[1.5cqw] flex flex-col items-center gap-[1cqw]">
        <p class="text-[1.4cqw] text-white/70">{{ failureLabel }}</p>
        <button
          type="button"
          class="rounded-full border border-white/20 bg-white/10 px-[2cqw] py-[0.8cqw] text-[1.3cqw] font-semibold text-white transition-colors hover:bg-white/15"
          @click="emit('retry')"
        >
          {{ retryLabel }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps({
  title: { type: String, default: 'Axolotl Launcher' },
  description: {
    type: String,
    default: 'A modern Minecraft launcher for Windows, macOS and Linux.',
  },
  site: { type: String, default: 'Axolotl Launcher' },
  icon: { type: String, default: 'https://axlmc.org/axolotl.png' },
})
</script>

<template>
  <div
    class="relative flex h-full w-full flex-col overflow-hidden text-white"
    style="
      background-color: #140f16;
      background-image: radial-gradient(circle at 85% 12%, rgba(219, 39, 119, 0.45), transparent 55%);
    "
  >
    <div class="relative flex h-full w-full flex-col justify-between p-[60px]">
      <div class="flex flex-col gap-8" style="text-wrap: pretty">
        <span class="text-[72px] font-extrabold" style="line-height: 1.1; letter-spacing: -0.04em">
          {{ title }}
        </span>
        <span
          class="text-[40px] font-normal"
          style="
            line-height: 1.4;
            max-width: 95%;
            color: rgba(255, 255, 255, 0.62);
            display: -webkit-box;
            -webkit-line-clamp: 2;
            -webkit-box-orient: vertical;
            overflow: hidden;
          "
        >
          {{ description }}
        </span>
      </div>

      <div class="flex items-center gap-6">
        <img v-if="icon" :src="icon" alt="" class="h-16 w-16" style="object-fit: contain" />
        <span class="text-[32px] font-bold" style="letter-spacing: -0.02em; opacity: 0.92">
          {{ site }}
        </span>
        <div style="flex-grow: 1" />
        <div style="height: 4px; width: 60px; background-color: #db2777; border-radius: 2px" />
        <span class="text-[22px] font-bold uppercase" style="letter-spacing: 0.2em; color: #f9a8d4"> axlmc.org </span>
      </div>
    </div>
  </div>
</template>

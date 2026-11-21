<script setup lang="ts">
import { useResizeObserver } from '@vueuse/core'

/**
 * The 640×496 frame a walkthrough is recorded in, scaled to the width it is given.
 * Scenes draw a whole Windows screen at 100% scaling and move a camera over it.
 */
const STAGE_WIDTH = 640

const frame = ref<HTMLElement | null>(null)
const scale = ref(1)
useResizeObserver(frame, ([entry]) => {
  if (entry) scale.value = entry.contentRect.width / STAGE_WIDTH
})
</script>

<template>
  <div ref="frame" class="relative aspect-[40/31] w-full overflow-hidden" aria-hidden="true">
    <div class="dh-stage" :style="{ transform: `scale(${scale})` }">
      <slot />
    </div>
  </div>
</template>

<style>
.dh-stage {
  position: absolute;
  top: 0;
  left: 0;
  width: 640px;
  height: 496px;
  overflow: hidden;
  transform-origin: 0 0;
  background: #070b16;
  color: #1a1a1a;
  font-family: 'Inter Variable', 'Microsoft YaHei', 'PingFang SC', system-ui, sans-serif;
  font-size: 12px;
  line-height: 1.35;
  text-align: left;
  user-select: none;

  * {
    box-sizing: border-box;
  }
}

/** The guide ring around the next thing to click. */
.dh-guide {
  position: absolute;
  z-index: 55;
  border: 3px solid var(--accent);
  border-radius: 8px;
  pointer-events: none;
  box-shadow: 0 0 0 4px color-mix(in srgb, var(--accent) 22%, transparent);
}
</style>

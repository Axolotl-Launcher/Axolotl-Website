<script setup lang="ts">
/** The camera crops the illustrated desktop to the walkthrough frame. */
const props = defineProps<{ camera: { x: number; y: number; scale: number } }>()

const style = computed(() => ({
  transform: `scale(${props.camera.scale}) translate(${-props.camera.x}px, ${-props.camera.y}px)`,
}))
</script>

<template>
  <div class="windows-screen" :style="style">
    <slot />
  </div>
</template>

<style scoped>
.windows-screen {
  position: absolute;
  top: 0;
  left: 0;
  width: 1920px;
  height: 1080px;
  overflow: hidden;
  transform-origin: 0 0;
  background:
    radial-gradient(ellipse at 60% 48%, #6e3d61, transparent 55%),
    repeating-linear-gradient(120deg, transparent 0 27px, rgb(255 190 226 / 0.1) 28px 29px), #261a2c;
}
</style>

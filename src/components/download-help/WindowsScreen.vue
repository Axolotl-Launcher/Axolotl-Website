<script setup lang="ts">
/**
 * A 1920×1080 Windows 11 screen with the dark Bloom wallpaper. The stage shows the
 * part of it the camera frames, so windows keep their real places on the screen.
 */
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

<style scoped lang="scss">
.windows-screen {
    position: absolute;
    top: 0;
    left: 0;
    width: 1920px;
    height: 1080px;
    overflow: hidden;
    transform-origin: 0 0;
    background:
        radial-gradient(22% 30% at 62% 60%, rgb(120 170 255 / 0.5) 0%, transparent 70%),
        radial-gradient(36% 46% at 64% 60%, #1d4fc4 0%, transparent 72%),
        radial-gradient(60% 70% at 66% 64%, #0b2a7a 0%, transparent 75%),
        linear-gradient(160deg, #070b16 0%, #0a1430 55%, #0d1c45 100%);
}
</style>

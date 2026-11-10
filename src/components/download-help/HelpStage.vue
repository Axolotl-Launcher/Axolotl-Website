<script setup lang="ts">
/**
 * A fixed 640×400 drawing of a desktop, scaled to the width it is given.
 *
 * Scenes place everything in these stage pixels and time their animations as
 * fractions of the current step (`--d`), so pausing the walkthrough pauses the
 * drawing with it. Under reduced motion the animations are dropped and each
 * element shows its resting style, which scenes write as the step's end state.
 */
const props = defineProps<{
    durationMs: number
    paused: boolean
    still: boolean
}>()

const STAGE_WIDTH = 640

const frame = ref<HTMLElement | null>(null)
const scale = ref(1)
let observer: ResizeObserver | undefined

onMounted(() => {
    if (!frame.value) return
    observer = new ResizeObserver(([entry]) => {
        scale.value = entry.contentRect.width / STAGE_WIDTH
    })
    observer.observe(frame.value)
})

onBeforeUnmount(() => observer?.disconnect())

const stageStyle = computed(() => ({
    '--d': `${props.durationMs}ms`,
    transform: `scale(${scale.value})`,
}))
</script>

<template>
    <div ref="frame" class="relative aspect-[16/10] w-full overflow-hidden" aria-hidden="true">
        <div
            class="dh-stage"
            :class="{ 'dh-paused': paused, 'dh-still': still }"
            :style="stageStyle"
        >
            <slot />
        </div>
    </div>
</template>

<style lang="scss">
.dh-stage {
    position: absolute;
    top: 0;
    left: 0;
    width: 640px;
    height: 400px;
    overflow: hidden;
    transform-origin: 0 0;
    background:
        radial-gradient(120% 90% at 85% 110%, #2f6fd6 0%, transparent 55%),
        radial-gradient(90% 80% at 10% 0%, #c9dcf7 0%, transparent 60%),
        linear-gradient(160deg, #9fc0ee 0%, #5e8fe0 55%, #3d6fcf 100%);
    color: #1b1b1b;
    font-family:
        'Segoe UI Variable Text', 'Segoe UI', 'Microsoft YaHei UI', 'PingFang SC', system-ui,
        sans-serif;
    font-size: 12px;
    line-height: 1.35;
    text-align: left;
    user-select: none;

    * {
        box-sizing: border-box;
    }
}

.dh-paused,
.dh-paused * {
    animation-play-state: paused !important;
}

.dh-cursor {
    position: absolute;
    top: 0;
    left: 0;
    z-index: 50;
    animation-duration: var(--d);
    animation-fill-mode: both;
}

.dh-appear {
    animation: dh-appear 220ms ease-out calc(var(--d) * var(--at, 0)) both;
}

.dh-vanish {
    animation: dh-vanish 200ms ease-in calc(var(--d) * var(--at, 0)) both;
}

.dh-ripple {
    position: absolute;
    z-index: 49;
    width: 36px;
    height: 36px;
    margin: -18px 0 0 -18px;
    border-radius: 50%;
    background: color-mix(in srgb, var(--color-brand) 55%, transparent);
    opacity: 0;
    pointer-events: none;
    animation: dh-ripple 520ms ease-out calc(var(--d) * var(--at, 0)) both;
}

.dh-hint {
    position: absolute;
    z-index: 40;
    border: 3px solid var(--color-brand);
    border-radius: 8px;
    pointer-events: none;
    animation:
        dh-hint calc(var(--d) * (var(--to) - var(--from))) linear calc(var(--d) * var(--from)) both,
        dh-hint-pulse 1.1s ease-in-out infinite;
}

.dh-still {
    .dh-cursor,
    .dh-appear,
    .dh-vanish,
    .dh-hint,
    * {
        animation: none !important;
    }

    .dh-vanish,
    .dh-ripple,
    .dh-hint {
        visibility: hidden;
    }
}

@keyframes dh-appear {
    from {
        opacity: 0;
        transform: translateY(6px) scale(0.98);
    }
}

@keyframes dh-vanish {
    to {
        opacity: 0;
        visibility: hidden;
    }
}

@keyframes dh-ripple {
    0% {
        opacity: 0;
        transform: scale(0.2);
    }
    1% {
        opacity: 1;
        transform: scale(0.2);
    }
    100% {
        opacity: 0;
        transform: scale(1.4);
    }
}

@keyframes dh-hint {
    0%,
    100% {
        opacity: 0;
    }
    8%,
    92% {
        opacity: 1;
    }
}

@keyframes dh-hint-pulse {
    50% {
        box-shadow: 0 0 0 5px color-mix(in srgb, var(--color-brand) 30%, transparent);
    }
}
</style>

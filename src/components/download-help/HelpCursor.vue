<script setup lang="ts">
/**
 * The Windows pointer at 100% scaling, in the four shapes a walkthrough needs:
 * the arrow, the hand over links, the I-beam over text fields and the busy arrow
 * while an app starts. `x`/`y` is the hot spot.
 */
const props = withDefaults(
    defineProps<{
        x: number
        y: number
        kind?: 'arrow' | 'hand' | 'text' | 'busy'
        /** The step clock, which turns the busy ring. */
        time?: number
        visible?: boolean
    }>(),
    { kind: 'arrow', time: 0, visible: true },
)

const HOT_SPOTS = { arrow: [0.5, 0.5], hand: [6.5, 0.5], text: [4, 9], busy: [0.5, 0.5] } as const

const style = computed(() => {
    const [hx, hy] = HOT_SPOTS[props.kind]
    return {
        transform: `translate(${props.x - hx}px, ${props.y - hy}px)`,
        visibility: props.visible ? ('visible' as const) : ('hidden' as const),
    }
})
</script>

<template>
    <div class="pointer-events-none absolute left-0 top-0 z-[60]" :style="style">
        <svg v-if="kind === 'hand'" width="18" height="22" viewBox="0 0 18 22">
            <path
                d="M5.5 1.6c0-.9.6-1.4 1.3-1.4s1.2.5 1.2 1.4v6.6l.1-1.3c0-.8.6-1.3 1.3-1.3s1.2.5 1.2 1.3v1.6l.1-.8c0-.8.6-1.3 1.3-1.3s1.2.5 1.2 1.3v1.4l.1-.4c0-.8.6-1.2 1.2-1.2.7 0 1.2.5 1.2 1.3v5.4c0 3.6-2.2 6.4-6.2 6.4H8.3c-1.6 0-2.7-.6-3.6-1.8L1.2 14.2c-.6-.8-.6-1.7.1-2.2.7-.5 1.6-.3 2.2.4l2 2.4z"
                fill="#fff"
                stroke="#000"
                stroke-linejoin="round"
            />
            <path d="M8 8.3v4.2M10.6 9v3.5M13.2 9.6v2.9" stroke="#000" stroke-width=".8" />
        </svg>
        <svg v-else-if="kind === 'text'" width="9" height="18" viewBox="0 0 9 18">
            <path
                d="M1 1h2.5L4.5 2l1-1H8M4.5 2v14M1 17h2.5l1-1 1 1H8"
                fill="none"
                stroke="#fff"
                stroke-width="3"
            />
            <path
                d="M1 1h2.5L4.5 2l1-1H8M4.5 2v14M1 17h2.5l1-1 1 1H8"
                fill="none"
                stroke="#000"
                stroke-width="1.2"
            />
        </svg>
        <template v-else>
            <svg width="14" height="22" viewBox="0 0 14 22">
                <path
                    d="M.5.5v16.8l3.9-3.7 2.8 6.6 2.6-1.1-2.8-6.5h5.5z"
                    fill="#fff"
                    stroke="#000"
                    stroke-linejoin="round"
                />
            </svg>
            <svg
                v-if="kind === 'busy'"
                class="absolute left-[6px] top-[-9px]"
                width="16"
                height="16"
                viewBox="0 0 16 16"
                :style="{ transform: `rotate(${(time / 900) * 360}deg)` }"
            >
                <circle
                    cx="8"
                    cy="8"
                    r="6"
                    fill="none"
                    stroke="#0078d4"
                    stroke-opacity=".35"
                    stroke-width="2.6"
                />
                <path d="M8 2a6 6 0 0 1 6 6" fill="none" stroke="#2b9bf4" stroke-width="2.6" />
            </svg>
        </template>
    </div>
</template>

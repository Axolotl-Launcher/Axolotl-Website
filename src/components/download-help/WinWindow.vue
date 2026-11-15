<script setup lang="ts">
/** A classic Win32 window as Windows 11 draws it at 100% scaling: 30 px caption, 46 px buttons. */
withDefaults(
    defineProps<{
        title: string
        /** `off` draws the maximize button greyed out, as for a fixed-size dialog. */
        maximize?: 'on' | 'off' | 'none'
        minimize?: boolean
    }>(),
    { maximize: 'none', minimize: false },
)
</script>

<template>
    <div class="win-window">
        <div class="flex h-[30px] items-center">
            <span v-if="$slots.icon" class="ml-[9px] flex size-4 items-center justify-center">
                <slot name="icon" />
            </span>
            <span
                class="min-w-0 flex-1 truncate text-[12px] leading-4"
                :class="$slots.icon ? 'ml-[7px]' : 'ml-3'"
            >
                {{ title }}
            </span>
            <span v-if="minimize" class="win-caption-button">
                <svg width="10" height="10" viewBox="0 0 10 10">
                    <path d="M0 5.5h10" stroke="#1a1a1a" />
                </svg>
            </span>
            <span v-if="maximize !== 'none'" class="win-caption-button">
                <svg width="10" height="10" viewBox="0 0 10 10">
                    <rect
                        x=".5"
                        y=".5"
                        width="9"
                        height="9"
                        rx="1.5"
                        fill="none"
                        :stroke="maximize === 'off' ? '#c5c5c5' : '#1a1a1a'"
                    />
                </svg>
            </span>
            <span class="win-caption-button">
                <svg width="10" height="10" viewBox="0 0 10 10">
                    <path d="M.5.5l9 9M9.5.5l-9 9" stroke="#1a1a1a" />
                </svg>
            </span>
        </div>
        <div class="relative">
            <slot />
        </div>
    </div>
</template>

<style scoped lang="scss">
.win-window {
    position: absolute;
    z-index: 30;
    overflow: hidden;
    border: 1px solid rgb(0 0 0 / 0.28);
    border-radius: 8px;
    background: #fff;
    color: #000;
    box-shadow:
        0 12px 28px rgb(0 0 0 / 0.26),
        0 2px 6px rgb(0 0 0 / 0.14);
}

.win-caption-button {
    @apply flex h-[30px] w-[46px] shrink-0 items-center justify-center;
}
</style>

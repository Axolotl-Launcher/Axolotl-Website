<script setup lang="ts">
/** Edge's Downloads flyout, 360 px wide, opened from the toolbar at 100% scaling. */
defineProps<{ title: string }>()
</script>

<template>
    <div class="edge-flyout">
        <div class="flex h-[39px] items-center pl-4 pr-1">
            <span class="flex-1 text-[14px] font-semibold leading-none">{{ title }}</span>
            <span class="flyout-icon">
                <svg viewBox="0 0 20 20">
                    <path
                        d="M2.5 5.5a1 1 0 0 1 1-1h4l1.5 1.5h7.5a1 1 0 0 1 1 1v8.5a1 1 0 0 1-1 1h-13a1 1 0 0 1-1-1z"
                    />
                    <path d="M2.5 8.5h15" />
                </svg>
            </span>
            <span class="flyout-icon">
                <svg viewBox="0 0 20 20">
                    <circle cx="8.5" cy="8.5" r="5" />
                    <path d="M12.2 12.2l4.8 4.8" />
                </svg>
            </span>
            <span class="flyout-icon">
                <svg viewBox="0 0 20 20" stroke="none">
                    <circle cx="4.5" cy="10" r="1.2" fill="#1a1a1a" />
                    <circle cx="10" cy="10" r="1.2" fill="#1a1a1a" />
                    <circle cx="15.5" cy="10" r="1.2" fill="#1a1a1a" />
                </svg>
            </span>
            <span class="flyout-icon">
                <svg viewBox="0 0 20 20">
                    <path
                        d="M11.5 2.5l6 6-2 .8-3.3 3.3-.4 3.4-1.3 1.3-3.3-3.3L3 18m4.2-5.2L3.9 9.5l1.3-1.3 3.4-.4 3.3-3.3z"
                        stroke-linejoin="round"
                    />
                </svg>
            </span>
        </div>
        <div class="h-px bg-[#e0e0e0]" />
        <slot />
    </div>
</template>

<style scoped lang="scss">
.edge-flyout {
    position: absolute;
    z-index: 10;
    overflow: hidden;
    width: 360px;
    border-radius: 8px;
    background: #fff;
    color: #1a1a1a;
    box-shadow:
        0 0 0 1px rgb(0 0 0 / 0.08),
        0 8px 16px rgb(0 0 0 / 0.14);
}

.flyout-icon {
    @apply flex h-8 w-8 items-center justify-center;

    svg {
        width: 20px;
        height: 20px;
        fill: none;
        stroke: #1a1a1a;
        stroke-width: 1.15;
    }
}
</style>

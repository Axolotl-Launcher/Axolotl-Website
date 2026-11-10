<script setup lang="ts">
/**
 * The right-hand part of a maximized Microsoft Edge window in its light Windows 11
 * look, at 100% scaling. Everything is placed from the window's right edge, which
 * sits on the stage's right edge, as in a screenshot cropped to the toolbar.
 */
withDefaults(
    defineProps<{
        tabTitle: string
        favicon?: boolean
        /** How the toolbar's Downloads button looks. */
        downloads?: 'idle' | 'open' | 'warning'
    }>(),
    { favicon: false, downloads: 'idle' },
)
</script>

<template>
    <div class="edge-window">
        <div class="absolute inset-x-0 top-0 h-[34px] bg-[#d3d3d3]">
            <div class="edge-tab">
                <img v-if="favicon" src="/axolotl.png" alt="" class="size-4 shrink-0" />
                <svg v-else width="16" height="16" viewBox="0 0 16 16" class="shrink-0">
                    <rect
                        x="2.5"
                        y="2.5"
                        width="11"
                        height="11"
                        rx="2"
                        fill="none"
                        stroke="#5f5f5f"
                    />
                    <path d="M2.5 5.5h11" stroke="#5f5f5f" />
                </svg>
                <span class="min-w-0 flex-1 truncate">{{ tabTitle }}</span>
                <svg width="16" height="16" viewBox="0 0 16 16" class="shrink-0">
                    <path d="M4.5 4.5l7 7M11.5 4.5l-7 7" stroke="#1a1a1a" />
                </svg>
            </div>
            <svg class="absolute left-[262px] top-[9px]" width="16" height="16" viewBox="0 0 16 16">
                <path d="M8 2.5v11M2.5 8h11" stroke="#1a1a1a" />
            </svg>
            <span class="edge-caption right-[92px]">
                <svg width="10" height="10" viewBox="0 0 10 10">
                    <path d="M0 5.5h10" stroke="#1a1a1a" />
                </svg>
            </span>
            <span class="edge-caption right-[46px]">
                <svg width="10" height="10" viewBox="0 0 10 10">
                    <path
                        d="M2.5.5h6a1 1 0 0 1 1 1v6M.5 2.5h7v7h-7z"
                        fill="none"
                        stroke="#1a1a1a"
                    />
                </svg>
            </span>
            <span class="edge-caption right-0">
                <svg width="10" height="10" viewBox="0 0 10 10">
                    <path d="M.5.5l9 9M9.5.5l-9 9" stroke="#1a1a1a" />
                </svg>
            </span>
        </div>

        <div
            class="absolute inset-x-0 top-[34px] h-10 border-0 border-b border-solid border-[#e5e5e5] bg-white"
        >
            <svg class="edge-icon left-2" viewBox="0 0 20 20">
                <path d="M15.5 10a5.5 5.5 0 1 1-1.6-3.9M14.2 3v3.4h-3.4" />
            </svg>
            <div
                class="absolute left-[38px] top-1 flex h-8 w-[369px] items-center rounded-full border border-solid border-[#d3d3d3] bg-white"
            >
                <svg class="ml-2.5 shrink-0" width="16" height="16" viewBox="0 0 16 16">
                    <path
                        d="M4.5 7V5.5a3.5 3.5 0 0 1 7 0V7M3.5 7h9v6.5h-9z"
                        fill="none"
                        stroke="#1a1a1a"
                        stroke-linejoin="round"
                    />
                </svg>
                <span class="ml-2 min-w-0 flex-1 truncate text-[14px] leading-none text-[#1a1a1a]">
                    <slot name="address" />
                </span>
                <svg class="mr-[9px] shrink-0" width="20" height="20" viewBox="0 0 20 20">
                    <circle cx="10" cy="10" r="7" fill="none" stroke="#1a1a1a" stroke-width="1.1" />
                    <circle cx="7" cy="10" r=".9" fill="#1a1a1a" />
                    <circle cx="10" cy="10" r=".9" fill="#1a1a1a" />
                    <circle cx="13" cy="10" r=".9" fill="#1a1a1a" />
                </svg>
                <span class="h-5 w-px shrink-0 bg-[#d3d3d3]" />
                <svg class="mx-[9px] shrink-0" width="20" height="20" viewBox="0 0 20 20">
                    <path
                        d="M10 2.8l2.2 4.5 5 .7-3.6 3.5.9 4.9L10 14l-4.5 2.4.9-4.9L2.8 8l5-.7z"
                        fill="none"
                        stroke="#1a1a1a"
                        stroke-width="1.1"
                        stroke-linejoin="round"
                    />
                </svg>
            </div>
            <svg class="edge-icon right-[198px]" viewBox="0 0 20 20">
                <path
                    d="M8 3.5a1.5 1.5 0 0 1 3 0V5h3a1 1 0 0 1 1 1v3h-1.5a1.5 1.5 0 0 0 0 3H15v3a1 1 0 0 1-1 1h-3v-1.5a1.5 1.5 0 0 0-3 0V16H5a1 1 0 0 1-1-1v-3h1.5a1.5 1.5 0 0 0 0-3H4V6a1 1 0 0 1 1-1h3z"
                    stroke-linejoin="round"
                />
            </svg>
            <span class="absolute right-[187px] top-2.5 h-5 w-px bg-[#d3d3d3]" />
            <svg class="edge-icon right-[157px]" viewBox="0 0 20 20">
                <path
                    d="M7.5 3.5l1.6 3.3 3.6.5-2.6 2.5.6 3.6-3.2-1.7-3.2 1.7.6-3.6-2.6-2.5 3.6-.5z"
                    stroke-linejoin="round"
                />
                <path d="M13 8.5h4.5M12.5 12h5M10.5 15.5h7" />
            </svg>
            <span
                class="absolute right-[116px] top-1 flex size-8 items-center justify-center rounded"
                :class="{ 'bg-[#d5d5d5]': downloads !== 'idle' }"
            >
                <svg
                    class="size-5"
                    viewBox="0 0 20 20"
                    fill="none"
                    stroke="#1a1a1a"
                    stroke-width="1.2"
                >
                    <path d="M10 3v9.5M6 8.5l4 4 4-4M4 16.5h12" />
                </svg>
                <svg
                    v-if="downloads === 'warning'"
                    class="absolute bottom-[5px] right-[5px]"
                    width="10"
                    height="9"
                    viewBox="0 0 10 9"
                >
                    <path d="M5 .3l4.8 8.4H.2z" fill="#ee6a0f" />
                    <path d="M5 3v2.6M5 6.8v.4" stroke="#fff" stroke-width="1.1" />
                </svg>
            </span>
            <svg class="absolute right-[84px] top-2 size-6" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="12" fill="#d0d0d0" />
                <circle cx="12" cy="9.5" r="4" fill="#8f8f8f" />
                <path d="M4.6 19.5a8.5 6 0 0 1 14.8 0 11.5 11.5 0 0 1-14.8 0z" fill="#8f8f8f" />
            </svg>
            <svg class="edge-icon right-[49px]" viewBox="0 0 20 20" stroke="none">
                <circle cx="4.5" cy="10" r="1.2" fill="#1a1a1a" />
                <circle cx="10" cy="10" r="1.2" fill="#1a1a1a" />
                <circle cx="15.5" cy="10" r="1.2" fill="#1a1a1a" />
            </svg>
            <svg class="absolute right-3 top-2 size-6" viewBox="0 0 24 24">
                <defs>
                    <linearGradient id="dh-copilot-a" x1="0" y1="0" x2="1" y2="1">
                        <stop offset="0" stop-color="#0d6efd" />
                        <stop offset=".55" stop-color="#20c3a3" />
                        <stop offset="1" stop-color="#7ed957" />
                    </linearGradient>
                    <linearGradient id="dh-copilot-b" x1="1" y1="0" x2="0" y2="1">
                        <stop offset="0" stop-color="#ff7a59" />
                        <stop offset=".6" stop-color="#e6479b" />
                        <stop offset="1" stop-color="#8a4dff" />
                    </linearGradient>
                </defs>
                <path
                    d="M9.5 2.5h5L9 21.5H4.5a2 2 0 0 1-1.9-2.6l5-15a2 2 0 0 1 1.9-1.4z"
                    fill="url(#dh-copilot-a)"
                />
                <path
                    d="M14.5 21.5h-5L15 2.5h4.5a2 2 0 0 1 1.9 2.6l-5 15a2 2 0 0 1-1.9 1.4z"
                    fill="url(#dh-copilot-b)"
                />
            </svg>
        </div>

        <div class="absolute inset-x-0 bottom-0 top-[74px] overflow-hidden">
            <slot name="page" />
        </div>
        <slot />
    </div>
</template>

<style scoped lang="scss">
.edge-window {
    position: absolute;
    inset: 0;
    overflow: hidden;
    background: #fff;
    color: #1a1a1a;
}

.edge-tab {
    @apply absolute left-2 top-1.5 flex h-7 w-60 items-center gap-2.5 rounded-t-lg bg-white px-3 text-[12px] leading-none;
}

.edge-caption {
    @apply absolute top-0 flex h-[34px] w-[46px] items-center justify-center;
}

.edge-icon {
    position: absolute;
    top: 10px;
    width: 20px;
    height: 20px;
    fill: none;
    stroke: #1a1a1a;
    stroke-width: 1.15;
}
</style>

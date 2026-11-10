<script setup lang="ts">
/** A Microsoft Edge window in its light Windows 11 look, drawn at stage scale. */
defineProps<{ tabTitle: string; favicon?: boolean }>()
</script>

<template>
    <div class="edge-window">
        <div class="flex h-[34px] items-end gap-1 bg-[#e9ecf1] pl-2">
            <div class="edge-tab">
                <img v-if="favicon" src="/axolotl.png" alt="" class="size-4" />
                <span class="flex-1 truncate">{{ tabTitle }}</span>
                <svg width="10" height="10" viewBox="0 0 10 10" class="opacity-70">
                    <path d="M2 2l6 6M8 2L2 8" stroke="#333" stroke-width="1.2" />
                </svg>
            </div>
            <svg width="22" height="26" viewBox="0 0 22 22" class="mb-0.5">
                <path d="M11 6v10M6 11h10" stroke="#444" stroke-width="1.3" />
            </svg>
            <div class="ml-auto flex h-full self-start">
                <span class="edge-control">
                    <svg width="10" height="10" viewBox="0 0 10 10">
                        <path d="M0 5h10" stroke="#333" />
                    </svg>
                </span>
                <span class="edge-control">
                    <svg width="10" height="10" viewBox="0 0 10 10">
                        <rect
                            x=".5"
                            y=".5"
                            width="9"
                            height="9"
                            rx="1.5"
                            fill="none"
                            stroke="#333"
                        />
                    </svg>
                </span>
                <span class="edge-control">
                    <svg width="10" height="10" viewBox="0 0 10 10">
                        <path d="M0 0l10 10M10 0L0 10" stroke="#333" />
                    </svg>
                </span>
            </div>
        </div>
        <div
            class="flex h-10 items-center gap-1 border-0 border-b border-solid border-[#e3e3e3] bg-white px-2"
        >
            <svg
                v-for="path in ['M13 5l-5 5 5 5', 'M7 5l5 5-5 5']"
                :key="path"
                width="28"
                height="20"
                viewBox="0 0 20 20"
            >
                <path :d="path" fill="none" stroke="#555" stroke-width="1.4" />
            </svg>
            <svg width="28" height="20" viewBox="0 0 20 20">
                <path
                    d="M15 10a5 5 0 1 1-1.5-3.6M14 3.5v3.2h-3.2"
                    fill="none"
                    stroke="#555"
                    stroke-width="1.4"
                />
            </svg>
            <div
                class="flex h-7 w-[260px] items-center gap-2 rounded-full bg-[#f1f3f5] px-3 text-[12px] text-[#222]"
            >
                <svg width="12" height="12" viewBox="0 0 12 12">
                    <rect x="2" y="5.5" width="8" height="5.5" rx="1" fill="#555" />
                    <path
                        d="M4 5.5V4a2 2 0 0 1 4 0v1.5"
                        fill="none"
                        stroke="#555"
                        stroke-width="1.2"
                    />
                </svg>
                <span class="truncate"><slot name="address" /></span>
            </div>
            <div class="ml-auto flex items-center">
                <span class="edge-action">
                    <svg width="16" height="16" viewBox="0 0 16 16">
                        <path
                            d="M8 1.8l1.9 3.9 4.3.6-3.1 3 .7 4.3L8 11.6l-3.8 2 .7-4.3-3.1-3 4.3-.6z"
                            fill="none"
                            stroke="#555"
                            stroke-width="1.1"
                        />
                    </svg>
                </span>
                <span class="edge-action bg-[#e8eaed]">
                    <svg width="16" height="16" viewBox="0 0 16 16">
                        <path
                            d="M8 2v8M4.5 6.8L8 10.3l3.5-3.5M3 13.5h10"
                            fill="none"
                            stroke="#333"
                            stroke-width="1.3"
                        />
                    </svg>
                </span>
                <span class="edge-action text-[15px] font-bold tracking-[1px] text-[#555]"
                    >···</span
                >
                <span class="ml-1 size-6 rounded-full bg-[#7aa7e8]" />
            </div>
        </div>
        <div class="relative h-full bg-white">
            <slot name="page" />
        </div>
        <slot />
    </div>
</template>

<style scoped lang="scss">
.edge-window {
    position: absolute;
    overflow: hidden;
    border: 1px solid rgb(0 0 0 / 0.18);
    border-radius: 10px;
    background: #fff;
    box-shadow: 0 18px 40px rgb(0 0 0 / 0.28);
}

.edge-tab {
    display: flex;
    align-items: center;
    gap: 8px;
    width: 200px;
    height: 28px;
    padding: 0 10px;
    border-radius: 8px 8px 0 0;
    background: #fff;
    color: #222;
    font-size: 12px;
}

.edge-control {
    display: grid;
    place-items: center;
    width: 44px;
    height: 30px;
}

.edge-action {
    display: grid;
    place-items: center;
    width: 32px;
    height: 28px;
    border-radius: 6px;
}
</style>

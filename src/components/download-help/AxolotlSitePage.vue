<script setup lang="ts">
/** The right-hand part of this website's landing page, as it shows inside the drawn Edge tab. */
defineProps<{ downloadLabel: string }>()
</script>

<template>
    <div class="absolute inset-0 overflow-hidden bg-[#0f0f12]">
        <div
            class="absolute -right-24 top-24 h-80 w-[420px] rounded-full bg-[radial-gradient(closest-side,rgb(244_114_182/0.28),transparent)]"
        />
        <div
            class="absolute right-[52px] top-3.5 flex h-9 items-center gap-2 rounded-full bg-[#ff8dc8] px-4 text-[14px] font-semibold text-[#2a0e1c]"
        >
            <svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                stroke="currentColor"
                stroke-width="1.6"
            >
                <path d="M8 2.5v7.5M4.8 7l3.2 3.2L11.2 7M3 13.5h10" />
            </svg>
            {{ downloadLabel }}
        </div>
        <svg
            class="absolute right-4 top-[22px]"
            width="20"
            height="20"
            viewBox="0 0 20 20"
            fill="none"
            stroke="#d4d4d8"
            stroke-width="1.5"
        >
            <circle cx="10" cy="10" r="2.6" />
            <path
                d="M10 2.5v2M10 15.5v2M2.5 10h2M15.5 10h2M4.7 4.7l1.4 1.4M13.9 13.9l1.4 1.4M4.7 15.3l1.4-1.4M13.9 6.1l1.4-1.4"
            />
        </svg>
        <div class="absolute left-0 top-[150px] h-12 w-[300px] rounded-r-lg bg-[#1b1b20]" />
        <div class="absolute left-0 top-[214px] h-3 w-[240px] rounded-r bg-[#27272c]" />
        <div class="absolute left-0 top-[238px] h-3 w-[200px] rounded-r bg-[#27272c]" />
        <div
            class="absolute left-[340px] top-[150px] h-[300px] w-[420px] rounded-xl border border-solid border-[#2c2c33] bg-[#17171b]"
        />
    </div>
</template>

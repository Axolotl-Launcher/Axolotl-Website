<script setup lang="ts">
import { defineMessages, useVIntl } from '@modrinth/ui'

import EdgeWindow from './EdgeWindow.vue'
import HelpCursor from './HelpCursor.vue'

defineProps<{ step: number; fileName: string }>()

const { formatMessage } = useVIntl()

const messages = defineMessages({
    downloads: { id: 'axolotl-download-help.edge.downloads', defaultMessage: 'Downloads' },
    warning: {
        id: 'axolotl-download-help.edge.warning',
        defaultMessage:
            "{file} isn't commonly downloaded. Make sure you trust {file} before you open it.",
    },
    seeMore: { id: 'axolotl-download-help.edge.see-more', defaultMessage: 'See more' },
    delete: { id: 'axolotl-download-help.edge.delete', defaultMessage: 'Delete' },
    keep: { id: 'axolotl-download-help.edge.keep', defaultMessage: 'Keep' },
    reportFile: {
        id: 'axolotl-download-help.edge.report-file',
        defaultMessage: 'Report this file as safe',
    },
    learnMore: { id: 'axolotl-download-help.edge.learn-more', defaultMessage: 'Learn more' },
    copyLink: { id: 'axolotl-download-help.edge.copy-link', defaultMessage: 'Copy download link' },
    dialogTitle: {
        id: 'axolotl-download-help.edge.dialog-title',
        defaultMessage: 'Make sure you trust {file} before you open it',
    },
    dialogBody: {
        id: 'axolotl-download-help.edge.dialog-body',
        defaultMessage:
            "Microsoft Defender SmartScreen couldn't verify if this file is safe because it isn't commonly downloaded. Make sure you trust the file you're downloading or its source before you open it.",
    },
    name: { id: 'axolotl-download-help.edge.name', defaultMessage: 'Name: {file}' },
    publisher: {
        id: 'axolotl-download-help.edge.publisher',
        defaultMessage: 'Publisher: Unknown',
    },
    reportApp: {
        id: 'axolotl-download-help.edge.report-app',
        defaultMessage: 'Report this app as safe',
    },
    showMore: { id: 'axolotl-download-help.edge.show-more', defaultMessage: 'Show more' },
    cancel: { id: 'axolotl-download-help.edge.cancel', defaultMessage: 'Cancel' },
    keepAnyway: { id: 'axolotl-download-help.edge.keep-anyway', defaultMessage: 'Keep anyway' },
    openFile: { id: 'axolotl-download-help.edge.open-file', defaultMessage: 'Open file' },
})

/** Where the pointer rests at the end of each step, in stage pixels. */
const CURSOR_END = [
    { x: 480, y: 235 },
    { x: 481, y: 293 },
    { x: 470, y: 280 },
]
</script>

<template>
    <div :key="step" class="absolute inset-0">
        <EdgeWindow tab-title="Axolotl Launcher" favicon class="left-6 top-6 h-[400px] w-[592px]">
            <template #address>axlmc.org</template>
            <template #page>
                <div class="absolute left-10 top-12 flex w-[240px] flex-col gap-3 opacity-60">
                    <span class="text-[11px] font-semibold text-[#1a9f55]">Minecraft Java</span>
                    <span class="text-[30px] font-bold leading-tight">Axolotl Launcher</span>
                    <span class="h-2 w-[210px] rounded bg-[#e2e5ea]" />
                    <span class="h-2 w-[160px] rounded bg-[#e2e5ea]" />
                    <span class="mt-2 h-8 w-[130px] rounded-full bg-[#1bd96a]" />
                </div>
            </template>

            <div
                v-if="step > 0"
                class="dh-appear absolute inset-x-0 bottom-0 top-[74px] bg-black/25"
                :class="{ 'dh-vanish': step === 2 }"
                :style="{ '--at': step === 2 ? 0.46 : 0 }"
            />

            <div class="flyout left-[240px] top-[78px] h-[184px] w-[340px]">
                <div class="flex h-11 items-center px-4">
                    <span class="flex-1 text-[14px] font-semibold">
                        {{ formatMessage(messages.downloads) }}
                    </span>
                    <span class="flex items-center gap-3 text-[#555]">
                        <svg width="14" height="14" viewBox="0 0 14 14">
                            <path
                                d="M1.5 3.5h4l1 1.5h6v6.5h-11z"
                                fill="none"
                                stroke="#555"
                                stroke-width="1.1"
                            />
                        </svg>
                        <svg width="14" height="14" viewBox="0 0 14 14">
                            <circle
                                cx="6"
                                cy="6"
                                r="4"
                                fill="none"
                                stroke="#555"
                                stroke-width="1.1"
                            />
                            <path d="M9 9l3.5 3.5" stroke="#555" stroke-width="1.1" />
                        </svg>
                        <span class="text-[13px] font-bold tracking-[1px]">···</span>
                    </span>
                </div>
                <div class="item" :class="{ 'dh-vanish': step === 2 }" style="--at: 0.54">
                    <svg class="mt-0.5 shrink-0" width="18" height="18" viewBox="0 0 18 18">
                        <path
                            d="M9 1.5l6.5 2.5v4.5c0 4-2.8 6.9-6.5 8-3.7-1.1-6.5-4-6.5-8V4z"
                            fill="#f2b400"
                        />
                        <path
                            d="M9 5.2v4.6M9 12v.2"
                            stroke="#3a2a00"
                            stroke-width="1.6"
                            stroke-linecap="round"
                        />
                    </svg>
                    <p class="m-0 line-clamp-5 w-[208px] break-all text-[11.5px] leading-[16px]">
                        {{ formatMessage(messages.warning, { file: fileName }) }}
                    </p>
                    <span class="item-button right-11">
                        <svg width="14" height="14" viewBox="0 0 14 14">
                            <path
                                d="M2.5 3.5h9M5.5 3.5V2h3v1.5M3.5 3.5l.6 8.5h5.8l.6-8.5"
                                fill="none"
                                stroke="#444"
                                stroke-width="1.1"
                            />
                        </svg>
                    </span>
                    <span class="item-button right-2" :class="{ 'bg-[#e1e3e6]': step === 0 }">
                        <span class="text-[14px] font-bold tracking-[1px]">···</span>
                    </span>
                </div>
                <div v-if="step === 2" class="item dh-appear !bg-transparent" style="--at: 0.56">
                    <svg class="shrink-0" width="20" height="24" viewBox="0 0 20 24">
                        <path d="M2 1h11l5 5v17H2z" fill="#f4f6f9" stroke="#8a94a3" />
                        <rect x="5" y="9" width="10" height="9" rx="1.5" fill="#2f7be8" />
                    </svg>
                    <div class="flex w-[260px] flex-col gap-1">
                        <span class="break-all text-[11.5px] leading-[16px]">{{ fileName }}</span>
                        <span class="text-[11.5px] font-semibold text-[#0f6cbd] underline">
                            {{ formatMessage(messages.openFile) }}
                        </span>
                    </div>
                </div>
                <span class="absolute bottom-3 left-4 text-[11.5px] font-semibold text-[#0f6cbd]">
                    {{ formatMessage(messages.seeMore) }}
                </span>

                <div
                    v-if="step === 0"
                    class="menu dh-appear left-[156px] top-[84px] w-[176px]"
                    style="--at: 0.34"
                >
                    <span class="menu-row">
                        <span class="menu-icon"
                            ><svg width="12" height="12" viewBox="0 0 14 14">
                                <path
                                    d="M2.5 3.5h9M5.5 3.5V2h3v1.5M3.5 3.5l.6 8.5h5.8l.6-8.5"
                                    fill="none"
                                    stroke="#444"
                                    stroke-width="1.1"
                                /></svg></span
                        >{{ formatMessage(messages.delete) }}
                    </span>
                    <span class="menu-row bg-[#eef0f3]">
                        <span class="menu-icon"
                            ><svg width="12" height="12" viewBox="0 0 12 12">
                                <path
                                    d="M2 6.5l2.6 2.6L10 3.5"
                                    fill="none"
                                    stroke="#444"
                                    stroke-width="1.3"
                                /></svg></span
                        >{{ formatMessage(messages.keep) }}
                    </span>
                    <span class="menu-row">
                        <span class="menu-icon"
                            ><svg width="12" height="12" viewBox="0 0 12 12">
                                <path
                                    d="M2.5 11V1.5h6.5L8 4l1 2.5H2.5"
                                    fill="none"
                                    stroke="#444"
                                    stroke-width="1.1"
                                /></svg></span
                        >{{ formatMessage(messages.reportFile) }}
                    </span>
                    <span class="menu-row">
                        <span class="menu-icon"
                            ><svg width="12" height="12" viewBox="0 0 12 12">
                                <circle cx="6" cy="6" r="4.8" fill="none" stroke="#444" />
                                <path
                                    d="M6 5.2V9M6 3.3v.4"
                                    stroke="#444"
                                    stroke-width="1.1"
                                /></svg></span
                        >{{ formatMessage(messages.learnMore) }}
                    </span>
                    <span class="menu-row">
                        <span class="menu-icon"
                            ><svg width="12" height="12" viewBox="0 0 12 12">
                                <rect
                                    x="3.5"
                                    y="3.5"
                                    width="7"
                                    height="7"
                                    rx="1"
                                    fill="none"
                                    stroke="#444"
                                />
                                <path d="M1.5 8V1.5H8" fill="none" stroke="#444" /></svg></span
                        >{{ formatMessage(messages.copyLink) }}
                    </span>
                </div>
            </div>

            <div
                v-if="step > 0"
                class="dialog left-[106px] top-20 h-[220px] w-[380px]"
                :class="step === 1 ? 'dh-appear' : 'dh-vanish'"
                :style="{ '--at': step === 1 ? 0 : 0.46 }"
            >
                <p class="m-0 line-clamp-2 break-all text-[14px] font-semibold leading-[19px]">
                    {{ formatMessage(messages.dialogTitle, { file: fileName }) }}
                </p>
                <p class="m-0 mt-2 line-clamp-3 text-[10.5px] leading-[15px] text-[#555]">
                    {{ formatMessage(messages.dialogBody) }}
                </p>
                <p class="m-0 mt-2 truncate text-[10.5px] text-[#555]">
                    {{ formatMessage(messages.name, { file: fileName }) }}
                </p>
                <p class="m-0 text-[10.5px] text-[#555]">{{ formatMessage(messages.publisher) }}</p>
                <p class="m-0 mt-1.5 flex gap-4 text-[10.5px] text-[#0f6cbd]">
                    <span>{{ formatMessage(messages.reportApp) }}</span>
                    <span>{{ formatMessage(messages.showMore) }}</span>
                </p>
                <div class="absolute bottom-4 right-4 flex gap-2">
                    <span
                        class="dialog-button w-[76px] justify-center border border-solid border-[#d0d0d0] bg-white"
                    >
                        {{ formatMessage(messages.cancel) }}
                    </span>
                    <span class="dialog-button w-24 bg-[#0f6cbd] text-white">
                        <span class="flex-1 text-center">{{ formatMessage(messages.delete) }}</span>
                        <span
                            class="flex h-full w-[26px] items-center justify-center border-0 border-l border-solid border-white/40"
                            :class="{ 'bg-[#0b5799]': step === 2 }"
                        >
                            <svg width="10" height="10" viewBox="0 0 10 10">
                                <path
                                    d="M2 3.5l3 3 3-3"
                                    fill="none"
                                    stroke="#fff"
                                    stroke-width="1.3"
                                />
                            </svg>
                        </span>
                    </span>
                </div>
                <div v-if="step === 2" class="menu left-[244px] top-[208px] w-[120px]">
                    <span class="menu-row bg-[#eef0f3]">{{
                        formatMessage(messages.keepAnyway)
                    }}</span>
                </div>
            </div>
        </EdgeWindow>

        <template v-if="step === 0">
            <span
                class="dh-hint left-[557px] top-[153px] h-[34px] w-[34px]"
                style="--from: 0.04; --to: 0.32"
            />
            <span
                class="dh-hint left-[422px] top-[218px] h-[34px] w-[172px]"
                style="--from: 0.38; --to: 0.62"
            />
            <span class="dh-ripple left-[574px] top-[170px]" style="--at: 0.3" />
            <span class="dh-ripple left-[480px] top-[235px]" style="--at: 0.58" />
        </template>
        <template v-else-if="step === 1">
            <span
                class="dh-hint left-[465px] top-[275px] h-9 w-8"
                style="--from: 0.12; --to: 0.48"
            />
            <span class="dh-ripple left-[481px] top-[293px]" style="--at: 0.44" />
        </template>
        <template v-else>
            <span
                class="dh-hint left-[375px] top-[313px] h-9 w-[118px]"
                style="--from: 0.06; --to: 0.36"
            />
            <span class="dh-ripple left-[434px] top-[331px]" style="--at: 0.34" />
        </template>

        <HelpCursor
            :class="`cursor-${step}`"
            :style="{ transform: `translate(${CURSOR_END[step].x}px, ${CURSOR_END[step].y}px)` }"
        />
    </div>
</template>

<style scoped lang="scss">
.flyout {
    position: absolute;
    z-index: 10;
    border: 1px solid rgb(0 0 0 / 0.08);
    border-radius: 8px;
    background: #fff;
    box-shadow: 0 8px 24px rgb(0 0 0 / 0.18);
}

.item {
    @apply absolute left-2 top-11 flex h-24 w-[324px] gap-2.5 rounded-md bg-[#f3f4f6] p-3;
}

.item-button {
    @apply absolute top-2.5 grid h-7 w-7 place-items-center rounded-md text-[#444];
}

.menu {
    position: absolute;
    z-index: 20;
    display: flex;
    flex-direction: column;
    padding: 4px;
    border: 1px solid rgb(0 0 0 / 0.08);
    border-radius: 8px;
    background: #fff;
    box-shadow: 0 8px 22px rgb(0 0 0 / 0.2);
}

.menu-row {
    @apply flex h-[30px] items-center gap-2 whitespace-nowrap rounded px-3 text-[12px];
}

.menu-icon {
    @apply w-4 text-center text-[12px] text-[#555];
}

.dialog {
    position: absolute;
    z-index: 30;
    padding: 18px 20px;
    border-radius: 8px;
    background: #fff;
    box-shadow: 0 16px 40px rgb(0 0 0 / 0.3);
}

.dialog-button {
    @apply flex h-[30px] items-center overflow-hidden rounded text-[12px];
}

.cursor-0 {
    animation-name: cursor-0;
}

.cursor-1 {
    animation-name: cursor-1;
}

.cursor-2 {
    animation-name: cursor-2;
}

@keyframes cursor-0 {
    0%,
    8% {
        transform: translate(330px, 250px);
        animation-timing-function: cubic-bezier(0.45, 0, 0.2, 1);
    }
    28% {
        transform: translate(574px, 170px);
    }
    31% {
        transform: translate(574px, 170px) scale(0.85);
    }
    34% {
        transform: translate(574px, 170px);
        animation-timing-function: cubic-bezier(0.45, 0, 0.2, 1);
    }
    55% {
        transform: translate(480px, 235px);
    }
    58% {
        transform: translate(480px, 235px) scale(0.85);
    }
    61%,
    100% {
        transform: translate(480px, 235px);
    }
}

@keyframes cursor-1 {
    0%,
    14% {
        transform: translate(480px, 235px);
        animation-timing-function: cubic-bezier(0.45, 0, 0.2, 1);
    }
    40% {
        transform: translate(481px, 293px);
    }
    44% {
        transform: translate(481px, 293px) scale(0.85);
    }
    48%,
    100% {
        transform: translate(481px, 293px);
    }
}

@keyframes cursor-2 {
    0%,
    8% {
        transform: translate(481px, 293px);
        animation-timing-function: cubic-bezier(0.45, 0, 0.2, 1);
    }
    30% {
        transform: translate(434px, 331px);
    }
    34% {
        transform: translate(434px, 331px) scale(0.85);
    }
    38%,
    62% {
        transform: translate(434px, 331px);
        animation-timing-function: cubic-bezier(0.45, 0, 0.2, 1);
    }
    80%,
    100% {
        transform: translate(470px, 280px);
    }
}
</style>

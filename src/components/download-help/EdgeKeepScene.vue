<script setup lang="ts">
import { defineMessages, useVIntl } from '@modrinth/ui'

import AxolotlSitePage from './AxolotlSitePage.vue'
import EdgeFlyout from './EdgeFlyout.vue'
import EdgeWindow from './EdgeWindow.vue'
import HelpCursor from './HelpCursor.vue'
import { centreVariables, useStageTargets } from './use-stage-targets'

const props = defineProps<{ step: number; fileName: string }>()

const { formatMessage } = useVIntl()

// The wording comes from Edge's own zh-CN and en-US locale packs.
const messages = defineMessages({
    tabTitle: {
        id: 'axolotl-download-help.edge.tab-title',
        defaultMessage: 'Axolotl Launcher - Free, Open-Source Minecraft Java Launcher',
    },
    siteDownload: { id: 'axolotl-download-help.edge.site-download', defaultMessage: 'Download' },
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
    cancel: { id: 'axolotl-download-help.edge.cancel', defaultMessage: 'Cancel' },
    keepAnyway: { id: 'axolotl-download-help.edge.keep-anyway', defaultMessage: 'Keep anyway' },
    openFile: { id: 'axolotl-download-help.edge.open-file', defaultMessage: 'Open file' },
})

const root = ref<HTMLElement | null>(null)
const targets = useStageTargets(root)

/** How far the view scrolls up so the dialog's buttons and their menu stay in view. */
const pan = computed(() => {
    const chevron = targets.value.chevron
    if (!chevron) return 0
    return Math.min(0, 488 - (chevron.y + chevron.h + 6 + 36))
})

/** The flyout grows to hold the dialog, ending 64 px below it as Edge draws it. */
const flyoutHeight = computed(() => {
    const chevron = targets.value.chevron
    if (!chevron) return 455
    return Math.max(455, chevron.y + chevron.h + 22 + 64 - 71)
})

const rootStyle = computed(() => ({
    ...centreVariables(targets.value),
    '--pan': `${pan.value}px`,
    '--flyout-h': `${flyoutHeight.value}px`,
}))

function ring(name: string, pad = 3) {
    const rect = targets.value[name]
    if (!rect) return { display: 'none' }
    return {
        left: `${rect.x - pad}px`,
        top: `${rect.y - pad}px`,
        width: `${rect.w + pad * 2}px`,
        height: `${rect.h + pad * 2}px`,
    }
}

function ripple(name: string) {
    const rect = targets.value[name]
    if (!rect) return { display: 'none' }
    return { left: `${rect.x + rect.w / 2}px`, top: `${rect.y + rect.h / 2}px` }
}

const cursorEnd = computed(
    () =>
        [
            'translate(var(--keep-cx), var(--keep-cy))',
            'translate(var(--chevron-cx), var(--chevron-cy))',
            'translate(470px, 290px)',
        ][props.step],
)
</script>

<template>
    <div
        ref="root"
        class="pan absolute inset-x-0 top-0 h-[720px]"
        :class="`pan-${step}`"
        :style="rootStyle"
    >
        <EdgeWindow
            :tab-title="formatMessage(messages.tabTitle)"
            favicon
            :downloads="step === 2 ? 'open' : 'warning'"
        >
            <template #address>https://axlmc.org</template>
            <template #page>
                <AxolotlSitePage :download-label="formatMessage(messages.siteDownload)" />
            </template>
        </EdgeWindow>

        <EdgeFlyout
            :title="formatMessage(messages.downloads)"
            class="flyout left-[165px] top-[71px]"
            :class="`flyout-${step}`"
        >
            <div
                class="item"
                :class="{ 'bg-[#f4f4f4]': step === 0, 'dh-vanish': step === 2 }"
                style="--at: 0.5"
            >
                <svg
                    class="absolute left-[10px] top-[9px]"
                    width="16"
                    height="16"
                    viewBox="0 0 16 16"
                >
                    <path
                        d="M8 1.2l7.2 12.8H.8z"
                        fill="#ee6a0f"
                        stroke="#ee6a0f"
                        stroke-linejoin="round"
                    />
                    <path d="M8 5.6v4.2M8 11.6v.6" stroke="#fff" stroke-width="1.5" />
                </svg>
                <p class="item-text line-clamp-2">
                    {{ formatMessage(messages.warning, { file: fileName }) }}
                </p>
                <span
                    v-if="step === 0"
                    class="absolute right-0 top-[3px] flex h-7 items-center gap-2 bg-[#f4f4f4] pl-1.5 pr-0.5"
                >
                    <span class="item-button">
                        <svg
                            width="20"
                            height="20"
                            viewBox="0 0 20 20"
                            fill="none"
                            stroke="#1a1a1a"
                            stroke-width="1.15"
                        >
                            <path
                                d="M3.5 5.5h13M8 5.5V4h4v1.5M5 5.5l.8 11h8.4l.8-11M8.5 8.5v5.5M11.5 8.5v5.5"
                            />
                        </svg>
                    </span>
                    <span class="item-button bg-[#e5e5e5]" data-target="more">
                        <svg width="20" height="20" viewBox="0 0 20 20">
                            <circle cx="4.5" cy="10" r="1.2" fill="#0f6cbd" />
                            <circle cx="10" cy="10" r="1.2" fill="#0f6cbd" />
                            <circle cx="15.5" cy="10" r="1.2" fill="#0f6cbd" />
                        </svg>
                    </span>
                </span>
            </div>
            <div v-if="step === 2" class="item dh-appear" style="--at: 0.52">
                <img src="/axolotl.png" alt="" class="absolute left-2.5 top-2 size-5" />
                <div class="item-text">
                    <span class="block truncate">{{ fileName }}</span>
                    <span class="block text-[#115ea3]">{{ formatMessage(messages.openFile) }}</span>
                </div>
            </div>
            <span class="absolute left-[26px] top-[104px] text-[14px] font-semibold leading-[19px]">
                {{ formatMessage(messages.seeMore) }}
            </span>
            <div
                v-if="step > 0"
                class="absolute inset-0 bg-black/10"
                :class="step === 1 ? 'dh-appear' : 'dh-vanish'"
                :style="{ '--at': step === 1 ? 0 : 0.46 }"
            />
        </EdgeFlyout>

        <div
            v-if="step === 0"
            class="menu dh-appear left-[351px] top-[145px] w-[163px]"
            style="--at: 0.33"
        >
            <span class="menu-row">
                <svg class="menu-icon" viewBox="0 0 20 20">
                    <path
                        d="M3.5 5.5h13M8 5.5V4h4v1.5M5 5.5l.8 11h8.4l.8-11M8.5 8.5v5.5M11.5 8.5v5.5"
                    />
                </svg>
                {{ formatMessage(messages.delete) }}
            </span>
            <span class="menu-row bg-[#ebebec]" data-target="keep">
                {{ formatMessage(messages.keep) }}
            </span>
            <span class="menu-separator" />
            <span class="menu-row">{{ formatMessage(messages.reportFile) }}</span>
            <span class="menu-row">{{ formatMessage(messages.learnMore) }}</span>
            <span class="menu-separator" />
            <span class="menu-row">
                <svg class="menu-icon" viewBox="0 0 20 20">
                    <path d="M8 6.5H6a3.5 3.5 0 0 0 0 7h2M12 6.5h2a3.5 3.5 0 0 1 0 7h-2M6.5 10h7" />
                </svg>
                {{ formatMessage(messages.copyLink) }}
            </span>
        </div>

        <div
            v-if="step > 0"
            class="dialog left-[165px] top-[135px]"
            :class="step === 1 ? 'dh-appear' : 'dh-vanish'"
            :style="{ '--at': step === 1 ? 0 : 0.46 }"
        >
            <svg class="absolute left-[18px] top-[25px]" width="16" height="16" viewBox="0 0 16 16">
                <path
                    d="M8 1.2l7.2 12.8H.8z"
                    fill="#ee6a0f"
                    stroke="#ee6a0f"
                    stroke-linejoin="round"
                />
                <path d="M8 5.6v4.2M8 11.6v.6" stroke="#fff" stroke-width="1.5" />
            </svg>
            <p
                class="m-0 text-[20px] font-semibold leading-[26px] text-[#1a1a1a] [overflow-wrap:anywhere]"
            >
                {{ formatMessage(messages.dialogTitle, { file: fileName }) }}
            </p>
            <p class="m-0 mt-[9px] text-[14px] leading-5 text-[#606060]">
                {{ formatMessage(messages.dialogBody) }}
            </p>
            <p class="m-0 mt-3 text-[14px] leading-[21px] text-[#606060] [overflow-wrap:anywhere]">
                {{ formatMessage(messages.name, { file: fileName }) }}<br />
                {{ formatMessage(messages.publisher) }}
            </p>
            <p class="m-0 mt-3 text-[14px] leading-5 text-[#115ea3]">
                {{ formatMessage(messages.reportApp) }}
            </p>
            <p class="m-0 mt-3 text-[14px] leading-5 text-[#115ea3]">
                {{ formatMessage(messages.learnMore) }}
            </p>
            <div class="relative mt-[15px] flex justify-end gap-[9px]">
                <span
                    class="dialog-button w-[95px] border border-solid border-[#d1d1d1] bg-white text-[#1a1a1a]"
                >
                    {{ formatMessage(messages.cancel) }}
                </span>
                <span class="flex h-[31px] overflow-hidden rounded bg-[#1769f0] text-white">
                    <span class="dialog-button w-24">{{ formatMessage(messages.delete) }}</span>
                    <span
                        class="flex w-8 items-center justify-center border-0 border-l border-solid border-white/35"
                        :class="{ 'bg-[#1f5dd4]': step === 2 }"
                        data-target="chevron"
                    >
                        <svg width="12" height="12" viewBox="0 0 12 12">
                            <path
                                d="M2.5 4.5l3.5 3.5 3.5-3.5"
                                fill="none"
                                stroke="#fff"
                                stroke-width="1.2"
                            />
                        </svg>
                    </span>
                </span>
                <div
                    v-if="step === 2"
                    class="menu dh-appear right-0 top-[37px] w-[170px] !py-0"
                    style="--at: 0"
                >
                    <span class="menu-row h-9 pl-[14px] text-[#3a3a3a]" data-target="keepAnyway">
                        {{ formatMessage(messages.keepAnyway) }}
                    </span>
                </div>
            </div>
        </div>

        <template v-if="step === 0">
            <span class="dh-hint" :style="{ ...ring('more'), '--from': 0.04, '--to': 0.32 }" />
            <span class="dh-hint" :style="{ ...ring('keep', 2), '--from': 0.36, '--to': 0.62 }" />
            <span class="dh-ripple" :style="{ ...ripple('more'), '--at': 0.3 }" />
            <span class="dh-ripple" :style="{ ...ripple('keep'), '--at': 0.58 }" />
        </template>
        <template v-else-if="step === 1">
            <span class="dh-hint" :style="{ ...ring('chevron'), '--from': 0.14, '--to': 0.48 }" />
            <span class="dh-ripple" :style="{ ...ripple('chevron'), '--at': 0.44 }" />
        </template>
        <template v-else>
            <span
                class="dh-hint"
                :style="{ ...ring('keepAnyway', 2), '--from': 0.06, '--to': 0.36 }"
            />
            <span class="dh-ripple" :style="{ ...ripple('keepAnyway'), '--at': 0.34 }" />
        </template>

        <HelpCursor :class="`cursor-${step}`" :style="{ transform: cursorEnd }" />
    </div>
</template>

<style scoped lang="scss">
.pan {
    animation-duration: var(--d);
    animation-fill-mode: both;
}

.pan-1 {
    transform: translateY(var(--pan));
    animation-name: pan-in;
}

.pan-2 {
    animation-name: pan-out;
}

.flyout {
    height: 129px;
}

.flyout-1 {
    height: var(--flyout-h);
}

.flyout-2 {
    animation: flyout-shrink var(--d) both;
}

.item {
    @apply absolute left-1.5 top-[46px] h-[46px] w-[347px] rounded;
}

.item-text {
    @apply absolute left-9 top-1.5 m-0 w-[298px] text-[12px] leading-[19px] [overflow-wrap:anywhere];
}

.item-button {
    @apply flex size-7 items-center justify-center rounded;
}

.menu {
    position: absolute;
    z-index: 20;
    display: flex;
    flex-direction: column;
    padding: 4px 0;
    border-radius: 8px;
    background: #fff;
    color: #1a1a1a;
    box-shadow:
        0 0 0 1px rgb(0 0 0 / 0.06),
        0 8px 16px rgb(0 0 0 / 0.16);
}

.menu-row {
    @apply relative mx-1 flex h-8 shrink-0 items-center whitespace-nowrap rounded pl-[38px] text-[12px];
}

.menu-icon {
    position: absolute;
    left: 8px;
    width: 20px;
    height: 20px;
    fill: none;
    stroke: #1a1a1a;
    stroke-width: 1.15;
}

.menu-separator {
    @apply my-1 h-px shrink-0 bg-[#dfe0e3];
}

.dialog {
    position: absolute;
    z-index: 30;
    width: 360px;
    padding: 19px 22px 22px 44px;
    border-radius: 8px;
    background: #fff;
    box-shadow:
        0 0 0 1px rgb(0 0 0 / 0.06),
        0 12px 28px rgb(0 0 0 / 0.22);
}

.dialog-button {
    @apply flex h-[31px] items-center justify-center rounded text-[14px] font-semibold;
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

@keyframes pan-in {
    0%,
    4% {
        transform: translateY(0);
        animation-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
    }
    16%,
    100% {
        transform: translateY(var(--pan));
    }
}

@keyframes pan-out {
    0%,
    50% {
        transform: translateY(var(--pan));
        animation-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
    }
    62%,
    100% {
        transform: translateY(0);
    }
}

@keyframes flyout-shrink {
    0%,
    47% {
        height: var(--flyout-h);
    }
    52%,
    100% {
        height: 129px;
    }
}

@keyframes cursor-0 {
    0%,
    8% {
        transform: translate(330px, 300px);
        animation-timing-function: cubic-bezier(0.45, 0, 0.2, 1);
    }
    28% {
        transform: translate(var(--more-cx), var(--more-cy));
    }
    31% {
        transform: translate(var(--more-cx), var(--more-cy)) scale(0.9);
    }
    34% {
        transform: translate(var(--more-cx), var(--more-cy));
        animation-timing-function: cubic-bezier(0.45, 0, 0.2, 1);
    }
    55% {
        transform: translate(var(--keep-cx), var(--keep-cy));
    }
    58% {
        transform: translate(var(--keep-cx), var(--keep-cy)) scale(0.9);
    }
    61%,
    100% {
        transform: translate(var(--keep-cx), var(--keep-cy));
    }
}

@keyframes cursor-1 {
    0%,
    16% {
        transform: translate(433px, 197px);
        animation-timing-function: cubic-bezier(0.45, 0, 0.2, 1);
    }
    40% {
        transform: translate(var(--chevron-cx), var(--chevron-cy));
    }
    44% {
        transform: translate(var(--chevron-cx), var(--chevron-cy)) scale(0.9);
    }
    48%,
    100% {
        transform: translate(var(--chevron-cx), var(--chevron-cy));
    }
}

@keyframes cursor-2 {
    0%,
    8% {
        transform: translate(var(--chevron-cx), var(--chevron-cy));
        animation-timing-function: cubic-bezier(0.45, 0, 0.2, 1);
    }
    30% {
        transform: translate(var(--keepAnyway-cx), var(--keepAnyway-cy));
    }
    34% {
        transform: translate(var(--keepAnyway-cx), var(--keepAnyway-cy)) scale(0.9);
    }
    38%,
    62% {
        transform: translate(var(--keepAnyway-cx), var(--keepAnyway-cy));
        animation-timing-function: cubic-bezier(0.45, 0, 0.2, 1);
    }
    80%,
    100% {
        transform: translate(470px, 290px);
    }
}
</style>

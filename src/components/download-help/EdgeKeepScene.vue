<script setup lang="ts">
import { defineMessages, useVIntl } from '@modrinth/ui'

import AxolotlSitePage from './AxolotlSitePage.vue'
import EdgeFlyout from './EdgeFlyout.vue'
import EdgeWindow from './EdgeWindow.vue'
import FluentIcon from './FluentIcon.vue'
import HelpCursor from './HelpCursor.vue'
import {
    centreOf,
    click,
    pointerKeyframes,
    type StagePoint,
    useStageTargets,
} from './use-stage-targets'

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

/** The flyout hangs from the Downloads button, 56 px in from the window's right edge. */
const FLYOUT = { x: 224, y: 84 }
/** Where "Keep" sits in the item menu, which opens at a fixed place under "···". */
const KEEP: StagePoint = { x: 488, y: 225 }
const START: StagePoint = { x: 330, y: 330 }
const REST: StagePoint = { x: 470, y: 300 }

const root = ref<HTMLElement | null>(null)
const targets = useStageTargets(root)
const id = useId()
const animation = computed(() => `dh-edge-pointer-${id.replace(/[^\w-]/g, '')}`)

/** How far the view scrolls up so the dialog's buttons and their menu stay in view. */
const pan = computed(() => {
    const chevron = targets.value.chevron
    if (!chevron) return 0
    return Math.min(0, 488 - (chevron.y + chevron.h + 6 + 36))
})

/** The flyout grows to hold the dialog, ending 64 px below it as Edge draws it. */
const flyoutHeight = computed(() => {
    const chevron = targets.value.chevron
    if (!chevron) return 0
    return chevron.y + chevron.h + 22 + 64 - FLYOUT.y
})

const pointer = computed(() => {
    const more = centreOf(targets.value.more)
    const keep = centreOf(targets.value.keep)
    const chevron = centreOf(targets.value.chevron)
    const keepAnyway = centreOf(targets.value.keepAnyway)
    if (props.step === 0) {
        return {
            end: keep,
            css: pointerKeyframes(animation.value, [
                { at: [0, 0.08], to: START, ease: true },
                ...click(0.28, more),
                ...click(0.55, keep),
                { at: 1, to: keep },
            ]),
        }
    }
    if (props.step === 1) {
        return {
            end: chevron,
            css: pointerKeyframes(animation.value, [
                { at: [0, 0.16], to: KEEP, ease: true },
                ...click(0.4, chevron),
                { at: 1, to: chevron },
            ]),
        }
    }
    return {
        end: REST,
        css: pointerKeyframes(animation.value, [
            { at: [0, 0.08], to: chevron, ease: true },
            ...click(0.3, keepAnyway),
            { at: 0.62, to: keepAnyway, ease: true },
            { at: [0.8, 1], to: REST },
        ]),
    }
})

const motionCss = computed(() => {
    let css = pointer.value.css
    if (props.step === 1) {
        css += ` @keyframes ${animation.value}-pan { 0%, 4% { transform: translateY(0); animation-timing-function: cubic-bezier(0.4, 0, 0.2, 1); } 16%, 100% { transform: translateY(${pan.value}px); } }`
    }
    if (props.step === 2) {
        css += ` @keyframes ${animation.value}-pan { 0%, 50% { transform: translateY(${pan.value}px); animation-timing-function: cubic-bezier(0.4, 0, 0.2, 1); } 62%, 100% { transform: translateY(0); } }`
        css += ` @keyframes ${animation.value}-flyout { 0%, 47% { height: ${flyoutHeight.value}px; } 52%, 100% { height: auto; } }`
    }
    return css
})

const rootStyle = computed(() => {
    if (props.step === 0 || !targets.value.chevron) return {}
    return {
        transform: props.step === 1 ? `translateY(${pan.value}px)` : undefined,
        animation: `${animation.value}-pan var(--d) both`,
    }
})

const flyoutStyle = computed(() => {
    if (props.step === 1 && flyoutHeight.value) return { height: `${flyoutHeight.value}px` }
    if (props.step === 2 && flyoutHeight.value) {
        return { animation: `${animation.value}-flyout var(--d) both` }
    }
    return {}
})

const cursorStyle = computed(() => {
    const end = pointer.value.end
    if (!end || !pointer.value.css) return { display: 'none' }
    return {
        transform: `translate(${end.x}px, ${end.y}px)`,
        animationName: animation.value,
    }
})

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
    const point = centreOf(targets.value[name])
    if (!point) return { display: 'none' }
    return { left: `${point.x}px`, top: `${point.y}px` }
}
</script>

<template>
    <div ref="root" class="absolute inset-x-0 top-0 h-[720px]" :style="rootStyle">
        <component :is="'style'">{{ motionCss }}</component>
        <EdgeWindow
            :tab-title="formatMessage(messages.tabTitle)"
            :downloads="step === 2 ? 'open' : 'warning'"
        >
            <template #address>
                <span class="text-[#9b9b9b]">https://</span
                ><span class="text-[#f2f2f2]">axlmc.org</span>
            </template>
            <template #page>
                <AxolotlSitePage :download-label="formatMessage(messages.siteDownload)" />
            </template>
        </EdgeWindow>

        <EdgeFlyout
            :title="formatMessage(messages.downloads)"
            class="left-[224px] top-[84px] pb-[23px] pt-[54px]"
            :style="flyoutStyle"
        >
            <div
                class="item"
                :class="{
                    'bg-[#2e2e2e]': step === 0,
                    'dh-vanish !absolute inset-x-0 top-[54px]': step === 2,
                }"
                style="--at: 0.5"
            >
                <FluentIcon
                    name="warning"
                    :size="18"
                    class="absolute left-[14px] top-[9px] text-[#fc8b3a]"
                />
                <p class="m-0 w-[272px] text-[14px] leading-[21px] [overflow-wrap:anywhere]">
                    {{ formatMessage(messages.warning, { file: fileName }) }}
                </p>
                <span
                    v-if="step === 0"
                    class="absolute right-1.5 top-1 flex items-center gap-2 rounded-md bg-[#2e2e2e] pl-2"
                >
                    <span class="item-button">
                        <FluentIcon name="delete" :size="16" />
                    </span>
                    <span class="item-button bg-[#474747] text-[#4a97ee]" data-target="more">
                        <FluentIcon name="more" :size="16" />
                    </span>
                </span>
            </div>
            <div v-if="step === 2" class="item dh-appear" style="--at: 0.52">
                <img
                    src="/axolotl.png"
                    alt=""
                    class="absolute left-[18px] top-[9px] size-[26px] object-contain"
                />
                <p class="m-0 w-[280px] text-[14px] leading-[21px] [overflow-wrap:anywhere]">
                    {{ fileName }}
                </p>
                <p class="m-0 mt-[7px] text-[14px] font-semibold leading-[21px] text-[#4a97ee]">
                    {{ formatMessage(messages.openFile) }}
                </p>
            </div>
            <div
                v-if="step > 0"
                class="absolute inset-0 bg-black/40"
                :class="step === 1 ? 'dh-appear' : 'dh-vanish'"
                :style="{ '--at': step === 1 ? 0 : 0.46 }"
            />
        </EdgeFlyout>

        <div
            v-if="step === 0"
            class="menu dh-appear left-[407px] top-[173px] w-[163px]"
            style="--at: 0.33"
        >
            <span class="menu-row">
                <FluentIcon name="delete" :size="16" class="menu-icon" />
                {{ formatMessage(messages.delete) }}
            </span>
            <span class="menu-row bg-[#3d3d3d]" data-target="keep">
                {{ formatMessage(messages.keep) }}
            </span>
            <span class="menu-separator" />
            <span class="menu-row">{{ formatMessage(messages.reportFile) }}</span>
            <span class="menu-row">{{ formatMessage(messages.learnMore) }}</span>
            <span class="menu-separator" />
            <span class="menu-row">
                <FluentIcon name="link" :size="16" class="menu-icon" />
                {{ formatMessage(messages.copyLink) }}
            </span>
        </div>

        <div
            v-if="step > 0"
            class="dialog left-[224px] top-[148px]"
            :class="step === 1 ? 'dh-appear' : 'dh-vanish'"
            :style="{ '--at': step === 1 ? 0 : 0.46 }"
        >
            <FluentIcon
                name="warning"
                :size="18"
                class="absolute left-[17px] top-6 text-[#fc8b3a]"
            />
            <p
                class="m-0 text-[20px] font-semibold leading-[26px] text-white [overflow-wrap:anywhere]"
            >
                {{ formatMessage(messages.dialogTitle, { file: fileName }) }}
            </p>
            <p class="m-0 mt-[9px] text-[14px] leading-5 text-[#c5c5c5]">
                {{ formatMessage(messages.dialogBody) }}
            </p>
            <p class="m-0 mt-3 text-[14px] leading-[21px] text-[#c5c5c5] [overflow-wrap:anywhere]">
                {{ formatMessage(messages.name, { file: fileName }) }}<br />
                {{ formatMessage(messages.publisher) }}
            </p>
            <p class="m-0 mt-3 text-[14px] leading-5 text-[#4a97ee]">
                {{ formatMessage(messages.reportApp) }}
            </p>
            <p class="m-0 mt-3 text-[14px] leading-5 text-[#4a97ee]">
                {{ formatMessage(messages.learnMore) }}
            </p>
            <div class="relative mt-[15px] flex justify-end gap-2">
                <span class="dialog-button w-[95px] bg-[#474747] text-[#f2f2f2]">
                    {{ formatMessage(messages.cancel) }}
                </span>
                <span class="flex h-8 overflow-hidden rounded-md bg-[#f0f0f0] text-[#1a1a1a]">
                    <span class="dialog-button w-24">{{ formatMessage(messages.delete) }}</span>
                    <span
                        class="flex w-8 items-center justify-center border-0 border-l border-solid border-[#bdbdbd]"
                        :class="{ 'bg-[#d9d9d9]': step === 2 }"
                        data-target="chevron"
                    >
                        <FluentIcon name="chevronDown" :size="12" />
                    </span>
                </span>
                <div
                    v-if="step === 2"
                    class="menu dh-appear right-0 top-[38px] w-[170px] !py-1"
                    style="--at: 0"
                >
                    <span class="menu-row h-9 pl-3 text-[14px]" data-target="keepAnyway">
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

        <HelpCursor :style="cursorStyle" />
    </div>
</template>

<style scoped lang="scss">
.item {
    @apply relative mx-2 rounded-md pb-[9px] pl-12 pt-[9px];
}

.item-button {
    @apply flex size-7 items-center justify-center rounded-md text-[#dcdcdc];
}

.menu {
    position: absolute;
    z-index: 20;
    display: flex;
    flex-direction: column;
    padding: 4px 0;
    border-radius: 8px;
    background: #2c2c2c;
    color: #f0f0f0;
    box-shadow:
        0 0 0 1px rgb(255 255 255 / 0.08),
        0 8px 24px rgb(0 0 0 / 0.5);
}

.menu-row {
    @apply relative mx-1 flex h-8 shrink-0 items-center whitespace-nowrap rounded pl-[38px] text-[12px];
}

.menu-icon {
    position: absolute;
    left: 10px;
    color: #dcdcdc;
}

.menu-separator {
    @apply my-1 h-px shrink-0 bg-[#3b3b3b];
}

.dialog {
    position: absolute;
    z-index: 30;
    width: 360px;
    padding: 19px 22px 22px 44px;
    border-radius: 12px;
    background: #2c2c2c;
    box-shadow:
        0 0 0 1px rgb(255 255 255 / 0.08),
        0 12px 32px rgb(0 0 0 / 0.55);
}

.dialog-button {
    @apply flex h-8 items-center justify-center rounded-md text-[14px] font-semibold;
}
</style>

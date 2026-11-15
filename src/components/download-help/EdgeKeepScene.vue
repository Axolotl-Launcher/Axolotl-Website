<script setup lang="ts">
import { defineMessages, useVIntl } from '@modrinth/ui'

import AxolotlSitePage from './AxolotlSitePage.vue'
import EdgeFlyout from './EdgeFlyout.vue'
import EdgeWindow from './EdgeWindow.vue'
import FluentIcon from './FluentIcon.vue'
import HelpCursor from './HelpCursor.vue'
import {
    cameraAt,
    centre,
    closing,
    hitTest,
    inside,
    mouseDown,
    type Move,
    opening,
    type Point,
    pointerPath,
    seg,
} from './scene-engine'
import { guideStyle, useStageTargets } from './use-stage-targets'
import WindowsScreen from './WindowsScreen.vue'

const props = defineProps<{ step: number; time: number; fileName: string }>()

const { formatMessage } = useVIntl()

// The wording comes from Edge's own zh-CN and en-US locale packs.
const messages = defineMessages({
    tabTitle: {
        id: 'axolotl-download-help.edge.tab-title',
        defaultMessage: 'Axolotl Launcher - Free, Open-Source Minecraft Java Launcher',
    },
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

/** Edge's window on the 1920×1080 screen, and the downloads flyout hanging from it. */
const EDGE = { x: 580, y: 130, w: 600, h: 700 }
const FLYOUT = { x: EDGE.x + EDGE.w - 416, y: EDGE.y + 84 }
/** The item menu opens under "···", right-aligned to it. */
const MENU = { x: FLYOUT.x + 346 - 163, y: FLYOUT.y + 90 }
/** Where the pointer rests after clicking the site's own download button. */
const PAGE_BUTTON: Point = { x: EDGE.x + 4 + 206, y: EDGE.y + 80 + 321 }
const HOME_SHOT = { x: EDGE.x - 20, y: EDGE.y - 20, scale: 1 }
const ITEM_PARTS = ['item', 'more', 'trash']

const screen = ref<HTMLElement | null>(null)
const rects = useStageTargets(screen)
const t = computed(() => props.time)

/** The camera follows the dialog down so its buttons and their menu stay in view. */
const lowShot = computed(() => {
    const menu = rects.value.keepAnyway
    const bottom = menu ? menu.y + menu.h + 16 : 0
    return { ...HOME_SHOT, y: Math.max(HOME_SHOT.y, bottom - 496) }
})

/** Each step's script: pointer moves, clicks (when the button comes up) and camera shots. */
const script = computed(() => {
    const r = rects.value
    const more = inside(r.more, 0.5, 0.55)
    const keep = inside(r.keep, 0.32, 0.55)
    const chevron = centre(r.chevron)
    const anyway = inside(r.keepAnyway, 0.34, 0.5)
    if (!more || !keep || !chevron || !anyway) return null
    const steps = [
        {
            start: PAGE_BUTTON,
            moves: [
                { t0: 350, t1: 1000, to: more, bow: 0.07 },
                { t0: 1550, t1: 2100, to: keep, bow: 0.05 },
            ] as Move[],
            clicks: [1250, 2400],
            shots: [
                { at: 0, ...HOME_SHOT },
                { at: 2900, ...lowShot.value },
            ],
        },
        {
            start: keep,
            moves: [{ t0: 500, t1: 1150, to: chevron, bow: 0.06 }] as Move[],
            clicks: [1450],
            shots: [{ at: 0, ...lowShot.value }],
        },
        {
            start: chevron,
            moves: [
                { t0: 350, t1: 900, to: anyway, bow: 0.05 },
                { t0: 2300, t1: 2900, to: { x: 980, y: 520 }, bow: 0.08 },
            ] as Move[],
            clicks: [1200],
            shots: [
                { at: 0, ...lowShot.value },
                { at: 1500, ...HOME_SHOT },
            ],
        },
    ]
    return steps[props.step]
})

const path = computed(() => {
    const s = script.value
    return s && pointerPath(s.start, s.moves, props.step + 3)
})
const pointer = computed(() => path.value?.(t.value) ?? null)
const camera = computed(() => (script.value ? cameraAt(t.value, script.value.shots) : HOME_SHOT))

/** What is on screen at this moment of the step, as 0…1 openness. */
const view = computed(() => {
    const time = t.value
    if (props.step === 0) {
        return {
            menu: time < 1250 ? 0 : opening(time, 1250, 150) * closing(time, 2400, 120),
            dialog: opening(time, 2470, 180),
            dropdown: 0,
            kept: false,
        }
    }
    if (props.step === 1) {
        return { menu: 0, dialog: 1, dropdown: opening(time, 1450, 150), kept: false }
    }
    const away = closing(time, 1200, 130)
    return { menu: 0, dialog: away, dropdown: away, kept: time >= 1240 }
})

const hover = computed(() => {
    const point = pointer.value
    if (!point) return undefined
    const v = view.value
    const order: string[] = []
    if (v.dropdown > 0.5) order.push('keepAnyway')
    if (v.dialog > 0.5) {
        order.push('chevron', 'delete', 'cancel', 'reportApp', 'learnMore', 'dialog')
    } else {
        if (v.menu > 0.5) {
            order.push('menu-delete', 'keep', 'menu-report', 'menu-learn', 'menu-copy', 'menu')
        }
        order.push('more', 'trash', 'item', 'edge-downloads', 'edge-minimize', 'edge-address')
    }
    return hitTest(point, order, rects.value)
})

const pressed = computed(() =>
    script.value && mouseDown(t.value, script.value.clicks) ? hover.value : undefined,
)

const itemHovered = computed(() => ITEM_PARTS.includes(hover.value ?? '') || view.value.menu > 0)

const cursorKind = computed(() =>
    hover.value === 'reportApp' || hover.value === 'learnMore' ? 'hand' : 'arrow',
)

/** The guide ring, on the next thing to click until it is clicked. */
const guide = computed(() => {
    const time = t.value
    const r = rects.value
    const fade = (from: number, to: number) =>
        seg(time, from, from + 200) * (1 - seg(time, to, to + 120))
    if (props.step === 0) {
        // "···" only shows while the pointer is over the item, so the ring waits on the item.
        if (time >= 1300) return guideStyle(r.keep, fade(1400, 2400), 2)
        return itemHovered.value
            ? guideStyle(r.more, fade(0, 1250))
            : guideStyle(r.item, fade(0, 1250), 2)
    }
    if (props.step === 1) return guideStyle(r.chevron, fade(0, 1450))
    return guideStyle(r.keepAnyway, fade(0, 1200), 2)
})

const shown = (opacity: number) => ({
    opacity,
    visibility: opacity > 0 ? ('visible' as const) : ('hidden' as const),
})
const slide = (opacity: number, distance = -6) => ({
    ...shown(opacity),
    transform: `translateY(${(1 - opacity) * distance}px)`,
})
</script>

<template>
    <WindowsScreen :camera="camera">
        <div ref="screen" class="absolute inset-0">
            <EdgeWindow
                :tab-title="formatMessage(messages.tabTitle)"
                :downloads="view.kept ? 'open' : 'warning'"
                :hover="hover"
                :style="{
                    left: `${EDGE.x}px`,
                    top: `${EDGE.y}px`,
                    width: `${EDGE.w}px`,
                    height: `${EDGE.h}px`,
                }"
            >
                <template #address>
                    <span class="text-[#9b9b9b]">https://</span
                    ><span class="text-[#f2f2f2]">axlmc.org</span>
                </template>
                <template #page>
                    <AxolotlSitePage />
                </template>
            </EdgeWindow>

            <EdgeFlyout
                :title="formatMessage(messages.downloads)"
                class="pb-[23px] pt-[54px]"
                :style="{ left: `${FLYOUT.x}px`, top: `${FLYOUT.y}px` }"
            >
                <div
                    v-if="!view.kept"
                    class="item"
                    :class="{ 'bg-[#2e2e2e]': itemHovered }"
                    data-target="item"
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
                        class="absolute right-1.5 top-1 flex items-center gap-2 rounded-md bg-[#2e2e2e] pl-2"
                        :style="shown(itemHovered ? 1 : 0)"
                    >
                        <span
                            class="item-button"
                            :class="{ 'bg-[#3d3d3d]': hover === 'trash' }"
                            data-target="trash"
                        >
                            <FluentIcon name="delete" :size="16" />
                        </span>
                        <span
                            class="item-button"
                            :class="{
                                'bg-[#3d3d3d]': hover === 'more',
                                '!bg-[#474747] text-[#4a97ee]': view.menu > 0 || pressed === 'more',
                            }"
                            data-target="more"
                        >
                            <FluentIcon name="more" :size="16" />
                        </span>
                    </span>
                </div>
                <div v-else class="item">
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
                <div class="absolute inset-0 bg-black/40" :style="shown(view.dialog)" />
            </EdgeFlyout>

            <div
                class="menu w-[163px]"
                :style="{ left: `${MENU.x}px`, top: `${MENU.y}px`, ...slide(view.menu) }"
                data-target="menu"
            >
                <span
                    class="menu-row"
                    :class="{ 'bg-[#3d3d3d]': hover === 'menu-delete' }"
                    data-target="menu-delete"
                >
                    <FluentIcon name="delete" :size="16" class="menu-icon" />
                    {{ formatMessage(messages.delete) }}
                </span>
                <span
                    class="menu-row"
                    :class="{
                        'bg-[#3d3d3d]': hover === 'keep',
                        '!bg-[#454545]': pressed === 'keep',
                    }"
                    data-target="keep"
                >
                    {{ formatMessage(messages.keep) }}
                </span>
                <span class="menu-separator" />
                <span
                    class="menu-row"
                    :class="{ 'bg-[#3d3d3d]': hover === 'menu-report' }"
                    data-target="menu-report"
                >
                    {{ formatMessage(messages.reportFile) }}
                </span>
                <span
                    class="menu-row"
                    :class="{ 'bg-[#3d3d3d]': hover === 'menu-learn' }"
                    data-target="menu-learn"
                >
                    {{ formatMessage(messages.learnMore) }}
                </span>
                <span class="menu-separator" />
                <span
                    class="menu-row"
                    :class="{ 'bg-[#3d3d3d]': hover === 'menu-copy' }"
                    data-target="menu-copy"
                >
                    <FluentIcon name="link" :size="16" class="menu-icon" />
                    {{ formatMessage(messages.copyLink) }}
                </span>
            </div>

            <div
                class="dialog"
                :style="{
                    left: `${FLYOUT.x}px`,
                    top: `${FLYOUT.y + 64}px`,
                    ...shown(view.dialog),
                    transform: `scale(${0.98 + view.dialog * 0.02})`,
                }"
                data-target="dialog"
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
                <p
                    class="m-0 mt-3 text-[14px] leading-[21px] text-[#c5c5c5] [overflow-wrap:anywhere]"
                >
                    {{ formatMessage(messages.name, { file: fileName }) }}<br />
                    {{ formatMessage(messages.publisher) }}
                </p>
                <p class="m-0 mt-3 text-[14px] leading-5 text-[#4a97ee]">
                    <span :class="{ underline: hover === 'reportApp' }" data-target="reportApp">
                        {{ formatMessage(messages.reportApp) }}
                    </span>
                </p>
                <p class="m-0 mt-3 text-[14px] leading-5 text-[#4a97ee]">
                    <span :class="{ underline: hover === 'learnMore' }" data-target="learnMore">
                        {{ formatMessage(messages.learnMore) }}
                    </span>
                </p>
                <div class="relative mt-[15px] flex justify-end gap-2">
                    <span
                        class="dialog-button w-[95px] bg-[#474747] text-[#f2f2f2]"
                        :class="{ '!bg-[#525252]': hover === 'cancel' }"
                        data-target="cancel"
                    >
                        {{ formatMessage(messages.cancel) }}
                    </span>
                    <span class="flex h-8 overflow-hidden rounded-md bg-[#f0f0f0] text-[#1a1a1a]">
                        <span
                            class="dialog-button w-24 rounded-none"
                            :class="{ 'bg-[#e2e2e2]': hover === 'delete' }"
                            data-target="delete"
                        >
                            {{ formatMessage(messages.delete) }}
                        </span>
                        <span
                            class="flex w-8 items-center justify-center border-0 border-l border-solid border-[#bdbdbd]"
                            :class="{
                                'bg-[#e2e2e2]': hover === 'chevron',
                                '!bg-[#d0d0d0]': pressed === 'chevron' || view.dropdown > 0,
                            }"
                            data-target="chevron"
                        >
                            <FluentIcon name="chevronDown" :size="12" />
                        </span>
                    </span>
                    <div
                        class="menu right-0 top-[38px] w-[170px] !py-1"
                        :style="slide(view.dropdown)"
                    >
                        <span
                            class="menu-row h-9 pl-3 text-[14px]"
                            :class="{
                                'bg-[#3d3d3d]': hover === 'keepAnyway',
                                '!bg-[#454545]': pressed === 'keepAnyway',
                            }"
                            data-target="keepAnyway"
                        >
                            {{ formatMessage(messages.keepAnyway) }}
                        </span>
                    </div>
                </div>
            </div>

            <span class="dh-guide" :style="guide" />
            <HelpCursor
                v-if="pointer"
                :x="pointer.x"
                :y="pointer.y"
                :kind="cursorKind"
                :time="time"
            />
        </div>
    </WindowsScreen>
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
    transform-origin: 50% 30%;
    box-shadow:
        0 0 0 1px rgb(255 255 255 / 0.08),
        0 12px 32px rgb(0 0 0 / 0.55);
}

.dialog-button {
    @apply flex h-8 items-center justify-center rounded-md text-[14px] font-semibold;
}
</style>

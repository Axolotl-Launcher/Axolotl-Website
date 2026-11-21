<script setup lang="ts">
import AxolotlSitePage from './AxolotlSitePage.vue'
import EdgeFlyout from './EdgeFlyout.vue'
import EdgeWindow from './EdgeWindow.vue'
import HelpCursor from './HelpCursor.vue'
import {
  cameraAt,
  caretVisible,
  centre,
  closing,
  hitTest,
  inside,
  keystrokes,
  lerp,
  mouseDown,
  opening,
  type Point,
  pointerPath,
  type SceneScript,
  seg,
  typedLength,
} from './scene-engine'
import SetupIcon from './SetupIcon.vue'
import { guideStyle, useStageTargets } from './use-stage-targets'
import WindowsScreen from './WindowsScreen.vue'
import WinWindow from './WinWindow.vue'

const props = defineProps<{ step: number; time: number; fileName: string; reducedMotion: boolean }>()

const { t: translate } = useI18n()

const VC_NAME = 'Microsoft Visual C++ v14 Redistributable (x64) - 14.51.36247'
const VC_PACKAGES = [
  'Microsoft Visual C++ 2022 X64 Minimum Runtime - 14.51.36247',
  'Microsoft Visual C++ 2022 X64 Additional Runtime - 14.51.36247',
] as const
/** aka.ms/vc14 redirects to …/vs/18/release/VC_redist.x64.exe, 18 731 856 bytes. */
const VC_FILE = 'VC_redist.x64.exe'
const VC_MB = 17.9
const VC_ADDRESS = 'aka.ms/vc14/vc_redist.x64.exe'

/** Where things sit on the 1920×1080 screen; Windows centres dialogs and installers on it. */
const EDGE = { x: 580, y: 130, w: 600, h: 700 }
const FLYOUT = { x: EDGE.x + EDGE.w - 416, y: EDGE.y + 84 }
const ERROR = { x: 750, y: 462, w: 420 }
const VC = { x: 717, y: 374, w: 487 }
const SETUP = { x: 490, y: 230 }
/** The camera: on Edge and the error, on the VC++ installer, then wide on the Axolotl installer. */
const EDGE_SHOT = { x: 560, y: 140, scale: 1 }
const VC_SHOT = { x: 640, y: 300, scale: 1 }
const SETUP_SHOT = { x: 410, y: 114, scale: 640 / 1100 }

const screen = ref<HTMLElement | null>(null)
const rects = useStageTargets(screen)
const t = computed(() => props.time)

/** Typing the address: when each key lands, then Enter, then the download. */
const TYPING_START = 2900
const typing = keystrokes(VC_ADDRESS, TYPING_START, 11)
const lastKeystroke = typing.at(-1)!
const ENTER = lastKeystroke + 380
const DOWNLOAD = { start: ENTER + 220, end: ENTER + 1500 }

/** Each step's script: pointer moves, clicks (when the button comes up) and camera shots. */
const script = computed(() => {
  const r = rects.value
  const ok = inside(r.ok, 0.45, 0.55)
  const address = inside(r['edge-address'], 0.4, 0.55)
  const openVc = inside(r.openVc, 0.4, 0.6)
  const agree = centre(r.agree)
  const install = inside(r.install, 0.55, 0.55)
  const yes = inside(r.yes, 0.48, 0.55)
  const closeVc = inside(r.closeVc, 0.5, 0.55)
  const downloadsButton = inside(r['edge-downloads'], 0.5, 0.55)
  const openSetup = inside(r.openSetup, 0.4, 0.6)
  const points = [ok, address, openVc, agree, install, yes, closeVc, downloadsButton, openSetup]
  if (points.some((point) => !point)) return null
  const rest: Point = { x: 1090, y: 650 }
  const steps: SceneScript[] = [
    {
      start: { x: 905, y: 655 },
      moves: [
        { t0: 400, t1: 1000, to: ok!, bow: 0.06 },
        { t0: 1600, t1: 2250, to: address!, bow: 0.08 },
      ],
      clicks: [1250, 2450],
      shots: [{ at: 0, ...EDGE_SHOT }],
    },
    {
      start: address!,
      moves: [
        { t0: 300, t1: 900, to: openVc!, bow: 0.06 },
        { t0: 2500, t1: 3100, to: agree!, bow: 0.07 },
        { t0: 3700, t1: 4250, to: install!, bow: 0.05 },
        { t0: 5100, t1: 5700, to: yes!, bow: 0.06 },
        { t0: 6400, t1: 7000, to: rest, bow: 0.06 },
      ],
      clicks: [1100, 3350, 4500, 5950],
      shots: [
        { at: 0, ...EDGE_SHOT },
        { at: 1700, ...VC_SHOT },
      ],
    },
    {
      start: rest,
      moves: [
        { t0: 300, t1: 850, to: closeVc!, bow: 0.05 },
        { t0: 1500, t1: 2150, to: downloadsButton!, bow: 0.08 },
        { t0: 2800, t1: 3350, to: openSetup!, bow: 0.06 },
      ],
      clicks: [1050, 2400, 3550],
      shots: [
        { at: 0, ...VC_SHOT },
        { at: 1300, ...EDGE_SHOT },
        { at: 4300, ...SETUP_SHOT, duration: 900 },
      ],
    },
  ]
  return steps[props.step]
})

const path = computed(() => {
  const s = script.value
  return s && pointerPath(s.start, s.moves, props.step + 11)
})
const pointer = computed(() => path.value?.(t.value) ?? null)
const camera = computed(() => (script.value ? cameraAt(t.value, script.value.shots) : EDGE_SHOT))

/** What is on screen at this moment of the step. */
const view = computed(() => {
  const time = t.value
  const base = {
    error: 0,
    omnibox: null as null | {
      text: string
      selected?: boolean
      caret?: boolean
      suggestion?: boolean
    },
    flyout: 0,
    download: 1,
    vc: 0,
    page: 'license' as 'license' | 'progress' | 'success',
    agreed: false,
    uac: 0,
    dim: 0,
    installed: 0,
    package: '',
    setup: 0,
    busy: false,
    pointerHidden: false,
  }
  if (props.step === 0) {
    const keys = typedLength(time, typing)
    const focused = time >= 2450 && time < ENTER
    return {
      ...base,
      error: closing(time, 1250, 150),
      omnibox: focused
        ? keys
          ? {
              text: VC_ADDRESS.slice(0, keys),
              caret: time < lastKeystroke + 120 || caretVisible(time, ENTER),
              suggestion: true,
            }
          : { text: 'https://axlmc.org', selected: true }
        : null,
      flyout: time >= ENTER ? opening(time, ENTER + 120, 200) : 0,
      download: seg(time, DOWNLOAD.start, DOWNLOAD.end),
      pointerHidden: time >= TYPING_START,
    }
  }
  if (props.step === 1) {
    const page = time < 6150 ? 'license' : 'progress'
    return {
      ...base,
      flyout: closing(time, 1700, 120),
      vc: opening(time, 1700),
      page: page as 'license' | 'progress',
      agreed: time >= 3350,
      uac: time < 5950 ? opening(time, 4750, 200) : closing(time, 5950, 150),
      dim: time < 5950 ? opening(time, 4550, 300) : closing(time, 5950, 200),
      installed:
        time < 6500 ? 0 : time < 8300 ? lerp(0, 0.55, seg(time, 6500, 8300)) : lerp(0.55, 1, seg(time, 8300, 10000)),
      package: time < 6500 ? '' : time < 8300 ? VC_PACKAGES[0] : VC_PACKAGES[1],
      busy: time >= 1100 && time < 1700,
      pointerHidden: time < 300,
    }
  }
  return {
    ...base,
    vc: closing(time, 1050, 140),
    page: 'success' as const,
    agreed: true,
    installed: 1,
    flyout: time < 3600 ? opening(time, 2400, 200) : closing(time, 3600, 120),
    setup: opening(time, 4700, 300),
    busy: time >= 3550 && time < 4700,
  }
})

const hover = computed(() => {
  const point = pointer.value
  if (!point) return undefined
  const v = view.value
  const order: string[] = []
  if (v.uac > 0.5) order.push('yes', 'no', 'uac')
  else {
    if (v.setup > 0.5) order.push('setup')
    if (v.vc > 0.5) order.push('agree', 'install', 'closeVc', 'vc')
    if (v.error > 0.5) order.push('ok', 'error')
    if (v.flyout > 0.5) order.push('openVc', 'openSetup', 'vcItem', 'setupItem', 'flyout')
    order.push('edge-downloads', 'edge-minimize', 'edge-refresh', 'edge-address')
  }
  return hitTest(point, order, rects.value)
})

const pressed = computed(() => (script.value && mouseDown(t.value, script.value.clicks) ? hover.value : undefined))

const cursorKind = computed(() => {
  if (view.value.busy) return 'busy'
  if (hover.value === 'openVc' || hover.value === 'openSetup') return 'hand'
  if (hover.value === 'edge-address') return 'text'
  return 'arrow'
})

/** The guide ring, on the next thing to click until it is clicked. */
const guide = computed(() => {
  const time = t.value
  const r = rects.value
  const ring = (name: string, from: number, to: number, pad = 3) =>
    time >= from - 50 && time < to + 150
      ? guideStyle(r[name], seg(time, from, from + 200) * (1 - seg(time, to, to + 120)), pad)
      : null
  const steps: [string, number, number, number?][][] = [
    [
      ['ok', 0, 1250],
      ['edge-address', 1400, 2450, 2],
    ],
    [
      ['openVc', 0, 1100, 2],
      ['agree', 2300, 3350, 4],
      ['install', 3500, 4500],
      ['yes', 4950, 5950],
    ],
    [
      ['closeVc', 0, 1050],
      ['edge-downloads', 1300, 2400, 2],
      ['openSetup', 2600, 3550, 2],
    ],
  ]
  for (const [name, from, to, pad] of steps[props.step] ?? []) {
    const style = ring(name, from, to, pad)
    if (style) return style
  }
  return { display: 'none' }
})

const shown = (opacity: number) => ({
  opacity,
  visibility: opacity > 0 ? ('visible' as const) : ('hidden' as const),
})
/** Windows 11 opens a window from 94% scale and closes it toward 96%. */
const windowStyle = (openness: number, x: number, y: number, opening = true) => ({
  left: `${x}px`,
  top: `${y}px`,
  ...shown(openness),
  transform: `scale(${opening ? 0.94 + 0.06 * openness : 0.96 + 0.04 * openness})`,
})

const downloadStatus = computed(() => {
  const p = view.value.download
  const speed = 14.1
  return translate('downloadHelp.edge.downloading', {
    speed: speed.toFixed(1),
    done: (p * VC_MB).toFixed(1),
    total: VC_MB,
    left: Math.max(1, Math.ceil(((1 - p) * VC_MB) / speed)),
  })
})

const winButton = (name: string) => ({
  'win-button-hover': hover.value === name,
  'win-button-pressed': pressed.value === name,
})
</script>

<template>
  <WindowsScreen :camera="camera">
    <div ref="screen" class="absolute inset-0">
      <EdgeWindow
        :tab-title="translate('downloadHelp.edge.tabTitle')"
        :downloads="view.flyout > 0 ? 'open' : 'shown'"
        :progress="view.download > 0 && view.download < 1 ? view.download : null"
        :hover="hover"
        :omnibox="view.omnibox"
        :style="{
          left: `${EDGE.x}px`,
          top: `${EDGE.y}px`,
          width: `${EDGE.w}px`,
          height: `${EDGE.h}px`,
        }"
      >
        <template #address>
          <span class="text-[#9b9b9b]">https://</span><span class="text-[#f2f2f2]">axlmc.org</span>
        </template>
        <template #page>
          <AxolotlSitePage />
        </template>
      </EdgeWindow>

      <EdgeFlyout
        :title="translate('downloadHelp.edge.downloads')"
        class="pt-[54px] pb-[15px]"
        :style="{
          left: `${FLYOUT.x}px`,
          top: `${FLYOUT.y}px`,
          ...shown(view.flyout),
          transform: `translateY(${(1 - view.flyout) * -6}px)`,
        }"
        data-target="flyout"
      >
        <div
          class="flyout-item"
          :class="{ 'bg-[#2e2e2e]': hover === 'vcItem' || hover === 'openVc' }"
          data-target="vcItem"
        >
          <SetupIcon class="absolute top-[9px] left-[18px] size-[26px]" />
          <p class="m-0 text-[14px] leading-[21px]">{{ VC_FILE }}</p>
          <div class="mt-[7px] grid min-h-[27px]">
            <div v-if="view.download < 1" class="col-start-1 row-start-1 pt-px">
              <div class="h-[3px] w-[280px] overflow-hidden rounded-sm bg-[#474747]">
                <span class="block h-full bg-[#f6a4cc]" :style="{ width: `${view.download * 100}%` }" />
              </div>
              <p class="m-0 mt-[7px] text-[12px] leading-4 whitespace-nowrap text-[#a9a9a9]">
                {{ downloadStatus }}
              </p>
            </div>
            <!-- The cursor path measures this link before the download completes. -->
            <p
              class="col-start-1 row-start-1 m-0 self-start text-[14px] leading-[21px] font-semibold text-[#f6a4cc]"
              :class="{ invisible: view.download < 1 }"
            >
              <span :class="{ underline: hover === 'openVc' }" data-target="openVc">
                {{ translate('downloadHelp.edge.openFile') }}
              </span>
            </p>
          </div>
        </div>
        <div
          class="flyout-item"
          :class="{ 'bg-[#2e2e2e]': hover === 'setupItem' || hover === 'openSetup' }"
          data-target="setupItem"
        >
          <img src="/axolotl.png" alt="" class="absolute top-[9px] left-[18px] size-[26px] object-contain" />
          <p class="m-0 text-[14px] leading-[21px] [overflow-wrap:anywhere]">
            {{ fileName }}
          </p>
          <p class="m-0 mt-[7px] text-[14px] leading-[21px] font-semibold text-[#f6a4cc]">
            <span :class="{ underline: hover === 'openSetup' }" data-target="openSetup">
              {{ translate('downloadHelp.edge.openFile') }}
            </span>
          </p>
        </div>
      </EdgeFlyout>

      <WinWindow
        :title="translate('downloadHelp.vc.errorTitle', { file: fileName })"
        class="w-[420px]"
        :style="windowStyle(view.error, ERROR.x, ERROR.y, false)"
        data-target="error"
      >
        <div class="flex h-[84px] gap-3 pt-6 pr-5 pl-6">
          <svg class="shrink-0" width="32" height="32" viewBox="0 0 32 32">
            <circle cx="16" cy="16" r="15.5" fill="#e9440f" />
            <path d="M11 11l10 10M21 11L11 21" stroke="#fff" stroke-width="2" />
          </svg>
          <p class="m-0 pt-px text-[12px] leading-[17px]">
            {{ translate('downloadHelp.vc.errorBody') }}
          </p>
        </div>
        <div class="flex h-[41px] items-center justify-end bg-[#f7e9f3] pr-[11px]">
          <span class="win-button border-[#9e326b]" :class="winButton('ok')" data-target="ok">
            {{ translate('downloadHelp.vc.ok') }}
          </span>
        </div>
      </WinWindow>

      <WinWindow
        :title="translate('downloadHelp.vc.caption', { name: VC_NAME })"
        minimize
        maximize="off"
        class="w-[487px]"
        :style="windowStyle(view.vc, VC.x, VC.y, step === 1)"
        data-target="vc"
      >
        <template #icon>
          <SetupIcon class="size-4" />
        </template>
        <div class="relative h-[300px] text-[12px] leading-4">
          <svg class="absolute top-[11px] left-[11px]" width="64" height="64" viewBox="0 0 64 64">
            <path
              fill="#68217a"
              fill-rule="evenodd"
              d="M5 18.5 9 16l12 9 2.5 2.5L26 24 44 5.5l14.5 5V54L45 58.5l-20.5-21-1.5-1-1.5 2-10 8-4.5 1L5 46zm40.5 2.5L32.5 32l13 11zM10 24.5 17 32l-7 7.5z"
            />
          </svg>
          <p class="absolute top-[11px] right-[11px] left-20 m-0 h-16 text-[24px] leading-8">
            {{ VC_NAME }}
          </p>

          <div class="absolute inset-0" :style="shown(view.page === 'license' ? 1 : 0)">
            <p class="absolute top-[121px] right-[11px] left-[11px] m-0">
              {{ translate('downloadHelp.vc.licenseLink', { name: VC_NAME }) }}
            </p>
            <div class="absolute top-[230px] right-[11px] left-[11px] flex h-[29px] items-center gap-[5px]">
              <span
                class="checkbox"
                :class="{
                  'border-[#1a1a1a] bg-[#f3f3f3]': hover === 'agree' && !view.agreed,
                }"
                data-target="agree"
              >
                <span
                  v-if="view.agreed"
                  class="absolute inset-[-1px] flex items-center justify-center rounded-[3px] bg-[#005fb8]"
                >
                  <svg width="13" height="13" viewBox="0 0 13 13">
                    <path d="M3 6.8l2.3 2.3L10 4.4" fill="none" stroke="#fff" stroke-width="1.3" />
                  </svg>
                </span>
              </span>
              {{ translate('downloadHelp.vc.agree') }}
            </div>
            <span
              class="win-button absolute top-[266px] left-[319px] gap-[3px]"
              :class="view.agreed ? winButton('install') : 'win-button-disabled'"
              data-target="install"
            >
              <svg width="16" height="16" viewBox="0 0 16 16">
                <path d="M8 1.2l5.6 2v4C13.6 11 11.2 13.6 8 14.8 4.8 13.6 2.4 11 2.4 7.2v-4z" fill="#1d6fdc" />
                <path d="M8 1.2l5.6 2v4.3H8zM2.4 7.5H8v7.3c-3.2-1.2-5.6-3.8-5.6-7.3z" fill="#f7c339" />
              </svg>
              {{ translate('downloadHelp.vc.install') }}
            </span>
            <span class="win-button absolute top-[266px] left-[399px]">
              {{ translate('downloadHelp.vc.close') }}
            </span>
          </div>

          <div class="absolute inset-0" :style="shown(view.page === 'progress' ? 1 : 0)">
            <p class="absolute top-20 left-[11px] m-0 text-[22px] leading-[30px] text-[#666]">
              {{ translate('downloadHelp.vc.progress') }}
            </p>
            <p class="absolute top-[121px] left-[11px] m-0 w-[70px]">
              {{ translate('downloadHelp.vc.processing') }}
            </p>
            <p class="absolute top-[121px] right-[11px] left-[85px] m-0 truncate">
              {{ view.package || translate('downloadHelp.vc.initializing') }}
            </p>
            <div
              class="absolute top-[143px] right-[11px] left-[11px] h-[15px] border border-solid border-[#bcbcbc] bg-[#e6e6e6]"
            >
              <span class="block h-full bg-[#06b025]" :style="{ width: `${view.installed * 100}%` }" />
            </div>
            <span class="win-button absolute top-[266px] left-[399px]">
              {{ translate('downloadHelp.vc.cancel') }}
            </span>
          </div>

          <div class="absolute inset-0" :style="shown(view.page === 'success' ? 1 : 0)">
            <p class="absolute top-20 left-[11px] m-0 text-[22px] leading-[30px] text-[#666]">
              {{ translate('downloadHelp.vc.success') }}
            </p>
            <span
              class="win-button absolute top-[266px] left-[399px]"
              :class="winButton('closeVc')"
              data-target="closeVc"
            >
              {{ translate('downloadHelp.vc.close') }}
            </span>
          </div>
        </div>
      </WinWindow>

      <div class="absolute inset-0 z-40 bg-black/55" :style="shown(view.dim)" />
      <div class="uac" :style="{ ...shown(view.uac), transform: `scale(${0.97 + view.uac * 0.03})` }" data-target="uac">
        <div class="relative bg-[#f6e1ec] px-[22px] pt-[13px] pb-[18px]">
          <p class="m-0 text-[12px] leading-[17px]">
            {{ translate('downloadHelp.vc.uacTitle') }}
          </p>
          <p class="m-0 mt-3.5 text-[20px] leading-[26px]">
            {{ translate('downloadHelp.vc.uacQuestion') }}
          </p>
          <svg class="absolute top-3 right-3.5" width="10" height="10" viewBox="0 0 10 10">
            <path d="M.5.5l9 9M9.5.5l-9 9" stroke="#1a1a1a" />
          </svg>
        </div>
        <div class="px-[22px] pt-[11px] pb-[22px]">
          <div class="flex items-center gap-3">
            <svg class="shrink-0" width="38" height="38" viewBox="0 0 38 38">
              <path d="M19 2.5l14 5v10c0 9.5-6 15.8-14 18.5C11 33.3 5 27 5 17.5v-10z" fill="#1d6fdc" />
              <path d="M19 2.5l14 5v10.5H19zM5 18h14v18c-8-2.7-14-9-14-18z" fill="#f7c339" />
            </svg>
            <p class="m-0 text-[18px] leading-6">{{ VC_NAME }}</p>
          </div>
          <p class="m-0 mt-[18px] text-[13px] leading-[18px]">
            {{ translate('downloadHelp.vc.uacPublisher') }}
          </p>
          <p class="m-0 mt-[30px] text-[13px] leading-[18px] text-[#0059b5]">
            {{ translate('downloadHelp.vc.uacDetails') }}
          </p>
        </div>
        <div class="flex gap-2.5 bg-[#f3f3f3] px-[26px] pt-[25px] pb-[25px]">
          <span
            class="uac-button border border-solid border-[#dfb8ca] bg-[#fbfbfb]"
            :class="{
              '!bg-[#f7e9f3]': hover === 'yes',
              '!bg-[#e6e6e6] text-[#5d5d5d]': pressed === 'yes',
            }"
            data-target="yes"
          >
            {{ translate('downloadHelp.vc.uacYes') }}
          </span>
          <span
            class="uac-button bg-[#9e326b] text-white outline outline-2 outline-offset-1 outline-black"
            :class="{ '!bg-[#1975c5]': hover === 'no' }"
            data-target="no"
          >
            {{ translate('downloadHelp.vc.uacNo') }}
          </span>
        </div>
      </div>

      <div
        class="axolotl-setup"
        :style="{
          left: `${SETUP.x}px`,
          top: `${SETUP.y}px`,
          ...shown(view.setup),
          transform: `scale(${0.94 + 0.06 * view.setup})`,
        }"
        data-target="setup"
      >
        <div
          class="absolute -top-32 -right-24 size-[470px] rounded-full bg-[radial-gradient(closest-side,rgb(244_114_182/0.38),transparent)]"
        />
        <div
          class="absolute -bottom-32 -left-24 size-[380px] rounded-full bg-[radial-gradient(closest-side,rgb(139_92_246/0.34),transparent)]"
        />
        <div class="relative flex h-[54px] items-center border-0 border-b border-solid border-white/5 pl-5">
          <img src="/axolotl.png" alt="" class="size-[22px] object-contain" />
          <span class="setup-name ml-3">Axolotl Launcher</span>
          <svg
            class="mr-[38px] ml-auto"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#a1a1aa"
            stroke-width="1.8"
          >
            <path d="M5 12h14" />
          </svg>
          <svg
            class="mr-[19px]"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#a1a1aa"
            stroke-width="1.8"
          >
            <path d="m6 6 12 12M18 6 6 18" />
          </svg>
        </div>
        <div class="relative flex h-[488px] flex-col items-center justify-center px-12 text-center">
          <p class="setup-title m-0">{{ translate('downloadHelp.vc.setupTitle') }}</p>
          <p class="m-0 mt-8 text-[24px] leading-9 font-medium text-[#a1a1aa]">
            {{ translate('downloadHelp.vc.setupLead') }}
          </p>
        </div>
        <div class="relative flex items-center justify-between px-12">
          <span class="text-[12px] font-medium text-[#71717a]">
            {{ translate('downloadHelp.vc.setupFooter') }}
          </span>
          <span
            class="flex h-8 items-center gap-2 rounded-full border border-solid border-[#be185d] bg-[#db2777] px-4 text-[14px] font-semibold text-white"
          >
            {{ translate('downloadHelp.vc.setupContinue') }}
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <path d="m9 18 6-6-6-6" />
            </svg>
          </span>
        </div>
      </div>

      <span class="dh-guide" :style="guide" />
      <HelpCursor
        v-if="!reducedMotion && pointer"
        :x="pointer.x"
        :y="pointer.y"
        :kind="cursorKind"
        :time="time"
        :visible="!view.pointerHidden"
      />
    </div>
  </WindowsScreen>
</template>

<style scoped>
@reference "tailwindcss";

.flyout-item {
  @apply relative mx-2 mb-2 rounded-md py-[9px] pr-4 pl-12;
}

.win-button {
  @apply flex h-[23px] w-[75px] items-center justify-center rounded border border-solid border-[#dfb8ca] bg-[#fff8fb] text-[12px] text-black;
}

.win-button-hover {
  @apply border-[#ad4275] bg-[#ffe6f2];
}

.win-button-pressed {
  @apply border-[#8f2f60] bg-[#facce2];
}

.win-button-disabled {
  @apply border-[#e5e5e5] bg-[#f5f5f5] text-[#a0a0a0];

  svg {
    opacity: 0.45;
  }
}

.checkbox {
  @apply relative size-[13px] shrink-0 rounded-[3px] border border-solid border-[#5d5d5d] bg-white;
}

.uac {
  position: absolute;
  z-index: 50;
  top: 352px;
  left: 732px;
  width: 456px;
  overflow: hidden;
  border: 1px solid #cd8cae;
  border-radius: 14px;
  background: #fff8fb;
  color: #000;
  box-shadow: 0 16px 48px rgb(0 0 0 / 0.45);
}

.uac-button {
  @apply flex h-[30px] w-[200px] items-center justify-center text-[13px];
}

.axolotl-setup {
  position: absolute;
  z-index: 35;
  width: 940px;
  height: 620px;
  overflow: hidden;
  border: 1px solid rgb(255 255 255 / 0.1);
  border-radius: 8px;
  background: #09090b;
  color: #fff;
  font-family: Inter, 'Segoe UI Variable Text', 'Segoe UI', 'Microsoft YaHei UI', system-ui, sans-serif;
  letter-spacing: -0.01em;
  box-shadow: 0 30px 80px rgb(0 0 0 / 0.55);
}

.setup-name {
  font-size: 14px;
  font-weight: 700;
  background: linear-gradient(to right, #fff, #a1a1aa);
  background-clip: text;
  -webkit-text-fill-color: transparent;
}

.setup-title {
  font-size: 84px;
  font-weight: 900;
  line-height: 1.05;
  letter-spacing: -0.04em;
  background: linear-gradient(180deg, #fbcfe8 0%, #f472b6 100%);
  background-clip: text;
  -webkit-text-fill-color: transparent;
  filter: drop-shadow(0 16px 32px rgb(244 114 182 / 0.2));
}
</style>

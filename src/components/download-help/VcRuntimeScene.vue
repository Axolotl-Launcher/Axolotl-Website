<script setup lang="ts">
import { defineMessages, useVIntl } from '@modrinth/ui'

import AxolotlSitePage from './AxolotlSitePage.vue'
import EdgeFlyout from './EdgeFlyout.vue'
import EdgeWindow from './EdgeWindow.vue'
import HelpCursor from './HelpCursor.vue'
import SetupIcon from './SetupIcon.vue'
import { centreVariables, useStageTargets } from './use-stage-targets'
import WinWindow from './WinWindow.vue'

const props = defineProps<{ step: number; fileName: string }>()

const { formatMessage } = useVIntl()

const VC_NAME = 'Microsoft Visual C++ v14 Redistributable (x64) - 14.51.36247'
const VC_PACKAGE = 'Microsoft Visual C++ 2022 X64 Minimum Runtime - 14.51.36247'
const VC_FILE = 'vc_redist.x64.exe'
const VC_ADDRESS = 'aka.ms/vc14/vc_redist.x64.exe'

// Windows' loader and UAC wording, the VC++ v14 installer's own theme strings and
// the Axolotl installer's welcome screen.
const messages = defineMessages({
    tabTitle: {
        id: 'axolotl-download-help.edge.tab-title',
        defaultMessage: 'Axolotl Launcher - Free, Open-Source Minecraft Java Launcher',
    },
    siteDownload: { id: 'axolotl-download-help.edge.site-download', defaultMessage: 'Download' },
    downloads: { id: 'axolotl-download-help.edge.downloads', defaultMessage: 'Downloads' },
    openFile: { id: 'axolotl-download-help.edge.open-file', defaultMessage: 'Open file' },
    seeMore: { id: 'axolotl-download-help.edge.see-more', defaultMessage: 'See more' },
    errorTitle: {
        id: 'axolotl-download-help.vc.error-title',
        defaultMessage: '{file} - System Error',
    },
    errorBody: {
        id: 'axolotl-download-help.vc.error-body',
        defaultMessage:
            'The code execution cannot proceed because VCRUNTIME140_1.dll was not found. Reinstalling the program may fix this problem.',
    },
    ok: { id: 'axolotl-download-help.vc.ok', defaultMessage: 'OK' },
    recycleBin: { id: 'axolotl-download-help.vc.recycle-bin', defaultMessage: 'Recycle Bin' },
    caption: { id: 'axolotl-download-help.vc.caption', defaultMessage: '{name} Setup' },
    licenseLink: {
        id: 'axolotl-download-help.vc.license-link',
        defaultMessage:
            'The license terms for {name} are available from https://aka.ms/VCRedistLicense',
    },
    agree: {
        id: 'axolotl-download-help.vc.agree',
        defaultMessage: 'I agree to the license terms and conditions',
    },
    install: { id: 'axolotl-download-help.vc.install', defaultMessage: 'Install' },
    close: { id: 'axolotl-download-help.vc.close', defaultMessage: 'Close' },
    cancel: { id: 'axolotl-download-help.vc.cancel', defaultMessage: 'Cancel' },
    progress: { id: 'axolotl-download-help.vc.progress', defaultMessage: 'Setup Progress' },
    processing: { id: 'axolotl-download-help.vc.processing', defaultMessage: 'Processing:' },
    success: { id: 'axolotl-download-help.vc.success', defaultMessage: 'Setup Successful' },
    uacTitle: { id: 'axolotl-download-help.vc.uac-title', defaultMessage: 'User Account Control' },
    uacQuestion: {
        id: 'axolotl-download-help.vc.uac-question',
        defaultMessage: 'Do you want to allow this app to make changes to your device?',
    },
    uacPublisher: {
        id: 'axolotl-download-help.vc.uac-publisher',
        defaultMessage: 'Verified publisher: Microsoft Corporation',
    },
    uacDetails: { id: 'axolotl-download-help.vc.uac-details', defaultMessage: 'Show more details' },
    uacYes: { id: 'axolotl-download-help.vc.uac-yes', defaultMessage: 'Yes' },
    uacNo: { id: 'axolotl-download-help.vc.uac-no', defaultMessage: 'No' },
    setupTitle: {
        id: 'axolotl-download-help.vc.setup-title',
        defaultMessage: 'Your last next launcher.',
    },
    setupLead: {
        id: 'axolotl-download-help.vc.setup-lead',
        defaultMessage: 'Install Axolotl Launcher and start a whole new Minecraft experience.',
    },
    setupFooter: {
        id: 'axolotl-download-help.vc.setup-footer',
        defaultMessage: 'No account or game files are changed during setup.',
    },
    setupContinue: { id: 'axolotl-download-help.vc.setup-continue', defaultMessage: 'Continue' },
})

const root = ref<HTMLElement | null>(null)
const targets = useStageTargets(root)
const rootStyle = computed(() => centreVariables(targets.value))

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
            'translate(220px, 54px)',
            'translate(var(--yes-cx), var(--yes-cy))',
            'translate(var(--setupFile-cx), var(--setupFile-cy))',
        ][props.step],
)
</script>

<template>
    <div ref="root" class="absolute inset-0" :style="rootStyle">
        <div class="desktop-icon top-1.5">
            <svg width="48" height="48" viewBox="0 0 48 48">
                <path
                    d="M11 13h26l-2.6 29.5a2 2 0 0 1-2 1.8H15.6a2 2 0 0 1-2-1.8z"
                    fill="#e8f1fb"
                    fill-opacity=".85"
                    stroke="#9bb7d6"
                />
                <path d="M9 11.5h30v3H9z" fill="#c9dbef" stroke="#8eaacb" />
                <path d="M19 19v19M24 19v19M29 19v19" stroke="#b5cbe4" stroke-width="1.2" />
            </svg>
            <span>{{ formatMessage(messages.recycleBin) }}</span>
        </div>
        <div class="desktop-icon top-[82px]" data-target="setupFile">
            <img src="/axolotl.png" alt="" class="size-12 object-contain" />
            <span class="line-clamp-2 break-all">{{ fileName }}</span>
        </div>

        <WinWindow
            v-if="step === 0"
            :title="formatMessage(messages.errorTitle, { file: fileName })"
            class="dh-vanish left-[110px] top-[166px] w-[420px]"
            style="--at: 0.25"
        >
            <div class="flex h-[84px] gap-3 pl-6 pr-5 pt-6">
                <svg class="shrink-0" width="32" height="32" viewBox="0 0 32 32">
                    <circle cx="16" cy="16" r="15.5" fill="#e9440f" />
                    <path d="M11 11l10 10M21 11L11 21" stroke="#fff" stroke-width="2" />
                </svg>
                <p class="m-0 pt-px text-[12px] leading-[17px]">
                    {{ formatMessage(messages.errorBody) }}
                </p>
            </div>
            <div class="flex h-[41px] items-center justify-end bg-[#f0f0f0] pr-[11px]">
                <span class="win-button border-[#0067c0]" data-target="ok">
                    {{ formatMessage(messages.ok) }}
                </span>
            </div>
        </WinWindow>

        <EdgeWindow
            :tab-title="formatMessage(messages.tabTitle)"
            favicon
            :downloads="step === 0 ? 'idle' : 'open'"
            :class="{ 'dh-appear': step === 0, 'dh-vanish': step === 2 }"
            :style="{ '--at': step === 0 ? 0.28 : 0.38 }"
        >
            <template #address>
                <span v-if="step === 0" class="relative">
                    <span class="dh-vanish" style="--at: 0.4">
                        <span class="url-selected">https://axlmc.org</span>
                    </span>
                    <span class="typing absolute left-0 top-0 whitespace-nowrap">{{
                        VC_ADDRESS
                    }}</span>
                </span>
                <template v-else>https://axlmc.org</template>
            </template>
            <template #page>
                <AxolotlSitePage :download-label="formatMessage(messages.siteDownload)" />
            </template>
            <EdgeFlyout
                v-if="step < 2"
                :title="formatMessage(messages.downloads)"
                class="left-[165px] top-[71px] h-[179px]"
                :class="{ 'dh-appear': step === 0 }"
                style="--at: 0.66"
            >
                <div class="flyout-item top-[46px]" :class="{ 'bg-[#f4f4f4]': step === 1 }">
                    <SetupIcon class="absolute left-[10px] top-2 size-5" />
                    <div class="flyout-item-text">
                        <span class="block truncate">{{ VC_FILE }}</span>
                        <span class="text-[#115ea3]" data-target="openVc">
                            {{ formatMessage(messages.openFile) }}
                        </span>
                    </div>
                </div>
                <div class="flyout-item top-24">
                    <img src="/axolotl.png" alt="" class="absolute left-2.5 top-2 size-5" />
                    <div class="flyout-item-text">
                        <span class="block truncate">{{ fileName }}</span>
                        <span class="text-[#115ea3]">{{ formatMessage(messages.openFile) }}</span>
                    </div>
                </div>
                <span
                    class="absolute left-[26px] top-[154px] text-[14px] font-semibold leading-[19px]"
                >
                    {{ formatMessage(messages.seeMore) }}
                </span>
            </EdgeFlyout>
        </EdgeWindow>

        <WinWindow
            v-if="step > 0"
            :title="formatMessage(messages.caption, { name: VC_NAME })"
            minimize
            maximize="off"
            class="left-[76px] top-[70px] w-[487px]"
            :class="{ 'dh-appear': step === 1, 'dh-vanish': step === 2 }"
            :style="{ '--at': step === 1 ? 0.18 : 0.34 }"
        >
            <template #icon>
                <SetupIcon class="size-4" />
            </template>
            <div class="relative h-[300px] text-[12px] leading-4">
                <svg
                    class="absolute left-[11px] top-[11px]"
                    width="64"
                    height="64"
                    viewBox="0 0 64 64"
                >
                    <path
                        fill="#68217a"
                        fill-rule="evenodd"
                        d="M5 18.5 9 16l12 9 2.5 2.5L26 24 44 5.5l14.5 5V54L45 58.5l-20.5-21-1.5-1-1.5 2-10 8-4.5 1L5 46zm40.5 2.5L32.5 32l13 11zM10 24.5 17 32l-7 7.5z"
                    />
                </svg>
                <p class="absolute left-20 right-[11px] top-[11px] m-0 h-16 text-[24px] leading-8">
                    {{ VC_NAME }}
                </p>

                <template v-if="step === 1">
                    <div class="dh-vanish absolute inset-0" style="--at: 0.76">
                        <p class="absolute left-[11px] right-[11px] top-[121px] m-0">
                            {{ formatMessage(messages.licenseLink, { name: VC_NAME }) }}
                        </p>
                        <div
                            class="absolute left-[11px] right-[11px] top-[230px] flex h-[29px] items-center gap-[5px]"
                        >
                            <span class="checkbox" data-target="agree">
                                <span
                                    class="dh-appear absolute inset-0 rounded-[3px] bg-[#005fb8]"
                                    style="--at: 0.34"
                                >
                                    <svg width="13" height="13" viewBox="0 0 13 13">
                                        <path
                                            d="M3 6.8l2.3 2.3L10 4.4"
                                            fill="none"
                                            stroke="#fff"
                                            stroke-width="1.3"
                                        />
                                    </svg>
                                </span>
                            </span>
                            {{ formatMessage(messages.agree) }}
                        </div>
                        <span
                            class="win-button absolute left-[319px] top-[266px] gap-[3px]"
                            data-target="install"
                        >
                            <svg width="16" height="16" viewBox="0 0 16 16">
                                <path
                                    d="M8 1.2l5.6 2v4C13.6 11 11.2 13.6 8 14.8 4.8 13.6 2.4 11 2.4 7.2v-4z"
                                    fill="#1d6fdc"
                                />
                                <path
                                    d="M8 1.2l5.6 2v4.3H8zM2.4 7.5H8v7.3c-3.2-1.2-5.6-3.8-5.6-7.3z"
                                    fill="#f7c339"
                                />
                            </svg>
                            {{ formatMessage(messages.install) }}
                            <span
                                class="dh-vanish absolute inset-[-1px] rounded bg-white/55"
                                style="--at: 0.34"
                            />
                        </span>
                        <span class="win-button absolute left-[399px] top-[266px]">
                            {{ formatMessage(messages.close) }}
                        </span>
                    </div>
                    <div class="dh-appear absolute inset-0" style="--at: 0.76">
                        <p
                            class="absolute left-[11px] top-20 m-0 text-[22px] leading-[30px] text-[#666]"
                        >
                            {{ formatMessage(messages.progress) }}
                        </p>
                        <p class="absolute left-[11px] top-[121px] m-0 w-[70px]">
                            {{ formatMessage(messages.processing) }}
                        </p>
                        <p class="absolute left-[85px] right-[11px] top-[121px] m-0 truncate">
                            {{ VC_PACKAGE }}
                        </p>
                        <div
                            class="absolute left-[11px] right-[11px] top-[143px] h-[15px] border border-solid border-[#bcbcbc] bg-[#e6e6e6]"
                        >
                            <span class="progress block h-full bg-[#06b025]" />
                        </div>
                        <span class="win-button absolute left-[399px] top-[266px]">
                            {{ formatMessage(messages.cancel) }}
                        </span>
                    </div>
                </template>
                <template v-else>
                    <p
                        class="absolute left-[11px] top-20 m-0 text-[22px] leading-[30px] text-[#666]"
                    >
                        {{ formatMessage(messages.success) }}
                    </p>
                    <span
                        class="win-button absolute left-[399px] top-[266px]"
                        data-target="closeVc"
                    >
                        {{ formatMessage(messages.close) }}
                    </span>
                </template>
            </div>
        </WinWindow>

        <template v-if="step > 0">
            <!-- Kept invisible on the next step so the pointer can start where it clicked "Yes". -->
            <div
                class="absolute inset-0 z-40"
                :class="step === 1 ? 'dh-vanish' : 'invisible'"
                style="--at: 0.72"
            >
                <div class="dh-appear absolute inset-0 bg-black/55" style="--at: 0.52">
                    <div class="uac">
                        <div class="relative bg-[#e7e7e7] px-[22px] pb-[18px] pt-[13px]">
                            <p class="m-0 text-[12px] leading-[17px]">
                                {{ formatMessage(messages.uacTitle) }}
                            </p>
                            <p class="m-0 mt-3.5 text-[20px] leading-[26px]">
                                {{ formatMessage(messages.uacQuestion) }}
                            </p>
                            <svg
                                class="absolute right-3.5 top-3"
                                width="10"
                                height="10"
                                viewBox="0 0 10 10"
                            >
                                <path d="M.5.5l9 9M9.5.5l-9 9" stroke="#1a1a1a" />
                            </svg>
                        </div>
                        <div class="px-[22px] pb-[22px] pt-[11px]">
                            <div class="flex items-center gap-3">
                                <svg class="shrink-0" width="38" height="38" viewBox="0 0 38 38">
                                    <path
                                        d="M19 2.5l14 5v10c0 9.5-6 15.8-14 18.5C11 33.3 5 27 5 17.5v-10z"
                                        fill="#1d6fdc"
                                    />
                                    <path
                                        d="M19 2.5l14 5v10.5H19zM5 18h14v18c-8-2.7-14-9-14-18z"
                                        fill="#f7c339"
                                    />
                                </svg>
                                <p class="m-0 text-[18px] leading-6">{{ VC_NAME }}</p>
                            </div>
                            <p class="m-0 mt-[18px] text-[13px] leading-[18px]">
                                {{ formatMessage(messages.uacPublisher) }}
                            </p>
                            <p class="m-0 mt-[30px] text-[13px] leading-[18px] text-[#0059b5]">
                                {{ formatMessage(messages.uacDetails) }}
                            </p>
                        </div>
                        <div class="flex gap-2.5 bg-[#f3f3f3] px-[26px] pb-[25px] pt-[25px]">
                            <span
                                class="uac-button border border-solid border-[#d0d0d0] bg-[#fbfbfb]"
                                data-target="yes"
                            >
                                {{ formatMessage(messages.uacYes) }}
                            </span>
                            <span
                                class="uac-button bg-[#0067c0] text-white outline outline-2 outline-offset-1 outline-black"
                            >
                                {{ formatMessage(messages.uacNo) }}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </template>

        <div v-if="step === 2" class="axolotl-setup dh-appear" style="--at: 0.72">
            <div
                class="absolute -right-24 -top-32 size-[470px] rounded-full bg-[radial-gradient(closest-side,rgb(244_114_182/0.38),transparent)]"
            />
            <div
                class="absolute -bottom-32 -left-24 size-[380px] rounded-full bg-[radial-gradient(closest-side,rgb(139_92_246/0.34),transparent)]"
            />
            <div
                class="relative flex h-[54px] items-center border-0 border-b border-solid border-white/5 pl-5"
            >
                <img src="/axolotl.png" alt="" class="size-[22px] object-contain" />
                <span class="setup-name ml-3">Axolotl Launcher</span>
                <svg
                    class="ml-auto mr-[38px]"
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
            <div
                class="relative flex h-[488px] flex-col items-center justify-center px-12 text-center"
            >
                <p class="setup-title m-0">{{ formatMessage(messages.setupTitle) }}</p>
                <p class="m-0 mt-8 text-[24px] font-medium leading-9 text-[#a1a1aa]">
                    {{ formatMessage(messages.setupLead) }}
                </p>
            </div>
            <div class="relative flex items-center justify-between px-12">
                <span class="text-[12px] font-medium text-[#71717a]">{{
                    formatMessage(messages.setupFooter)
                }}</span>
                <span
                    class="flex h-8 items-center gap-2 rounded-full border border-solid border-[#be185d] bg-[#db2777] px-4 text-[14px] font-semibold text-white"
                >
                    {{ formatMessage(messages.setupContinue) }}
                    <svg
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="2.5"
                    >
                        <path d="m9 18 6-6-6-6" />
                    </svg>
                </span>
            </div>
        </div>

        <template v-if="step === 0">
            <span class="dh-hint" :style="{ ...ring('ok'), '--from': 0.03, '--to': 0.24 }" />
            <span class="dh-ripple" :style="{ ...ripple('ok'), '--at': 0.21 }" />
            <span class="dh-ripple left-[220px] top-[54px]" style="--at: 0.38" />
        </template>
        <template v-else-if="step === 1">
            <span class="dh-hint" :style="{ ...ring('openVc'), '--from': 0.02, '--to': 0.15 }" />
            <span class="dh-hint" :style="{ ...ring('agree', 4), '--from': 0.24, '--to': 0.35 }" />
            <span class="dh-hint" :style="{ ...ring('install'), '--from': 0.37, '--to': 0.5 }" />
            <span class="dh-hint z-50" :style="{ ...ring('yes'), '--from': 0.56, '--to': 0.71 }" />
            <span class="dh-ripple" :style="{ ...ripple('openVc'), '--at': 0.13 }" />
            <span class="dh-ripple" :style="{ ...ripple('agree'), '--at': 0.33 }" />
            <span class="dh-ripple" :style="{ ...ripple('install'), '--at': 0.48 }" />
            <span class="dh-ripple z-50" :style="{ ...ripple('yes'), '--at': 0.7 }" />
        </template>
        <template v-else>
            <span class="dh-hint" :style="{ ...ring('closeVc'), '--from': 0.04, '--to': 0.31 }" />
            <span
                class="dh-hint"
                :style="{ ...ring('setupFile', 2), '--from': 0.42, '--to': 0.68 }"
            />
            <span class="dh-ripple" :style="{ ...ripple('closeVc'), '--at': 0.3 }" />
            <span class="dh-ripple" :style="{ ...ripple('setupFile'), '--at': 0.61 }" />
            <span class="dh-ripple" :style="{ ...ripple('setupFile'), '--at': 0.66 }" />
        </template>

        <HelpCursor class="z-[60]" :class="`cursor-${step}`" :style="{ transform: cursorEnd }" />
    </div>
</template>

<style scoped lang="scss">
.desktop-icon {
    @apply absolute left-0.5 flex w-[76px] flex-col items-center gap-0.5 px-0.5 pt-0.5 text-center text-[12px] leading-4 text-white;

    text-shadow:
        0 1px 2px rgb(0 0 0 / 0.75),
        0 0 1px rgb(0 0 0 / 0.6);
}

.win-button {
    @apply flex h-[23px] w-[75px] items-center justify-center rounded border border-solid border-[#d0d0d0] bg-[#fdfdfd] text-[12px] text-black;
}

.checkbox {
    @apply relative size-[13px] shrink-0 rounded-[3px] border border-solid border-[#5d5d5d] bg-white;
}

.flyout-item {
    @apply absolute left-1.5 h-[46px] w-[347px] rounded;
}

.flyout-item-text {
    @apply absolute left-9 top-1.5 w-[298px] text-[12px] leading-[19px];
}

.url-selected {
    background: #cce4f7;
}

.typing {
    clip-path: inset(0 0 0 0);
    animation: typing calc(var(--d) * 0.2) steps(29, end) calc(var(--d) * 0.4) both;
}

.uac {
    position: absolute;
    top: 64px;
    left: 92px;
    width: 456px;
    overflow: hidden;
    border: 1px solid #f0f0f0;
    background: #fff;
    color: #000;
    box-shadow: 0 16px 48px rgb(0 0 0 / 0.45);
}

.uac-button {
    @apply flex h-[30px] w-[200px] items-center justify-center text-[13px];
}

.progress {
    width: 100%;
    animation: progress calc(var(--d) * 0.24) ease-out calc(var(--d) * 0.76) both;
}

.axolotl-setup {
    position: absolute;
    z-index: 30;
    top: 62px;
    left: 38px;
    width: 940px;
    height: 620px;
    overflow: hidden;
    border: 1px solid rgb(255 255 255 / 0.1);
    background: #09090b;
    color: #fff;
    font-family:
        Inter, 'Segoe UI Variable Text', 'Segoe UI', 'Microsoft YaHei UI', system-ui, sans-serif;
    letter-spacing: -0.01em;
    transform: scale(0.6);
    transform-origin: 0 0;
    box-shadow: 0 30px 80px rgb(0 0 0 / 0.45);
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

.cursor-0 {
    animation-name: cursor-0;
}

.cursor-1 {
    animation-name: cursor-1;
}

.cursor-2 {
    animation-name: cursor-2;
}

@keyframes typing {
    from {
        clip-path: inset(0 100% 0 0);
    }
}

@keyframes progress {
    from {
        width: 0;
    }
}

@keyframes cursor-0 {
    0%,
    4% {
        transform: translate(300px, 420px);
        animation-timing-function: cubic-bezier(0.45, 0, 0.2, 1);
    }
    19% {
        transform: translate(var(--ok-cx), var(--ok-cy));
    }
    21% {
        transform: translate(var(--ok-cx), var(--ok-cy)) scale(0.9);
    }
    23%,
    28% {
        transform: translate(var(--ok-cx), var(--ok-cy));
        animation-timing-function: cubic-bezier(0.45, 0, 0.2, 1);
    }
    37% {
        transform: translate(220px, 54px);
    }
    38% {
        transform: translate(220px, 54px) scale(0.9);
    }
    40%,
    100% {
        transform: translate(220px, 54px);
    }
}

@keyframes cursor-1 {
    0%,
    2% {
        transform: translate(220px, 54px);
        animation-timing-function: cubic-bezier(0.45, 0, 0.2, 1);
    }
    11% {
        transform: translate(var(--openVc-cx), var(--openVc-cy));
    }
    13% {
        transform: translate(var(--openVc-cx), var(--openVc-cy)) scale(0.9);
    }
    15%,
    22% {
        transform: translate(var(--openVc-cx), var(--openVc-cy));
        animation-timing-function: cubic-bezier(0.45, 0, 0.2, 1);
    }
    31% {
        transform: translate(var(--agree-cx), var(--agree-cy));
    }
    33% {
        transform: translate(var(--agree-cx), var(--agree-cy)) scale(0.9);
    }
    35%,
    37% {
        transform: translate(var(--agree-cx), var(--agree-cy));
        animation-timing-function: cubic-bezier(0.45, 0, 0.2, 1);
    }
    46% {
        transform: translate(var(--install-cx), var(--install-cy));
    }
    48% {
        transform: translate(var(--install-cx), var(--install-cy)) scale(0.9);
    }
    50%,
    56% {
        transform: translate(var(--install-cx), var(--install-cy));
        animation-timing-function: cubic-bezier(0.45, 0, 0.2, 1);
    }
    68% {
        transform: translate(var(--yes-cx), var(--yes-cy));
    }
    70% {
        transform: translate(var(--yes-cx), var(--yes-cy)) scale(0.9);
    }
    72%,
    100% {
        transform: translate(var(--yes-cx), var(--yes-cy));
    }
}

@keyframes cursor-2 {
    0%,
    8% {
        transform: translate(var(--yes-cx), var(--yes-cy));
        animation-timing-function: cubic-bezier(0.45, 0, 0.2, 1);
    }
    28% {
        transform: translate(var(--closeVc-cx), var(--closeVc-cy));
    }
    30% {
        transform: translate(var(--closeVc-cx), var(--closeVc-cy)) scale(0.9);
    }
    32%,
    42% {
        transform: translate(var(--closeVc-cx), var(--closeVc-cy));
        animation-timing-function: cubic-bezier(0.45, 0, 0.2, 1);
    }
    58% {
        transform: translate(var(--setupFile-cx), var(--setupFile-cy));
    }
    61% {
        transform: translate(var(--setupFile-cx), var(--setupFile-cy)) scale(0.9);
    }
    63% {
        transform: translate(var(--setupFile-cx), var(--setupFile-cy));
    }
    66% {
        transform: translate(var(--setupFile-cx), var(--setupFile-cy)) scale(0.9);
    }
    68%,
    100% {
        transform: translate(var(--setupFile-cx), var(--setupFile-cy));
    }
}
</style>

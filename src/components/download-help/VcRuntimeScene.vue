<script setup lang="ts">
import { defineMessages, useVIntl } from '@modrinth/ui'

import EdgeWindow from './EdgeWindow.vue'
import HelpCursor from './HelpCursor.vue'

defineProps<{ step: number; fileName: string }>()

const { formatMessage } = useVIntl()

const VC_NAME = 'Microsoft Visual C++ Redistributable (x64)'
const VC_FILE = 'vc_redist.x64.exe'
const VC_ADDRESS = 'aka.ms/vc14/vc_redist.x64.exe'

const messages = defineMessages({
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
    newTab: { id: 'axolotl-download-help.vc.new-tab', defaultMessage: 'New tab' },
    downloads: { id: 'axolotl-download-help.edge.downloads', defaultMessage: 'Downloads' },
    openFile: { id: 'axolotl-download-help.edge.open-file', defaultMessage: 'Open file' },
    license: {
        id: 'axolotl-download-help.vc.license',
        defaultMessage: 'MICROSOFT SOFTWARE LICENSE TERMS',
    },
    agree: {
        id: 'axolotl-download-help.vc.agree',
        defaultMessage: 'I agree to the license terms and conditions',
    },
    install: { id: 'axolotl-download-help.vc.install', defaultMessage: 'Install' },
    close: { id: 'axolotl-download-help.vc.close', defaultMessage: 'Close' },
    cancel: { id: 'axolotl-download-help.vc.cancel', defaultMessage: 'Cancel' },
    progress: { id: 'axolotl-download-help.vc.progress', defaultMessage: 'Setup Progress' },
    success: { id: 'axolotl-download-help.vc.success', defaultMessage: 'Setup Successful' },
    recycleBin: { id: 'axolotl-download-help.vc.recycle-bin', defaultMessage: 'Recycle Bin' },
    axolotlSetup: {
        id: 'axolotl-download-help.vc.axolotl-setup',
        defaultMessage: 'Axolotl Launcher Setup',
    },
})

/** Where the pointer rests at the end of each step, in stage pixels. */
const CURSOR_END = [
    { x: 260, y: 76 },
    { x: 354, y: 308 },
    { x: 54, y: 124 },
]
</script>

<template>
    <div :key="step" class="absolute inset-0">
        <div class="desktop-icon top-3">
            <svg width="34" height="34" viewBox="0 0 34 34">
                <path d="M8 9h18l-2 21H10z" fill="#d7e6f7" stroke="#6d8fb5" />
                <path d="M6 9h22" stroke="#6d8fb5" stroke-width="2" />
                <path d="M13 14v12M17 14v12M21 14v12" stroke="#9db6d3" />
            </svg>
            <span>{{ formatMessage(messages.recycleBin) }}</span>
        </div>
        <div class="desktop-icon top-[92px]">
            <img src="/axolotl.png" alt="" class="size-[34px]" />
            <span class="line-clamp-2 break-all">{{ fileName }}</span>
        </div>

        <div
            class="absolute inset-x-0 bottom-0 flex h-10 items-center justify-center gap-2 bg-[#eef1f6]/90"
        >
            <svg width="22" height="22" viewBox="0 0 22 22">
                <rect x="2" y="2" width="8.5" height="8.5" rx="1" fill="#1a73e8" />
                <rect x="11.5" y="2" width="8.5" height="8.5" rx="1" fill="#1a73e8" />
                <rect x="2" y="11.5" width="8.5" height="8.5" rx="1" fill="#1a73e8" />
                <rect x="11.5" y="11.5" width="8.5" height="8.5" rx="1" fill="#1a73e8" />
            </svg>
            <span
                class="h-6 w-[120px] rounded-full border border-solid border-[#d5d9df] bg-white"
            />
            <span
                class="size-6 rounded-md bg-[linear-gradient(135deg,#35c1f1,#0c59a4_60%,#47d26f)]"
            />
            <svg width="24" height="22" viewBox="0 0 24 22">
                <path d="M2 4h7l2 2.5h11V19H2z" fill="#f7c948" stroke="#c99a1c" />
            </svg>
        </div>

        <EdgeWindow
            :tab-title="formatMessage(messages.newTab)"
            class="left-[60px] top-[22px] h-[330px] w-[540px]"
            :class="{ 'dh-appear': step === 0, 'dh-vanish': step === 2 }"
            :style="{ '--at': step === 0 ? 0.3 : 0.38 }"
        >
            <template #address>
                <span class="typing" :class="{ 'typing-animated': step === 0 }">{{
                    VC_ADDRESS
                }}</span>
            </template>
            <div
                class="flyout left-[228px] top-[78px] h-[118px] w-[300px]"
                :class="{ 'dh-appear': step === 0 }"
                style="--at: 0.66"
            >
                <div class="flex h-11 items-center px-4 text-[14px] font-semibold">
                    {{ formatMessage(messages.downloads) }}
                </div>
                <div
                    class="absolute left-2 top-11 flex h-16 w-[284px] gap-2.5 rounded-md bg-[#f3f4f6] p-3"
                >
                    <svg class="shrink-0" width="20" height="24" viewBox="0 0 20 24">
                        <path d="M2 1h11l5 5v17H2z" fill="#f4f6f9" stroke="#8a94a3" />
                        <rect x="5" y="9" width="10" height="9" rx="1.5" fill="#7a5bd6" />
                    </svg>
                    <div class="flex flex-col gap-1">
                        <span class="text-[11.5px]">{{ VC_FILE }}</span>
                        <span class="text-[11.5px] font-semibold text-[#0f6cbd] underline">
                            {{ formatMessage(messages.openFile) }}
                        </span>
                    </div>
                </div>
            </div>
        </EdgeWindow>

        <div
            v-if="step === 0"
            class="win-dialog dh-vanish left-[150px] top-[90px] h-[150px] w-[360px]"
            style="--at: 0.25"
        >
            <div class="win-title">
                <span class="flex-1 truncate">
                    {{ formatMessage(messages.errorTitle, { file: fileName }) }}
                </span>
                <svg width="10" height="10" viewBox="0 0 10 10">
                    <path d="M0 0l10 10M10 0L0 10" stroke="#333" />
                </svg>
            </div>
            <div class="flex gap-3.5 px-5 pt-3">
                <svg class="shrink-0" width="32" height="32" viewBox="0 0 32 32">
                    <circle cx="16" cy="16" r="15" fill="#d13438" />
                    <path d="M11 11l10 10M21 11L11 21" stroke="#fff" stroke-width="2.4" />
                </svg>
                <p class="m-0 text-[12px] leading-[18px]">
                    {{ formatMessage(messages.errorBody) }}
                </p>
            </div>
            <div
                class="absolute inset-x-0 bottom-0 flex h-[46px] items-center justify-end bg-[#f0f0f0] px-3.5"
            >
                <span class="win-button w-[84px] border-[#0f6cbd]">{{
                    formatMessage(messages.ok)
                }}</span>
            </div>
        </div>

        <div
            v-if="step > 0"
            class="win-dialog left-[130px] top-[46px] h-[290px] w-[380px]"
            :class="{ 'dh-appear': step === 1, 'dh-vanish': step === 2 }"
            :style="{ '--at': step === 1 ? 0.26 : 0.38 }"
        >
            <div class="win-title">
                <span class="flex-1 truncate">{{ VC_NAME }}</span>
                <svg width="10" height="10" viewBox="0 0 10 10" class="mr-5">
                    <path d="M0 5h10" stroke="#333" />
                </svg>
                <svg width="10" height="10" viewBox="0 0 10 10">
                    <path d="M0 0l10 10M10 0L0 10" stroke="#333" />
                </svg>
            </div>
            <div class="px-[18px] pt-3">
                <p class="m-0 text-[15px] font-semibold text-[#1b3a6b]">{{ VC_NAME }}</p>
            </div>

            <template v-if="step === 1">
                <div class="dh-vanish absolute inset-x-0 bottom-0 top-16" style="--at: 0.78">
                    <div
                        class="mx-[18px] mt-2.5 flex h-[104px] flex-col gap-1.5 border border-solid border-[#c8c8c8] bg-white p-2.5"
                    >
                        <span class="text-[10.5px] font-semibold">{{
                            formatMessage(messages.license)
                        }}</span>
                        <span
                            v-for="width in [92, 86, 95, 70, 88, 60]"
                            :key="width"
                            class="h-1.5 rounded bg-[#e3e5e8]"
                            :style="{ width: `${width}%` }"
                        />
                    </div>
                    <div class="mx-[18px] mt-3 flex items-center gap-2 text-[12px]">
                        <span
                            class="relative grid size-3.5 place-items-center rounded-sm border border-solid border-[#555] bg-white"
                        >
                            <svg
                                class="dh-appear absolute"
                                style="--at: 0.46"
                                width="10"
                                height="10"
                                viewBox="0 0 10 10"
                            >
                                <path
                                    d="M1.5 5.2l2.3 2.3L8.5 2.5"
                                    fill="none"
                                    stroke="#111"
                                    stroke-width="1.5"
                                />
                            </svg>
                        </span>
                        {{ formatMessage(messages.agree) }}
                    </div>
                    <div class="absolute bottom-3.5 right-4 flex gap-2">
                        <span class="win-button relative w-[88px] gap-1">
                            <svg width="12" height="12" viewBox="0 0 12 12">
                                <path
                                    d="M6 1l4.5 1.8v3.4C10.5 9 8.5 10.6 6 11.3 3.5 10.6 1.5 9 1.5 6.2V2.8z"
                                    fill="#1a73e8"
                                />
                                <path d="M6 1v10.3" stroke="#f7c948" stroke-width="1.6" />
                            </svg>
                            {{ formatMessage(messages.install) }}
                            <span
                                class="dh-vanish absolute inset-0 rounded bg-white/60"
                                style="--at: 0.46"
                            />
                        </span>
                        <span class="win-button w-[88px]">{{ formatMessage(messages.close) }}</span>
                    </div>
                </div>
                <div class="dh-appear absolute inset-x-0 bottom-0 top-16" style="--at: 0.78">
                    <p class="m-0 mx-[18px] mt-4 text-[12px]">
                        {{ formatMessage(messages.progress) }}
                    </p>
                    <div
                        class="mx-[18px] mt-2 h-3.5 overflow-hidden rounded-sm border border-solid border-[#bcbcbc] bg-[#e6e6e6]"
                    >
                        <span class="progress block h-full bg-[#06b025]" />
                    </div>
                    <div class="absolute bottom-3.5 right-4">
                        <span class="win-button w-[88px]">{{
                            formatMessage(messages.cancel)
                        }}</span>
                    </div>
                </div>
            </template>
            <template v-else>
                <p class="m-0 mx-[18px] mt-8 text-[22px] font-light text-[#1b3a6b]">
                    {{ formatMessage(messages.success) }}
                </p>
                <div class="absolute bottom-3.5 right-4">
                    <span class="win-button w-[88px] border-[#0f6cbd]">{{
                        formatMessage(messages.close)
                    }}</span>
                </div>
            </template>
        </div>

        <div
            v-if="step === 2"
            class="win-dialog dh-appear left-[180px] top-[86px] h-[210px] w-[320px]"
            style="--at: 0.76"
        >
            <div class="win-title">
                <img src="/axolotl.png" alt="" class="size-3.5" />
                <span class="flex-1 truncate">{{ formatMessage(messages.axolotlSetup) }}</span>
                <svg width="10" height="10" viewBox="0 0 10 10">
                    <path d="M0 0l10 10M10 0L0 10" stroke="#333" />
                </svg>
            </div>
            <div class="flex items-center gap-3 px-5 pt-5">
                <img src="/axolotl.png" alt="" class="size-12" />
                <span class="text-[17px] font-semibold">Axolotl Launcher</span>
            </div>
            <div class="flex flex-col gap-2 px-5 pt-4">
                <span
                    v-for="width in [88, 72, 80]"
                    :key="width"
                    class="h-1.5 rounded bg-[#e3e5e8]"
                    :style="{ width: `${width}%` }"
                />
            </div>
            <span class="absolute bottom-3.5 right-4 h-[26px] w-[88px] rounded bg-[#1bd96a]" />
        </div>

        <template v-if="step === 0">
            <span
                class="dh-hint left-[409px] top-[201px] h-8 w-[90px]"
                style="--from: 0.03; --to: 0.24"
            />
            <span class="dh-ripple left-[454px] top-[217px]" style="--at: 0.21" />
            <span class="dh-ripple left-[260px] top-[76px]" style="--at: 0.38" />
        </template>
        <template v-else-if="step === 1">
            <span
                class="dh-hint left-[322px] top-[170px] h-6 w-[82px]"
                style="--from: 0.02; --to: 0.22"
            />
            <span
                class="dh-hint left-[144px] top-[234px] size-[22px] !rounded-[5px]"
                style="--from: 0.28; --to: 0.48"
            />
            <span
                class="dh-hint left-[307px] top-[291px] h-[34px] w-[94px]"
                style="--from: 0.5; --to: 0.74"
            />
            <span class="dh-ripple left-[363px] top-[182px]" style="--at: 0.19" />
            <span class="dh-ripple left-[155px] top-[245px]" style="--at: 0.45" />
            <span class="dh-ripple left-[354px] top-[308px]" style="--at: 0.72" />
        </template>
        <template v-else>
            <span
                class="dh-hint left-[403px] top-[291px] h-[34px] w-[94px]"
                style="--from: 0.06; --to: 0.34"
            />
            <span
                class="dh-hint left-[14px] top-[86px] h-[72px] w-20"
                style="--from: 0.42; --to: 0.74"
            />
            <span class="dh-ripple left-[450px] top-[308px]" style="--at: 0.32" />
            <span class="dh-ripple left-[54px] top-[124px]" style="--at: 0.63" />
            <span class="dh-ripple left-[54px] top-[124px]" style="--at: 0.68" />
        </template>

        <HelpCursor
            :class="`cursor-${step}`"
            :style="{ transform: `translate(${CURSOR_END[step].x}px, ${CURSOR_END[step].y}px)` }"
        />
    </div>
</template>

<style scoped lang="scss">
.desktop-icon {
    @apply absolute left-4 flex w-[76px] flex-col items-center gap-1 text-center text-[10.5px] leading-[13px] text-white;

    text-shadow: 0 1px 2px rgb(0 0 0 / 0.6);
}

.flyout {
    position: absolute;
    z-index: 10;
    border: 1px solid rgb(0 0 0 / 0.08);
    border-radius: 8px;
    background: #fff;
    box-shadow: 0 8px 24px rgb(0 0 0 / 0.18);
}

.win-dialog {
    position: absolute;
    z-index: 30;
    overflow: hidden;
    border: 1px solid rgb(0 0 0 / 0.25);
    border-radius: 8px;
    background: #fff;
    box-shadow: 0 16px 40px rgb(0 0 0 / 0.3);
}

.win-title {
    @apply flex h-[30px] items-center gap-2 px-3.5 text-[11.5px];
}

.win-button {
    @apply flex h-[26px] items-center justify-center rounded border border-solid border-[#c4c4c4] bg-[#fdfdfd] text-[12px];
}

.typing {
    display: inline-block;
}

.typing-animated {
    animation: typing calc(var(--d) * 0.22) steps(29, end) calc(var(--d) * 0.4) both;
}

.progress {
    width: 100%;
    animation: progress calc(var(--d) * 0.22) ease-out calc(var(--d) * 0.78) both;
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
        transform: translate(300px, 300px);
        animation-timing-function: cubic-bezier(0.45, 0, 0.2, 1);
    }
    19% {
        transform: translate(454px, 217px);
    }
    21% {
        transform: translate(454px, 217px) scale(0.85);
    }
    23%,
    28% {
        transform: translate(454px, 217px);
        animation-timing-function: cubic-bezier(0.45, 0, 0.2, 1);
    }
    37% {
        transform: translate(260px, 76px);
    }
    38% {
        transform: translate(260px, 76px) scale(0.85);
    }
    40%,
    100% {
        transform: translate(260px, 76px);
    }
}

@keyframes cursor-1 {
    0%,
    3% {
        transform: translate(260px, 76px);
        animation-timing-function: cubic-bezier(0.45, 0, 0.2, 1);
    }
    17% {
        transform: translate(363px, 182px);
    }
    19% {
        transform: translate(363px, 182px) scale(0.85);
    }
    21%,
    30% {
        transform: translate(363px, 182px);
        animation-timing-function: cubic-bezier(0.45, 0, 0.2, 1);
    }
    43% {
        transform: translate(155px, 245px);
    }
    45% {
        transform: translate(155px, 245px) scale(0.85);
    }
    47%,
    54% {
        transform: translate(155px, 245px);
        animation-timing-function: cubic-bezier(0.45, 0, 0.2, 1);
    }
    70% {
        transform: translate(354px, 308px);
    }
    72% {
        transform: translate(354px, 308px) scale(0.85);
    }
    74%,
    100% {
        transform: translate(354px, 308px);
    }
}

@keyframes cursor-2 {
    0%,
    10% {
        transform: translate(354px, 308px);
        animation-timing-function: cubic-bezier(0.45, 0, 0.2, 1);
    }
    30% {
        transform: translate(450px, 308px);
    }
    32% {
        transform: translate(450px, 308px) scale(0.85);
    }
    34%,
    42% {
        transform: translate(450px, 308px);
        animation-timing-function: cubic-bezier(0.45, 0, 0.2, 1);
    }
    61% {
        transform: translate(54px, 124px);
    }
    63% {
        transform: translate(54px, 124px) scale(0.85);
    }
    65% {
        transform: translate(54px, 124px);
    }
    68% {
        transform: translate(54px, 124px) scale(0.85);
    }
    70%,
    100% {
        transform: translate(54px, 124px);
    }
}
</style>

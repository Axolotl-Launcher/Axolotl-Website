<script setup lang="ts">
import PauseIcon from '@modrinth/assets/icons/pause.svg?component'
import PlayIcon from '@modrinth/assets/icons/play.svg?component'
import { defineMessages, IntlFormatted, NewModal, useVIntl } from '@modrinth/ui'

import { filterByUserAgent } from '~/utils/download-help'

import HelpStage from './HelpStage.vue'
import { DEFAULT_STEP_DURATION_MS, DOWNLOAD_HELP_QUESTIONS } from './questions'

const FALLBACK_FILE_NAME = 'Axolotl_Launcher_x64-setup.exe'

const { formatMessage } = useVIntl()
const { request } = useDownloadHelp()

const messages = defineMessages({
    title: { id: 'axolotl-download-help.title', defaultMessage: 'Your download has started' },
    description: {
        id: 'axolotl-download-help.description',
        defaultMessage: 'If you run into one of these, follow the steps once and you are all set.',
    },
    questions: { id: 'axolotl-download-help.questions', defaultMessage: 'Common problems' },
    steps: { id: 'axolotl-download-help.steps', defaultMessage: 'Steps' },
    step: { id: 'axolotl-download-help.step', defaultMessage: 'Step {number}' },
    pause: { id: 'axolotl-download-help.pause', defaultMessage: 'Pause' },
    play: { id: 'axolotl-download-help.play', defaultMessage: 'Play' },
})

const modal = ref<InstanceType<typeof NewModal> | null>(null)
const userAgent = ref('')
const questions = computed(() => filterByUserAgent(DOWNLOAD_HELP_QUESTIONS, userAgent.value))
const questionIndex = ref(0)
const question = computed(() => questions.value[questionIndex.value])
const fileName = computed(() => request.value.fileName ?? FALLBACK_FILE_NAME)

const step = ref(0)
const elapsedMs = ref(0)
const playing = ref(true)
const reducedMotion = ref(false)
const stepDurationMs = computed(
    () => question.value?.steps[step.value]?.durationMs ?? DEFAULT_STEP_DURATION_MS,
)
const stepProgress = computed(() => Math.min(1, elapsedMs.value / stepDurationMs.value))

let frame: number | undefined
let lastFrameAt = 0

function tick(now: number) {
    if (playing.value && question.value) {
        elapsedMs.value += now - lastFrameAt
        if (elapsedMs.value >= stepDurationMs.value) {
            step.value = (step.value + 1) % question.value.steps.length
            elapsedMs.value = 0
        }
    }
    lastFrameAt = now
    frame = requestAnimationFrame(tick)
}

function stopPlayback() {
    if (frame !== undefined) cancelAnimationFrame(frame)
    frame = undefined
}

function startPlayback() {
    stopPlayback()
    lastFrameAt = performance.now()
    frame = requestAnimationFrame(tick)
}

function selectQuestion(index: number) {
    questionIndex.value = index
    selectStep(0)
    playing.value = !reducedMotion.value
}

function selectStep(index: number) {
    step.value = index
    elapsedMs.value = 0
}

function onTabKeydown(event: KeyboardEvent) {
    const offset = { ArrowRight: 1, ArrowLeft: -1 }[event.key]
    if (!offset) return
    event.preventDefault()
    const count = questions.value.length
    selectQuestion((questionIndex.value + offset + count) % count)
    document.getElementById(`download-help-tab-${questionIndex.value}`)?.focus()
}

watch(
    () => request.value.id,
    () => {
        userAgent.value = navigator.userAgent
        if (questions.value.length === 0) return
        reducedMotion.value =
            window.matchMedia('(prefers-reduced-motion: reduce)').matches ||
            document.documentElement.classList.contains('reduced-motion')
        selectQuestion(0)
        modal.value?.show()
        startPlayback()
    },
)

onBeforeUnmount(stopPlayback)
</script>

<template>
    <NewModal
        ref="modal"
        hide-header
        merge-header
        no-padding
        width="min(68rem, calc(100vw - 2rem))"
        max-width="min(68rem, calc(100vw - 2rem))"
        aria-labelledby="download-help-title"
        :on-hide="stopPlayback"
    >
        <div
            v-if="question"
            class="flex max-h-[calc(100vh-4rem)] flex-col gap-5 overflow-y-auto p-5 sm:p-8"
        >
            <div class="pr-10">
                <h2
                    id="download-help-title"
                    class="m-0 text-2xl font-bold text-[var(--color-contrast)]"
                >
                    {{ formatMessage(messages.title) }}
                </h2>
                <p class="m-0 mt-2 text-[var(--color-text-tertiary)]">
                    {{ formatMessage(messages.description) }}
                </p>
            </div>

            <div
                role="tablist"
                :aria-label="formatMessage(messages.questions)"
                class="flex gap-1 overflow-x-auto rounded-2xl bg-surface-2 p-1"
                @keydown="onTabKeydown"
            >
                <button
                    v-for="(item, index) in questions"
                    :id="`download-help-tab-${index}`"
                    :key="item.id"
                    role="tab"
                    type="button"
                    :aria-selected="index === questionIndex"
                    :tabindex="index === questionIndex ? 0 : -1"
                    aria-controls="download-help-panel"
                    class="min-w-0 flex-1 cursor-pointer break-words rounded-xl border-0 px-4 py-2.5 text-base font-semibold transition-colors"
                    :class="
                        index === questionIndex
                            ? 'bg-surface-4 text-[var(--color-contrast)] shadow-sm'
                            : 'bg-transparent text-[var(--color-text-tertiary)] hover:text-[var(--color-text-default)]'
                    "
                    @click="selectQuestion(index)"
                >
                    {{ formatMessage(item.question) }}
                </button>
            </div>

            <div
                id="download-help-panel"
                role="tabpanel"
                :aria-labelledby="`download-help-tab-${questionIndex}`"
                class="grid items-start gap-6 md:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)]"
            >
                <div
                    class="relative overflow-hidden rounded-2xl border border-solid border-surface-5"
                >
                    <HelpStage
                        :duration-ms="stepDurationMs"
                        :paused="!playing"
                        :still="reducedMotion"
                    >
                        <component :is="question.scene" :step="step" :file-name="fileName" />
                    </HelpStage>
                    <button
                        type="button"
                        class="absolute bottom-2 right-2 flex cursor-pointer items-center gap-1.5 rounded-full border-0 bg-black/60 px-2.5 py-1 text-xs font-semibold text-white backdrop-blur sm:bottom-3 sm:right-3 sm:px-3 sm:py-1.5 sm:text-sm"
                        @click="playing = !playing"
                    >
                        <PauseIcon v-if="playing" class="size-4" aria-hidden="true" />
                        <PlayIcon v-else class="size-4" aria-hidden="true" />
                        {{ formatMessage(playing ? messages.pause : messages.play) }}
                    </button>
                </div>

                <ol
                    :aria-label="formatMessage(messages.steps)"
                    class="m-0 flex list-none flex-col p-0"
                >
                    <li
                        v-for="(item, index) in question.steps"
                        :key="item.text.id"
                        class="step relative flex cursor-pointer gap-3 rounded-xl p-2.5 transition-colors"
                        :class="index === step ? 'bg-brand-highlight' : 'hover:bg-surface-2'"
                        @click="selectStep(index)"
                    >
                        <button
                            type="button"
                            class="step-ring grid size-8 shrink-0 cursor-pointer place-items-center rounded-full border-0 p-[3px]"
                            :style="{ '--p': index === step ? stepProgress : index < step ? 1 : 0 }"
                            :aria-label="formatMessage(messages.step, { number: index + 1 })"
                            :aria-current="index === step ? 'step' : undefined"
                            @click.stop="selectStep(index)"
                        >
                            <span
                                class="grid size-full place-items-center rounded-full text-sm font-bold"
                                :class="
                                    index === step
                                        ? 'bg-brand text-brand-inverted'
                                        : index < step
                                          ? 'bg-surface-3 text-brand'
                                          : 'bg-surface-4 text-[var(--color-text-tertiary)]'
                                "
                            >
                                {{ index + 1 }}
                            </span>
                        </button>
                        <p
                            class="m-0 pt-1 leading-6"
                            :class="
                                index === step
                                    ? 'text-[var(--color-contrast)]'
                                    : 'text-[var(--color-text-default)]'
                            "
                        >
                            <IntlFormatted :message-id="item.text">
                                <template #strong="{ children }">
                                    <strong class="font-bold text-[var(--color-contrast)]">
                                        <component :is="() => children" />
                                    </strong>
                                </template>
                                <template #link="{ children }">
                                    <a
                                        :href="question.link"
                                        target="_blank"
                                        rel="noopener"
                                        class="break-all font-semibold text-brand underline"
                                        @click.stop
                                    >
                                        <component :is="() => children" />
                                    </a>
                                </template>
                            </IntlFormatted>
                        </p>
                    </li>
                </ol>
            </div>
        </div>
    </NewModal>
</template>

<style scoped lang="scss">
.step-ring {
    background: conic-gradient(var(--color-brand) calc(var(--p) * 1turn), var(--color-divider) 0);
}

// Dashed line from this step's number down to the next one.
.step:not(:last-child)::after {
    position: absolute;
    top: calc(0.625rem + 2rem + 0.25rem);
    bottom: -0.375rem;
    left: calc(0.625rem + 1rem - 1px);
    border-left: 2px dashed var(--color-divider-dark);
    content: '';
}
</style>

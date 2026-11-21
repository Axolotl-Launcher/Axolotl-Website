<script setup lang="ts">
import { useMediaQuery, useRafFn } from '@vueuse/core'

import EdgeKeepScene from './EdgeKeepScene.vue'
import HelpStage from './HelpStage.vue'
import VcRuntimeScene from './VcRuntimeScene.vue'

interface HelpStep {
  duration: number
  actions: number
  link?: string
}

interface HelpQuestion {
  id: 'edge' | 'vc'
  scene: typeof EdgeKeepScene | typeof VcRuntimeScene
  steps: HelpStep[]
}

const edge: HelpQuestion = {
  id: 'edge',
  scene: EdgeKeepScene,
  steps: [
    { duration: 5000, actions: 2 },
    { duration: 3800, actions: 2 },
    { duration: 4800, actions: 1 },
  ],
}
const vc: HelpQuestion = {
  id: 'vc',
  scene: VcRuntimeScene,
  steps: [
    { duration: 9200, actions: 0, link: 'https://aka.ms/vc14/vc_redist.x64.exe' },
    { duration: 10500, actions: 4 },
    { duration: 7600, actions: 2 },
  ],
}

const { t } = useI18n()
const dialogId = useId()
const dialog = ref<HTMLDialogElement | null>(null)
const open = ref(false)
const fileName = ref('')
const questions = shallowRef<HelpQuestion[]>([])
const questionIndex = ref(0)
const question = computed(() => questions.value[questionIndex.value])
const step = ref(0)
const elapsed = ref(0)
const playing = ref(false)
const reducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)')
const duration = computed(() => question.value?.steps[step.value]?.duration ?? 0)
const progress = computed(() => (duration.value > 0 ? elapsed.value / duration.value : 0))

function selectStep(index: number) {
  step.value = index
  elapsed.value = 0
}

function selectQuestion(index: number) {
  questionIndex.value = index
  selectStep(0)
  playing.value = !reducedMotion.value
}

const { pause, resume } = useRafFn(
  ({ delta }) => {
    if (!question.value) return
    elapsed.value += Math.min(delta, 100)
    if (elapsed.value >= duration.value) selectStep((step.value + 1) % question.value.steps.length)
  },
  { immediate: false },
)

watch([open, playing, reducedMotion], ([isOpen, isPlaying, reduce]) => {
  if (reduce) playing.value = false
  if (isOpen && isPlaying && !reduce) resume()
  else pause()
})

function openForDownload(name: string, installer: boolean) {
  const userAgent = navigator.userAgent
  if (!userAgent.includes('Windows')) return false

  const available = []
  if (/\bEdg\//.test(userAgent)) available.push(edge)
  if (installer) available.push(vc)
  if (!available.length) return false

  fileName.value = name
  questions.value = available
  selectQuestion(0)
  nextTick(() => {
    if (!dialog.value) return
    if (!dialog.value.open) dialog.value.showModal()
    open.value = true
  })
  return true
}

function onClose() {
  if (dialog.value?.open) return
  pause()
  open.value = false
  questions.value = []
}

function onBackdropClick(event: MouseEvent) {
  if (event.target === dialog.value) dialog.value?.close()
}

function onTabKeydown(event: KeyboardEvent) {
  const count = questions.value.length
  const positions: Record<string, number> = {
    ArrowRight: (questionIndex.value + 1) % count,
    ArrowLeft: (questionIndex.value - 1 + count) % count,
    Home: 0,
    End: count - 1,
  }
  const index = positions[event.key]
  if (index === undefined) return
  event.preventDefault()
  selectQuestion(index)
  dialog.value?.querySelector<HTMLElement>(`[id="${dialogId}-tab-${index}"]`)?.focus()
}

defineExpose({ openForDownload })
</script>

<template>
  <dialog
    ref="dialog"
    class="download-help m-auto w-[min(68rem,calc(100%-2rem))] max-w-none overflow-hidden rounded-panel border border-border bg-surface-1 p-0 text-fg shadow-floating backdrop:bg-black/55"
    :aria-labelledby="`${dialogId}-title`"
    :aria-describedby="`${dialogId}-description`"
    @close="onClose"
    @click="onBackdropClick"
  >
    <div v-if="question" class="flex max-h-[calc(100dvh-2rem)] flex-col">
      <header class="flex shrink-0 items-start justify-between gap-4 border-b border-divider px-5 py-4 sm:px-7">
        <div>
          <h2 :id="`${dialogId}-title`" class="text-section-sm font-semibold">{{ t('downloadHelp.title') }}</h2>
          <p :id="`${dialogId}-description`" class="mt-1 text-body text-fg-muted">
            {{ t('downloadHelp.description') }}
          </p>
        </div>
        <button
          type="button"
          autofocus
          class="grid size-10 shrink-0 place-items-center rounded-btn text-fg-muted hover:bg-surface-2 hover:text-fg"
          :aria-label="t('downloadHelp.close')"
          @click="dialog?.close()"
        >
          <Icon name="lucide:x" class="size-5" aria-hidden="true" />
        </button>
      </header>

      <div class="min-h-0 overflow-y-auto overscroll-contain p-5 sm:p-7" data-lenis-prevent>
        <div
          role="tablist"
          :aria-label="t('downloadHelp.questions')"
          class="mb-5 flex gap-1 rounded-card bg-surface-2 p-1"
          @keydown="onTabKeydown"
        >
          <button
            v-for="(item, index) in questions"
            :id="`${dialogId}-tab-${index}`"
            :key="item.id"
            role="tab"
            type="button"
            :aria-selected="index === questionIndex"
            :tabindex="index === questionIndex ? 0 : -1"
            :aria-controls="`${dialogId}-panel`"
            class="min-w-0 flex-1 rounded-btn px-2 py-2.5 text-caption font-semibold wrap-anywhere sm:px-4"
            :class="index === questionIndex ? 'bg-surface-1 text-fg shadow-sm' : 'text-fg-muted hover:text-fg'"
            @click="selectQuestion(index)"
          >
            {{ t(`downloadHelp.${item.id}.question`) }}
          </button>
        </div>

        <div
          :id="`${dialogId}-panel`"
          role="tabpanel"
          :aria-labelledby="`${dialogId}-tab-${questionIndex}`"
          class="grid items-start gap-5 md:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)]"
        >
          <figure class="overflow-hidden rounded-card border border-border bg-surface-2">
            <HelpStage>
              <component
                :is="question.scene"
                :step="step"
                :time="reducedMotion ? duration : elapsed"
                :file-name="fileName"
                :reduced-motion="reducedMotion"
              />
            </HelpStage>
            <figcaption class="flex min-h-11 items-center justify-between gap-2 border-t border-divider px-3">
              <span class="text-caption text-fg-muted">{{ t('downloadHelp.illustration') }}</span>
              <button
                v-if="!reducedMotion"
                type="button"
                class="inline-flex min-h-8 items-center gap-1.5 rounded-btn px-2 text-caption font-semibold hover:bg-surface-3"
                @click="playing = !playing"
              >
                <Icon :name="playing ? 'lucide:pause' : 'lucide:play'" class="size-4" aria-hidden="true" />
                {{ t(playing ? 'downloadHelp.pause' : 'downloadHelp.play') }}
              </button>
            </figcaption>
          </figure>

          <ol :aria-label="t('downloadHelp.steps')" class="flex flex-col gap-1">
            <li
              v-for="(item, index) in question.steps"
              :key="index"
              class="relative flex items-start gap-3 rounded-card p-2.5"
              :class="index === step ? 'bg-accent/10' : 'hover:bg-surface-2'"
            >
              <button
                type="button"
                class="step-control grid size-8 shrink-0 place-items-center rounded-full p-0.5 text-caption font-semibold after:absolute after:inset-0 after:rounded-card"
                :style="{ '--step-progress': index < step ? 1 : index === step && !reducedMotion ? progress : 0 }"
                :aria-label="t('downloadHelp.step', { number: index + 1 })"
                :aria-current="index === step ? 'step' : undefined"
                @click="selectStep(index)"
              >
                <span
                  class="grid size-full place-items-center rounded-full"
                  :class="index === step ? 'bg-accent text-on-accent' : 'bg-surface-2 text-fg-muted'"
                >
                  {{ index + 1 }}
                </span>
              </button>
              <i18n-t
                :keypath="`downloadHelp.${question.id}.step${index + 1}`"
                scope="global"
                tag="p"
                class="min-w-0 pt-1 text-body text-fg-muted"
              >
                <template v-for="action in item.actions" :key="action" #[`action${action}`]>
                  <strong class="font-semibold text-fg">
                    {{ t(`downloadHelp.${question.id}.step${index + 1}Action${action}`) }}
                  </strong>
                </template>
                <template #runtimeLink>
                  <a
                    v-if="item.link"
                    :href="item.link"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="relative z-10 font-semibold wrap-anywhere text-accent-strong underline underline-offset-4"
                  >
                    {{ item.link.replace('https://', '') }}
                  </a>
                </template>
              </i18n-t>
            </li>
          </ol>
        </div>
      </div>
    </div>
  </dialog>
</template>

<style>
body:has(.download-help[open]) {
  overflow: hidden;
}

.step-control {
  background: conic-gradient(var(--accent) calc(var(--step-progress) * 1turn), var(--divider) 0);
}
</style>

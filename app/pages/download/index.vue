<script setup lang="ts">
import type { DownloadSourceId, ReleaseChannel } from '~/utils/download-sources'
import { isDownloadSource } from '~/utils/download-sources'
import { resolveLauncherDownloads } from '~/utils/launcher-downloads'
import {
  pickFastestSource,
  probeDownloadSources,
  type DownloadCandidate,
  type DownloadProbeResult,
} from '~/utils/download-probe'
import {
  defaultFormatForPlatform,
  downloadFormatMatches,
  DOWNLOAD_LINK_KEY_BY_FORMAT,
  isDownloadFormat,
  isDownloadPlatform,
  type DownloadFormat,
  type DownloadPlatform,
} from '~/utils/download-selection'

const { t } = useI18n()
const localePath = useLocalePath()
const route = useRoute()

const channel = ref<ReleaseChannel>('release')
const step = ref(0)
const platform = ref<DownloadPlatform>('windows')
const format = ref<DownloadFormat>('installer')

const { release, status, refresh } = useLauncherDownloads(channel)
const { selectedSource, sources, setDownloadSource } = useDownloadSource()
const { platform: recommended, isFallback } = useRecommendedPlatform()

const platforms = computed(() => [
  { id: 'windows' as const, icon: 'lucide:monitor', name: t('download.windows'), hint: t('download.windowsHint') },
  { id: 'mac' as const, icon: 'lucide:laptop', name: t('download.mac'), hint: t('download.macHint') },
  { id: 'linux' as const, icon: 'lucide:terminal-square', name: t('download.linux'), hint: t('download.linuxHint') },
])

const channels = computed<{ value: ReleaseChannel; label: string }[]>(() => [
  { value: 'release', label: t('download.release') },
  { value: 'beta', label: t('download.beta') },
])

const formatOptions = computed<{ value: DownloadFormat; label: string }[]>(() => {
  if (platform.value === 'windows') {
    return [
      { value: 'installer', label: t('download.formatInstaller') },
      { value: 'portable', label: t('download.formatPortable') },
    ]
  }
  if (platform.value === 'linux') {
    return [
      { value: 'appimage', label: t('download.formatAppImage') },
      { value: 'deb', label: t('download.formatDeb') },
      { value: 'rpm', label: t('download.formatRpm') },
    ]
  }
  return []
})

const detectedPlatformName = computed(() => platforms.value.find((item) => item.id === recommended.value)?.name ?? '')

const stepLabels = computed(() => [t('download.stepPlatform'), t('download.stepOptions'), t('download.stepConfirm')])

const selectedPlatform = computed(
  () => platforms.value.find((item) => item.id === platform.value) ?? platforms.value[0]!,
)

const formatLabel = computed(() => {
  const labels: Record<DownloadFormat, string> = {
    installer: t('download.formatInstaller'),
    portable: t('download.formatPortable'),
    dmg: t('download.formatDmg'),
    appimage: t('download.formatAppImage'),
    deb: t('download.formatDeb'),
    rpm: t('download.formatRpm'),
  }
  return labels[format.value]
})

const channelLabel = computed(() => (channel.value === 'beta' ? t('download.beta') : t('download.release')))

const versionText = computed(() => {
  if (status.value === 'pending' || status.value === 'idle') return t('download.loadingVersion')
  if (status.value === 'error') return t('download.error')
  return release.value ? t('download.latestVersion', { version: release.value.version }) : t('download.unavailable')
})

const sourceLabels = computed<Record<DownloadSourceId, string>>(() => ({
  'update-server': t('download.sourceUpdateServer'),
  github: t('download.sourceGithub'),
  gitlink: t('download.sourceGitlink'),
}))

const sourceDescriptions = computed<Record<DownloadSourceId, string>>(() => ({
  'update-server': t('download.sourceUpdateServerDescription'),
  github: t('download.sourceGithubDescription'),
  gitlink: t('download.sourceGitlinkDescription'),
}))

const probeResults = ref<DownloadProbeResult[]>([])
const probing = ref(false)
let probeRun = 0

const linkKey = computed(() => DOWNLOAD_LINK_KEY_BY_FORMAT[format.value])

const probeCandidates = computed<DownloadCandidate[]>(() => {
  if (!release.value) return []
  return sources.flatMap((source) => {
    const url = resolveLauncherDownloads(release.value, source.id, sources)[linkKey.value]
    return url ? [{ id: source.id, url }] : []
  })
})

const bestProbe = computed(() => probeResults.value.find((result) => result.ok) ?? null)

const effectiveSource = computed<DownloadSourceId>(() =>
  selectedSource.value === 'auto' ? pickFastestSource(probeResults.value, 'update-server') : selectedSource.value,
)

const selectedLink = computed(() => {
  if (!release.value) return null
  return resolveLauncherDownloads(release.value, effectiveSource.value, sources)[linkKey.value]
})

async function refreshProbe() {
  if (step.value !== 2 || selectedSource.value !== 'auto' || probeCandidates.value.length < 2) {
    probeRun += 1
    probeResults.value = []
    probing.value = false
    return
  }

  const run = ++probeRun
  probing.value = true
  const results = await probeDownloadSources(probeCandidates.value, { timeoutMs: 2000 })
  if (run !== probeRun) return
  probeResults.value = results
  probing.value = false
}

watch([probeCandidates, selectedSource, step], refreshProbe, { immediate: true })

onBeforeUnmount(() => {
  probeRun += 1
})

function sourceMeta(id: DownloadSourceId) {
  const result = probeResults.value.find((entry) => entry.id === id)
  if (!result) return undefined
  return result.ok ? `${result.latencyMs} ms` : t('download.sourceUnavailable')
}

const autoMeta = computed(() => {
  if (selectedSource.value !== 'auto') return undefined
  if (probing.value) return t('download.sourceProbing')
  const best = bestProbe.value
  if (!best) return undefined
  return t('download.sourceFastest', {
    source: sourceLabels.value[best.id],
    latency: best.latencyMs,
  })
})

const sourceOptions = computed(() => [
  {
    value: 'auto' as const,
    label: t('download.sourceAuto'),
    description: t('download.sourceAutoDescription'),
    meta: autoMeta.value,
  },
  ...(['update-server', 'github', 'gitlink'] as const).map((id) => ({
    value: id,
    label: sourceLabels.value[id],
    description: sourceDescriptions.value[id],
    meta: sourceMeta(id),
    unavailable: probeResults.value.find((entry) => entry.id === id)?.ok === false,
  })),
])

const selectedSourceDescription = computed(
  () => sourceOptions.value.find((option) => option.value === selectedSource.value)?.description ?? '',
)

const isLastStep = computed(() => step.value === stepLabels.value.length - 1)

function selectPlatform(value: DownloadPlatform) {
  platform.value = value
  format.value = defaultFormatForPlatform(value)
}

function next() {
  if (!isLastStep.value) step.value += 1
}

function back() {
  if (step.value > 0) step.value -= 1
}

function startDownload() {
  return navigateTo({
    path: localePath({ path: '/download/thanks' }),
    query: {
      platform: platform.value,
      channel: channel.value,
      format: format.value,
      source: effectiveSource.value,
      start: '1',
    },
  })
}

onMounted(() => {
  const queryPlatform = route.query.platform
  const queryFormat = route.query.format
  const queryChannel = route.query.channel
  const querySource = route.query.source

  platform.value = isDownloadPlatform(queryPlatform) ? queryPlatform : recommended.value
  format.value = defaultFormatForPlatform(platform.value)
  if (isDownloadFormat(queryFormat) && downloadFormatMatches(platform.value, queryFormat)) {
    format.value = queryFormat
  }
  if (queryChannel === 'beta' || queryChannel === 'release') channel.value = queryChannel
  if (isDownloadSource(querySource)) setDownloadSource(querySource)
})

useSeoMeta({
  title: `${t('download.title')} — Axolotl Launcher`,
  description: t('download.lead'),
  ogTitle: `${t('download.title')} — Axolotl Launcher`,
  ogDescription: t('download.lead'),
  ogType: 'website',
})
</script>

<template>
  <div class="site-container py-10 sm:py-14">
    <header class="mx-auto max-w-2xl text-center">
      <p class="font-mono text-micro font-semibold tracking-[0.22em] text-accent uppercase">
        {{ t('download.eyebrow') }}
      </p>
      <h1 class="mt-3 text-section text-balance">{{ t('download.title') }}</h1>
      <p class="mt-4 text-lead text-fg-muted">{{ t('download.lead') }}</p>
      <p class="mt-3 text-caption text-fg-subtle" aria-live="polite">{{ versionText }}</p>
    </header>

    <div class="mx-auto mt-10 max-w-3xl">
      <ol class="flex flex-wrap items-center justify-center gap-x-3 gap-y-2" :aria-label="t('download.stepsAria')">
        <li
          v-for="(label, index) in stepLabels"
          :key="label"
          class="flex items-center gap-3"
          :aria-current="index === step ? 'step' : undefined"
        >
          <span class="flex items-center gap-2">
            <span
              class="grid size-8 place-items-center rounded-full border text-caption font-semibold transition-colors"
              :class="
                index === step
                  ? 'border-accent bg-accent text-on-accent'
                  : index < step
                    ? 'border-accent/40 bg-accent/10 text-accent'
                    : 'border-border bg-surface-1 text-fg-subtle'
              "
            >
              <Icon v-if="index < step" name="lucide:check" class="size-4" aria-hidden="true" />
              <template v-else>{{ index + 1 }}</template>
            </span>
            <span class="text-caption font-medium" :class="index === step ? 'text-fg' : 'text-fg-subtle'">
              {{ label }}
            </span>
          </span>
          <span v-if="index < stepLabels.length - 1" class="h-px w-6 bg-border sm:w-10" aria-hidden="true" />
        </li>
      </ol>

      <div class="mt-8 rounded-panel border border-border bg-surface-1 p-5 sm:p-8">
        <div class="min-h-[18rem]">
          <AnimatePresence mode="wait" :initial="false">
            <Motion
              :key="step"
              :initial="{ opacity: 0, y: 8 }"
              :animate="{ opacity: 1, y: 0 }"
              :exit="{ opacity: 0, y: -8 }"
              :transition="{ duration: 0.18, ease: 'easeOut' }"
            >
              <div v-if="step === 0">
                <h2 class="text-center text-card font-semibold">{{ t('download.stepPlatformTitle') }}</h2>
                <p class="mt-2 text-center text-caption text-fg-muted">{{ t('download.stepPlatformLead') }}</p>
                <p v-if="isFallback" class="mt-3 text-center text-micro text-fg-subtle">
                  {{ t('download.fallbackNote') }}
                </p>
                <p v-else class="mt-3 flex items-center justify-center gap-1.5 text-micro text-fg-subtle">
                  <Icon name="lucide:monitor-dot" class="size-3.5" aria-hidden="true" />
                  {{ t('download.detectedDevice', { platform: detectedPlatformName }) }}
                </p>

                <div class="mt-6 grid gap-3 sm:grid-cols-3">
                  <button
                    v-for="item in platforms"
                    :key="item.id"
                    type="button"
                    class="rounded-card border p-4 text-left transition-colors"
                    :class="
                      platform === item.id
                        ? 'border-accent bg-accent/5'
                        : 'border-border bg-surface-2/50 hover:border-border-strong'
                    "
                    :aria-pressed="platform === item.id"
                    @click="selectPlatform(item.id)"
                  >
                    <span
                      class="grid size-10 place-items-center rounded-card border border-border bg-surface-1 text-accent"
                    >
                      <Icon :name="item.icon" class="size-5" aria-hidden="true" />
                    </span>
                    <span class="mt-3 block text-caption font-semibold">{{ item.name }}</span>
                    <span class="mt-1 block text-micro leading-relaxed text-fg-subtle">{{ item.hint }}</span>
                  </button>
                </div>
              </div>

              <div v-else-if="step === 1">
                <h2 class="text-center text-card font-semibold">{{ t('download.stepOptionsTitle') }}</h2>
                <p class="mt-2 text-center text-caption text-fg-muted">{{ t('download.stepOptionsLead') }}</p>

                <fieldset class="mt-6">
                  <legend class="text-caption font-semibold">{{ t('download.channelLabel') }}</legend>
                  <div class="mt-2 grid grid-cols-2 gap-2">
                    <button
                      v-for="option in channels"
                      :key="option.value"
                      type="button"
                      class="h-10 rounded-btn border text-caption font-semibold transition-colors"
                      :class="
                        channel === option.value
                          ? 'border-accent bg-accent text-on-accent'
                          : 'border-border bg-surface-2 text-fg-muted hover:text-fg'
                      "
                      :aria-pressed="channel === option.value"
                      @click="channel = option.value"
                    >
                      {{ option.label }}
                    </button>
                  </div>
                </fieldset>

                <fieldset v-if="formatOptions.length" class="mt-6">
                  <legend class="text-caption font-semibold">{{ t('download.formatLabel') }}</legend>
                  <div class="mt-2 grid gap-2" :class="formatOptions.length === 3 ? 'grid-cols-3' : 'grid-cols-2'">
                    <button
                      v-for="option in formatOptions"
                      :key="option.value"
                      type="button"
                      class="h-10 rounded-btn border text-caption font-semibold transition-colors"
                      :class="
                        format === option.value
                          ? 'border-accent bg-accent text-on-accent'
                          : 'border-border bg-surface-2 text-fg-muted hover:text-fg'
                      "
                      :aria-pressed="format === option.value"
                      @click="format = option.value"
                    >
                      {{ option.label }}
                    </button>
                  </div>
                </fieldset>

                <div
                  v-else
                  class="mt-6 rounded-card border border-border bg-surface-2/60 p-4 text-caption text-fg-muted"
                >
                  <p class="font-semibold text-fg">{{ formatLabel }}</p>
                  <p class="mt-1">{{ selectedPlatform.hint }}</p>
                </div>
              </div>

              <div v-else>
                <h2 class="text-center text-card font-semibold">{{ t('download.stepConfirmTitle') }}</h2>
                <p class="mt-2 text-center text-caption text-fg-muted">{{ t('download.stepConfirmLead') }}</p>

                <dl class="mt-6 divide-y divide-divider rounded-card border border-border">
                  <div class="flex items-center justify-between gap-4 px-4 py-3">
                    <dt class="text-caption text-fg-subtle">{{ t('download.stepPlatform') }}</dt>
                    <dd class="text-caption font-semibold">{{ selectedPlatform.name }}</dd>
                  </div>
                  <div class="flex items-center justify-between gap-4 px-4 py-3">
                    <dt class="text-caption text-fg-subtle">{{ t('download.channelLabel') }}</dt>
                    <dd class="text-caption font-semibold">{{ channelLabel }}</dd>
                  </div>
                  <div class="flex items-center justify-between gap-4 px-4 py-3">
                    <dt class="text-caption text-fg-subtle">{{ t('download.formatLabel') }}</dt>
                    <dd class="text-caption font-semibold">{{ formatLabel }}</dd>
                  </div>
                  <div class="flex items-center justify-between gap-4 px-4 py-3">
                    <dt class="text-caption text-fg-subtle">{{ t('download.versionLabel') }}</dt>
                    <dd class="font-mono text-caption font-semibold">{{ release?.version ?? '—' }}</dd>
                  </div>
                </dl>

                <div class="mt-5">
                  <DownloadSourceSelect
                    :model-value="selectedSource"
                    :options="sourceOptions"
                    :label="t('download.sourceLabel')"
                    @update:model-value="setDownloadSource"
                  />
                  <p class="mt-2 text-micro leading-relaxed text-fg-subtle" aria-live="polite">
                    {{ selectedSourceDescription }}
                  </p>
                </div>

                <p v-if="status === 'error'" class="mt-4 text-micro text-fg-muted">
                  {{ t('download.error') }}
                  <button
                    type="button"
                    class="font-semibold text-accent underline underline-offset-4"
                    @click="refresh()"
                  >
                    {{ t('download.retry') }}
                  </button>
                </p>
                <p v-else-if="status === 'success' && !selectedLink" class="mt-4 text-micro text-fg-muted">
                  {{ t('download.unavailable') }}
                </p>
              </div>
            </Motion>
          </AnimatePresence>
        </div>

        <div class="mt-6 flex items-center justify-between gap-3 border-t border-divider pt-5">
          <BaseButton v-if="step > 0" variant="secondary" @click="back">
            <Icon name="lucide:arrow-left" class="size-4" />
            {{ t('download.back') }}
          </BaseButton>
          <span v-else aria-hidden="true" />

          <BaseButton v-if="!isLastStep" @click="next">
            {{ t('download.next') }}
            <Icon name="lucide:arrow-right" class="size-4" />
          </BaseButton>
          <BaseButton v-else @click="startDownload">
            {{ t('download.resultCta') }}
            <Icon name="lucide:arrow-right" class="size-4" />
          </BaseButton>
        </div>
      </div>
    </div>
  </div>
</template>

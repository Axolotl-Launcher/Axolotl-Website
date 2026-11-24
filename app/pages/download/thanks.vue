<script setup lang="ts">
import DownloadHelpModal from '~/components/download-help/DownloadHelpModal.vue'
import type { DownloadSource, DownloadSourceId, ReleaseChannel } from '~/utils/download-sources'
import { isDownloadSourceId } from '~/utils/download-sources'
import {
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
const config = useRuntimeConfig()

const ready = ref(false)
const selectionValid = ref(false)
const platform = ref<DownloadPlatform>('windows')
const format = ref<DownloadFormat>('installer')
const channel = ref<ReleaseChannel>('release')
const copied = ref(false)
const downloadHelp = useTemplateRef('downloadHelp')
const helpAvailable = ref(false)
let copyTimer: ReturnType<typeof setTimeout> | undefined
let downloadStarted = false

// The mirror named in the URL is what this visitor downloaded from; it is not
// necessarily their saved preference. Resolve against it without persisting it,
// so an automatic download leaves "automatic (fastest)" intact for next time.
const requestedSource = ref<DownloadSourceId | null>(null)
const { release, links, status, refresh } = useLauncherDownloads(channel, requestedSource)
const { selectedSource } = useDownloadSource()

const link = computed(() =>
  selectionValid.value ? (links.value[DOWNLOAD_LINK_KEY_BY_FORMAT[format.value]] ?? null) : null,
)

const fileName = computed(() => {
  if (!link.value) return ''
  const clean = link.value.split('?')[0] ?? ''
  const name = clean.slice(clean.lastIndexOf('/') + 1)
  try {
    return decodeURIComponent(name)
  } catch {
    return name
  }
})

const checksum = computed(() => release.value?.assets.find((asset) => asset.name === fileName.value)?.sha256 ?? '')

const version = computed(() => release.value?.version ?? '')

const platformName = computed(() => {
  const names: Record<DownloadPlatform, string> = {
    windows: t('download.windows'),
    mac: t('download.mac'),
    linux: t('download.linux'),
  }
  return names[platform.value]
})

const formatName = computed(() => {
  const names: Record<DownloadFormat, string> = {
    installer: t('download.formatInstaller'),
    portable: t('download.formatPortable'),
    dmg: t('download.formatDmg'),
    appimage: t('download.formatAppImage'),
    deb: t('download.formatDeb'),
    rpm: t('download.formatRpm'),
  }
  return names[format.value]
})

const installHint = computed(() => {
  if (format.value === 'portable') return t('download.portableHint')
  const hints: Record<DownloadPlatform, string> = {
    windows: t('download.windowsHint'),
    mac: t('download.macHint'),
    linux: t('download.linuxHint'),
  }
  return hints[platform.value]
})

const sourceName = computed(() => {
  const names: Record<DownloadSource, string> = {
    auto: t('download.sourceAuto'),
    'update-server': t('download.sourceUpdateServer'),
    github: t('download.sourceGithub'),
    gitlink: t('download.sourceGitlink'),
  }
  return names[requestedSource.value ?? selectedSource.value]
})

const alternativeLinks = computed(() => {
  if (platform.value !== 'linux') return []
  const entries = [
    { id: 'appimage', label: t('download.formatAppImage'), href: links.value.appImage },
    { id: 'deb', label: t('download.formatDeb'), href: links.value.deb },
    { id: 'rpm', label: t('download.formatRpm'), href: links.value.rpm },
  ]
  return entries
    .filter(
      (entry): entry is { id: string; label: string; href: string } => entry.id !== format.value && Boolean(entry.href),
    )
    .map((entry) => ({ ...entry, href: entry.href }))
})

const manualUrl = computed(() => `${config.public.githubUrl}/releases`)
const githubUrl = computed(() => config.public.githubUrl as string)

const backTo = computed(() => ({
  path: localePath({ path: '/download' }),
  query: {
    platform: platform.value,
    channel: channel.value,
    format: format.value,
    source: selectedSource.value,
  },
}))

/**
 * A reload or a back/forward trip recreates the component, so an in-memory
 * guard cannot stop it from starting the installer a second time. The document
 * load type tells those apart from a deliberate navigation: refreshing or
 * returning to this entry must not restart a large download, while arriving
 * from the download page — including a second time after changing options —
 * still starts it automatically, as arriving here is the visitor's confirmation.
 */
function isReloadOrHistoryRestore() {
  if (!import.meta.client) return false
  const [navigation] = performance.getEntriesByType('navigation') as PerformanceNavigationTiming[]
  return navigation?.type === 'reload' || navigation?.type === 'back_forward'
}

const steps = computed(() => [
  {
    icon: 'lucide:package-open',
    title: t('download.thanksInstallTitle'),
    body: t('download.thanksInstallBody'),
    to: localePath({ path: '/docs/installation' }),
  },
  {
    icon: 'lucide:box',
    title: t('download.thanksInstanceTitle'),
    body: t('download.thanksInstanceBody'),
    to: localePath({ path: '/docs/create-instance' }),
  },
  {
    icon: 'lucide:life-buoy',
    title: t('download.thanksHelpTitle'),
    body: t('download.thanksHelpBody'),
    to: localePath({ path: '/docs/faq' }),
  },
])

const downloadFrames: HTMLIFrameElement[] = []

function startDownloadFrame(url: string) {
  // A hidden frame keeps the attachment request alive while the SPA stays on
  // the thank-you page. Downloads only need the browser's download permission;
  // the frame never runs site code.
  const frame = document.createElement('iframe')
  frame.hidden = true
  frame.setAttribute('sandbox', 'allow-downloads')
  frame.setAttribute('referrerpolicy', 'no-referrer')
  frame.tabIndex = -1
  frame.src = url
  document.body.appendChild(frame)
  downloadFrames.push(frame)
}

function maybeStartDownload() {
  // Arriving here means the visitor confirmed a download, so start it without
  // asking again. The direct link stays available either way.
  if (!ready.value || !selectionValid.value || downloadStarted || !link.value) return
  // The link recomputes while the release loads, so the instance needs its own
  // one-shot guard on top of the reload check.
  if (isReloadOrHistoryRestore()) return
  downloadStarted = true
  startDownloadFrame(link.value)
  openDownloadHelp()
}

function openDownloadHelp() {
  if (platform.value !== 'windows' || !fileName.value) return
  helpAvailable.value = downloadHelp.value?.openForDownload(fileName.value, format.value === 'installer') ?? false
}

function goBack() {
  return navigateTo(backTo.value)
}

async function copyChecksum() {
  if (!checksum.value) return
  try {
    await navigator.clipboard.writeText(checksum.value)
    copied.value = true
    clearTimeout(copyTimer)
    copyTimer = setTimeout(() => {
      copied.value = false
    }, 1600)
  } catch {
    // Clipboard access can be denied; the checksum remains selectable.
  }
}

watch(link, () => maybeStartDownload())

onMounted(() => {
  const queryPlatform = route.query.platform
  const queryFormat = route.query.format

  if (
    !isDownloadPlatform(queryPlatform) ||
    !isDownloadFormat(queryFormat) ||
    !downloadFormatMatches(queryPlatform, queryFormat)
  ) {
    ready.value = true
    return
  }

  platform.value = queryPlatform
  format.value = queryFormat
  if (route.query.channel === 'beta' || route.query.channel === 'release') {
    channel.value = route.query.channel
  }
  // A concrete mirror names the download that already happened; `auto` carries
  // no mirror, so it keeps resolving through the stored preference.
  if (isDownloadSourceId(route.query.source)) requestedSource.value = route.query.source

  selectionValid.value = true
  ready.value = true
  maybeStartDownload()
})

onBeforeUnmount(() => {
  clearTimeout(copyTimer)
  for (const frame of downloadFrames) frame.remove()
  downloadFrames.length = 0
})

useSeoMeta({
  title: `${t('download.thanksTitle')}`,
  description: t('download.thanksLead'),
  robots: 'noindex',
})
</script>

<template>
  <div class="site-container py-10 sm:py-14">
    <div class="mx-auto max-w-[58rem]">
      <button
        type="button"
        class="inline-flex items-center gap-1.5 text-caption text-fg-muted transition-colors hover:text-fg"
        @click="goBack"
      >
        <Icon name="lucide:arrow-left" class="size-3.5" aria-hidden="true" />
        {{ t('download.resultBack') }}
      </button>

      <header class="mt-6 text-center">
        <span
          class="mx-auto grid size-14 place-items-center rounded-full"
          :class="
            ready
              ? selectionValid
                ? 'bg-success-soft text-success'
                : 'bg-danger-soft text-danger'
              : 'bg-accent/10 text-accent'
          "
        >
          <Icon
            :name="!ready ? 'lucide:package' : selectionValid ? 'lucide:check' : 'lucide:alert-triangle'"
            class="size-6"
            aria-hidden="true"
          />
        </span>
        <h1 class="mt-5 text-section text-balance">
          {{ ready && !selectionValid ? t('download.resultMissingTitle') : t('download.thanksTitle') }}
        </h1>
        <p v-if="!ready || selectionValid" class="mt-4 text-lead text-fg-muted">{{ t('download.thanksLead') }}</p>
      </header>

      <div
        v-if="ready && !selectionValid"
        class="mx-auto mt-8 max-w-[43.5rem] rounded-panel border border-border bg-surface-1 p-6 text-center"
      >
        <p class="text-body text-fg-muted">{{ t('download.resultMissing') }}</p>
        <BaseButton class="mt-5" :to="localePath({ path: '/download' })">
          {{ t('download.resultStartOver') }}
        </BaseButton>
      </div>

      <template v-else-if="ready && selectionValid">
        <div class="mx-auto mt-8 max-w-[43.5rem] rounded-panel border border-border bg-surface-1 p-5 text-left">
          <div class="flex items-center gap-3">
            <span class="grid size-10 shrink-0 place-items-center rounded-card bg-accent/10 text-accent">
              <Icon name="lucide:package" class="size-5" aria-hidden="true" />
            </span>
            <div class="min-w-0">
              <p class="truncate font-mono text-caption font-semibold">
                {{ fileName || t('download.thanksPreparing') }}
              </p>
              <p class="mt-0.5 text-micro text-fg-subtle">
                <template v-if="version">v{{ version }} · </template>{{ platformName }} · {{ formatName }}
              </p>
            </div>
          </div>
          <BaseButton v-if="link" :href="link" size="lg" block class="mt-4">
            <Icon name="lucide:download" class="size-4" aria-hidden="true" />
            {{ t('download.thanksDirect') }}
          </BaseButton>
          <p v-else-if="status === 'pending' || status === 'idle'" class="mt-4 text-caption text-fg-subtle">
            {{ t('download.thanksPreparing') }}
          </p>
          <p v-else-if="status === 'error'" class="mt-4 text-caption text-fg-muted">
            {{ t('download.error') }}
            <button
              type="button"
              class="font-semibold text-accent-strong underline underline-offset-4"
              @click="refresh()"
            >
              {{ t('download.retry') }}
            </button>
          </p>
          <button
            v-if="helpAvailable"
            type="button"
            class="mt-3 inline-flex items-center gap-1.5 text-caption font-semibold text-accent-strong underline underline-offset-4"
            aria-haspopup="dialog"
            @click="openDownloadHelp"
          >
            <Icon name="lucide:circle-help" class="size-4" aria-hidden="true" />
            {{ t('downloadHelp.reopen') }}
          </button>
        </div>

        <dl class="mx-auto mt-4 grid max-w-[43.5rem] gap-3 text-left sm:grid-cols-2">
          <div class="rounded-card border border-border p-3">
            <dt class="eyebrow text-fg-subtle">
              {{ t('download.resultChecksum') }}
            </dt>
            <dd class="mt-1.5 flex items-start gap-2">
              <code v-if="checksum" class="min-w-0 flex-1 font-mono text-micro break-all text-fg-muted">
                {{ checksum }}
              </code>
              <span v-else class="min-w-0 flex-1 text-caption text-fg-muted">
                {{ t('download.checksumUnavailable') }}
              </span>
              <button
                v-if="checksum"
                type="button"
                class="inline-flex shrink-0 items-center gap-1 text-caption font-semibold text-accent-strong"
                @click="copyChecksum"
              >
                <Icon :name="copied ? 'lucide:check' : 'lucide:copy'" class="size-3.5" aria-hidden="true" />
                {{ copied ? t('download.resultCopied') : t('download.resultCopy') }}
              </button>
            </dd>
          </div>
          <div class="rounded-card border border-border p-3">
            <dt class="eyebrow text-fg-subtle">
              {{ t('download.resultInstall') }}
            </dt>
            <dd class="mt-1.5 text-caption leading-relaxed text-fg-muted">{{ installHint }}</dd>
          </div>
        </dl>

        <div
          class="mx-auto mt-4 flex max-w-[43.5rem] flex-wrap items-center justify-between gap-3 border-t border-divider pt-4"
        >
          <div class="flex flex-wrap gap-x-4 gap-y-1">
            <a
              v-for="alternative in alternativeLinks"
              :key="alternative.id"
              :href="alternative.href"
              class="text-caption font-semibold text-accent-strong underline underline-offset-4"
            >
              {{ alternative.label }}
            </a>
          </div>
          <a
            :href="manualUrl"
            target="_blank"
            rel="noopener noreferrer"
            class="inline-flex items-center gap-1 text-caption text-fg-muted transition-colors hover:text-fg"
          >
            {{ t('download.manual') }}
            <Icon name="lucide:arrow-up-right" class="size-3.5" aria-hidden="true" />
          </a>
        </div>

        <p class="mt-3 text-center text-micro text-fg-subtle">{{ t('download.sourceLabel') }}: {{ sourceName }}</p>
      </template>

      <section class="mx-auto mt-14 max-w-[58rem]">
        <h2 class="text-center text-card font-semibold">{{ t('download.thanksNext') }}</h2>
        <div class="mt-5 grid gap-3 sm:grid-cols-3">
          <!--
            Cards stretch to the tallest sibling and push their own link to the
            bottom, so "Read the docs" sits in the same corner on every card
            instead of tracking the length of the description above it.
          -->
          <NuxtLink
            v-for="stepItem in steps"
            :key="stepItem.title"
            :to="stepItem.to"
            class="group flex flex-col rounded-card border border-border bg-surface-1 p-5 text-left transition-colors hover:border-border-strong"
          >
            <span class="grid size-9 place-items-center rounded-btn bg-accent/10 text-accent">
              <Icon :name="stepItem.icon" class="size-4" aria-hidden="true" />
            </span>
            <h3 class="mt-4 text-caption font-semibold">{{ stepItem.title }}</h3>
            <p class="mt-1 text-caption leading-relaxed text-fg-muted">{{ stepItem.body }}</p>
            <span class="mt-auto inline-flex items-center gap-1 pt-3 text-caption font-semibold text-accent-strong">
              {{ t('download.thanksDocs') }}
              <Icon
                name="lucide:arrow-right"
                class="size-3 transition-transform group-hover:translate-x-0.5"
                aria-hidden="true"
              />
            </span>
          </NuxtLink>
        </div>
      </section>

      <div class="mx-auto mt-10 flex max-w-[58rem] flex-wrap items-center justify-center gap-3">
        <BaseButton :to="localePath({ path: '/' })" variant="secondary">
          {{ t('nav.home') }}
        </BaseButton>
        <BaseButton :href="githubUrl" variant="secondary">
          <Icon name="lucide:github" class="size-4" aria-hidden="true" />
          {{ t('home.sections.openSource') }}
        </BaseButton>
      </div>
    </div>
    <DownloadHelpModal ref="downloadHelp" />
  </div>
</template>

<script setup lang="ts">
import type { DownloadSource, ReleaseChannel } from '~/utils/download-sources'

const { t } = useI18n()
const config = useRuntimeConfig()

const channel = ref<ReleaseChannel>('release')
const { release, links, status, refresh } = useLauncherDownloads(channel)
const { selectedSource, setDownloadSource, sources } = useDownloadSource()

type PlatformId = 'windows' | 'mac' | 'linux'
const recommended = ref<PlatformId | null>(null)

onMounted(() => {
  const ua = navigator.userAgent.toLowerCase()
  if (ua.includes('win')) recommended.value = 'windows'
  else if (ua.includes('mac')) recommended.value = 'mac'
  else if (ua.includes('linux')) recommended.value = 'linux'
})

const channels = computed<{ value: ReleaseChannel; label: string }[]>(() => [
  { value: 'release', label: t('download.release') },
  { value: 'beta', label: t('download.beta') },
])

const platforms = computed(() => [
  {
    id: 'windows' as const,
    icon: 'lucide:monitor',
    name: t('download.windows'),
    hint: t('download.windowsHint'),
    link: links.value.windows,
    action: t('download.installer'),
  },
  {
    id: 'mac' as const,
    icon: 'lucide:laptop',
    name: t('download.mac'),
    hint: t('download.macHint'),
    link: links.value.mac,
    action: t('download.installer'),
  },
  {
    id: 'linux' as const,
    icon: 'lucide:terminal-square',
    name: t('download.linux'),
    hint: t('download.linuxHint'),
    link: links.value.appImage,
    action: t('download.appImage'),
  },
])

const sourceOptions = computed(() => [
  { value: 'auto' as const, label: t('download.sourceAuto') },
  { value: 'update-server' as const, label: t('download.sourceUpdateServer') },
  { value: 'github' as const, label: t('download.sourceGithub') },
  { value: 'gitlink' as const, label: t('download.sourceGitlink') },
])

const versionText = computed(() => {
  if (status.value === 'pending' || status.value === 'idle') return t('download.loadingVersion')
  if (status.value === 'error') return t('download.error')
  return release.value ? t('download.latestVersion', { version: release.value.version }) : t('download.unavailable')
})

function actionText(link: string | null, label: string) {
  if (status.value === 'error' || (status.value === 'success' && !link)) return t('download.unavailable')
  if (status.value !== 'success') return t('download.loading')
  return label
}

function onSourceChange(event: Event) {
  const value = (event.target as HTMLSelectElement).value as DownloadSource
  setDownloadSource(value)
}

const actionClasses =
  'inline-flex h-11 items-center justify-center gap-2 rounded-btn bg-accent px-5 text-caption font-semibold text-on-accent shadow-[0_10px_30px_-12px_var(--accent-glow)] transition-colors hover:bg-accent-strong'

const pendingClasses =
  'inline-flex h-11 items-center justify-center gap-2 rounded-btn border border-border bg-surface-1 px-5 text-caption font-semibold text-fg-subtle'

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
    <header class="max-w-2xl">
      <p class="font-mono text-micro font-semibold tracking-[0.22em] text-accent uppercase">
        {{ t('download.eyebrow') }}
      </p>
      <h1 class="mt-4 text-section">{{ t('download.title') }}</h1>
      <p class="mt-4 text-lead text-fg-muted">{{ t('download.lead') }}</p>
    </header>

    <div class="mt-9 flex flex-wrap items-center gap-4">
      <div
        class="inline-flex rounded-btn border border-border bg-surface-1 p-1"
        role="group"
        :aria-label="t('download.channelLabel')"
      >
        <button
          v-for="option in channels"
          :key="option.value"
          type="button"
          class="rounded-[0.55rem] px-3.5 py-1.5 text-caption font-semibold transition-colors"
          :class="channel === option.value ? 'bg-accent text-on-accent' : 'text-fg-muted hover:text-fg'"
          :aria-pressed="channel === option.value"
          @click="channel = option.value"
        >
          {{ option.label }}
        </button>
      </div>
      <p class="text-caption text-fg-muted" aria-live="polite">{{ versionText }}</p>
      <button
        v-if="status === 'error'"
        type="button"
        class="text-caption font-semibold text-accent underline underline-offset-4"
        @click="refresh()"
      >
        {{ t('download.retry') }}
      </button>
    </div>

    <div class="mt-8 grid gap-4 lg:grid-cols-[minmax(0,1fr)_20rem] lg:items-start">
      <div class="space-y-3">
        <article
          v-for="platform in platforms"
          :key="platform.id"
          class="rounded-panel border bg-surface-1 p-6"
          :class="recommended === platform.id ? 'border-accent/40' : 'border-border'"
        >
          <div class="flex items-start gap-4">
            <span
              class="flex size-10 shrink-0 items-center justify-center rounded-card border border-border bg-surface-2"
            >
              <Icon :name="platform.icon" class="size-5 text-fg-muted" />
            </span>
            <div class="min-w-0 flex-1">
              <div class="flex flex-wrap items-center gap-2">
                <h2 class="text-card font-semibold">{{ platform.name }}</h2>
                <span
                  v-if="recommended === platform.id"
                  class="rounded-full bg-accent-soft px-2 py-0.5 font-mono text-micro font-semibold tracking-[0.12em] text-accent uppercase"
                >
                  {{ t('download.recommended') }}
                </span>
              </div>
              <p class="mt-1 text-caption text-fg-muted">{{ platform.hint }}</p>
            </div>
          </div>

          <div class="mt-5">
            <a
              v-if="platform.link && status === 'success'"
              :href="platform.link"
              :aria-label="`${platform.action} (${platform.name})`"
              target="_blank"
              rel="noopener noreferrer"
              :class="actionClasses"
            >
              <Icon name="lucide:download" class="size-4" />
              {{ platform.action }}
            </a>
            <span v-else :class="pendingClasses" :aria-busy="status === 'pending' || status === 'idle'">
              <Icon
                :name="
                  status === 'error' || (status === 'success' && !platform.link)
                    ? 'lucide:minus'
                    : 'lucide:loader-circle'
                "
                class="size-4"
                :class="{ 'animate-spin motion-reduce:animate-none': status === 'pending' || status === 'idle' }"
              />
              {{ actionText(platform.link, platform.action) }}
            </span>
          </div>

          <details
            v-if="platform.id === 'linux' && status === 'success' && (links.deb || links.rpm)"
            class="group mt-4"
          >
            <summary
              class="cursor-pointer list-none text-caption font-semibold text-fg-muted transition-colors hover:text-fg"
            >
              {{ t('download.otherPackages') }}
            </summary>
            <div class="mt-3 flex flex-wrap gap-2">
              <a
                v-if="links.deb"
                :href="links.deb"
                target="_blank"
                rel="noopener noreferrer"
                class="inline-flex h-9 items-center gap-1.5 rounded-btn border border-border bg-surface-2 px-3 text-caption font-medium transition-colors hover:border-border-strong"
              >
                <Icon name="lucide:package" class="size-3.5" />
                {{ t('download.deb') }}
              </a>
              <a
                v-if="links.rpm"
                :href="links.rpm"
                target="_blank"
                rel="noopener noreferrer"
                class="inline-flex h-9 items-center gap-1.5 rounded-btn border border-border bg-surface-2 px-3 text-caption font-medium transition-colors hover:border-border-strong"
              >
                <Icon name="lucide:package" class="size-3.5" />
                {{ t('download.rpm') }}
              </a>
            </div>
          </details>
        </article>
      </div>

      <aside class="space-y-4">
        <div class="rounded-panel border border-border bg-surface-1 p-5">
          <label for="download-source" class="text-caption font-semibold">{{ t('download.sourceLabel') }}</label>
          <select
            id="download-source"
            :value="selectedSource"
            class="mt-3 h-10 w-full rounded-btn border border-border bg-surface-2 px-3 text-caption text-fg"
            @change="onSourceChange"
          >
            <option v-for="option in sourceOptions" :key="option.value" :value="option.value">
              {{ option.label }}
            </option>
          </select>
          <p class="mt-3 text-micro leading-relaxed text-fg-subtle">
            {{ sources.find((source) => source.id === selectedSource)?.description }}
          </p>
        </div>

        <div class="rounded-panel border border-border bg-surface-1 p-5">
          <p class="text-caption leading-relaxed text-fg-muted">{{ t('download.checksum') }}</p>
          <a
            :href="`${config.public.githubUrl}/releases`"
            target="_blank"
            rel="noopener noreferrer"
            class="link-underline mt-4 inline-flex items-center gap-1.5 text-caption font-semibold text-accent"
          >
            {{ t('download.manual') }}
            <Icon name="lucide:arrow-up-right" class="size-3.5" />
          </a>
        </div>
      </aside>
    </div>
  </div>
</template>

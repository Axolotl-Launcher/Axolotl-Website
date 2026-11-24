import type { Ref } from 'vue'
import {
  getDownloadCatalogUrl,
  type DownloadSourceId,
  type LauncherRelease,
  normalizeDownloadCatalog,
  type ReleaseChannel,
} from '~/utils/download-sources'
import { resolveLauncherDownloads } from '~/utils/launcher-downloads'
import { useDownloadSource } from './useDownloadSource'

/**
 * `sourceOverride` resolves links against one concrete mirror without touching
 * the stored preference. The thank-you page uses it for the mirror the visitor
 * actually downloaded from, so an automatic download does not pin that mirror
 * as their future choice.
 */
export function useLauncherDownloads(channel: Ref<ReleaseChannel>, sourceOverride?: Ref<DownloadSourceId | null>) {
  const config = useRuntimeConfig()
  const endpoints = {
    updateServerUrl: config.public.updateServerUrl,
    updateArtifactUrl: config.public.updateArtifactUrl,
  }
  const { resolvedSource, sources } = useDownloadSource()
  const catalogUrl = computed(() => getDownloadCatalogUrl(channel.value, endpoints))

  useHead({
    link: [
      {
        key: 'launcher-download-catalog',
        rel: 'preload',
        as: 'fetch',
        href: catalogUrl.value,
        crossorigin: 'anonymous',
        fetchpriority: 'high',
      },
    ],
  })

  const { data, status, refresh } = useFetch<LauncherRelease | null>(catalogUrl, {
    server: false,
    timeout: 10000,
    retry: 1,
    retryDelay: 500,
    transform: (payload) => normalizeDownloadCatalog(payload, endpoints),
  })

  const release = computed(() => (status.value === 'success' ? data.value : null))
  const links = computed(
    () => resolveLauncherDownloads(release.value, sourceOverride?.value ?? resolvedSource.value.id, sources),
  )

  return { release, links, status, refresh, catalogUrl }
}

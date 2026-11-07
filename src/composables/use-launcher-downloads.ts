import type { Ref } from 'vue'

import {
    getDownloadCatalogUrl,
    type LauncherRelease,
    normalizeDownloadCatalog,
    type ReleaseChannel,
} from '../utils/download-sources.ts'
import { resolveLauncherDownloads } from '../utils/launcher-downloads.ts'
import { useDownloadSource } from './use-download-source.ts'

export function useLauncherDownloads(channel: Ref<ReleaseChannel>) {
    const config = useRuntimeConfig()
    const endpoints = {
        updateServerUrl: config.public.updateServerUrl,
        updateArtifactUrl: config.public.updateArtifactUrl,
    }
    const { resolvedSource, sources } = useDownloadSource()
    const catalogUrl = computed(() => getDownloadCatalogUrl(channel.value, endpoints))
    // Discover the initial request in HTML, before the deferred Nuxt entry hydrates.
    // Match fetch's CORS mode so the client request can consume the preload response.
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
    const links = computed(() =>
        resolveLauncherDownloads(release.value, resolvedSource.value.id, sources),
    )

    return { release, links, status, refresh }
}

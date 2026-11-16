import { useLocalStorage } from '@vueuse/core'
import type { DownloadSource } from '~/utils/download-sources'
import { createDownloadSources, getDownloadSource, isDownloadSource } from '~/utils/download-sources'

const DOWNLOAD_SOURCE_STORAGE_KEY = 'axolotl-download-source'

export function useDownloadSource() {
  const config = useRuntimeConfig()
  const sources = createDownloadSources({
    githubUrl: config.public.githubUrl,
    updateServerUrl: config.public.updateServerUrl,
    updateArtifactUrl: config.public.updateArtifactUrl,
    gitlinkReleasesUrl: config.public.gitlinkReleasesUrl,
  })

  const selectedSource = useState<DownloadSource>('axolotl-download-source', () => 'auto')
  const storedSource = useLocalStorage<DownloadSource | null>(DOWNLOAD_SOURCE_STORAGE_KEY, null)
  const resolvedSource = computed(() => getDownloadSource(selectedSource.value, sources))

  function setDownloadSource(source: DownloadSource) {
    selectedSource.value = source
    storedSource.value = source
  }

  onMounted(() => {
    if (isDownloadSource(storedSource.value)) selectedSource.value = storedSource.value
  })

  return { selectedSource, resolvedSource, setDownloadSource, sources }
}

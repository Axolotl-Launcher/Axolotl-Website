import { FALLBACK_PLATFORM, detectDesktopPlatform, type PlatformId } from '~/utils/platform'

export function useRecommendedPlatform() {
  const device = useDevice()
  const hydrated = ref(false)

  onMounted(() => {
    hydrated.value = true
  })

  const flags = computed(() => ({
    isWindows: device.isWindows,
    isMacOS: device.isMacOS,
    isLinux: device.isLinux,
    isMobileOrTablet: device.isMobileOrTablet,
    isCrawler: device.isCrawler,
  }))

  const detected = computed(() => (hydrated.value ? detectDesktopPlatform(flags.value) : null))
  const platform = computed<PlatformId>(() => detected.value ?? FALLBACK_PLATFORM)
  const isFallback = computed(() => hydrated.value && detected.value === null)

  return { platform, isFallback }
}

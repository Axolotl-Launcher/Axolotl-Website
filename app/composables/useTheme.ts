import { useLocalStorage, useMediaQuery } from '@vueuse/core'

export type ThemeMode = 'light' | 'dark' | 'oled' | 'system'
export type ResolvedTheme = 'light' | 'dark' | 'oled'

const STORAGE_KEY = 'axolotl-theme'
const MODES: ThemeMode[] = ['light', 'dark', 'oled', 'system']

export function useTheme() {
  const cookie = useCookie<ThemeMode>('axolotl-theme', {
    default: () => 'system',
    maxAge: 60 * 60 * 24 * 365,
    sameSite: 'lax',
  })
  const mode = useState<ThemeMode>('axolotl-theme', () => cookie.value ?? 'system')
  const storedMode = useLocalStorage<ThemeMode | null>(STORAGE_KEY, null)
  const prefersDark = useMediaQuery('(prefers-color-scheme: dark)')

  const resolved = computed<ResolvedTheme>(() => {
    if (mode.value !== 'system') return mode.value
    return prefersDark.value ? 'dark' : 'light'
  })

  const nextMode = computed<ThemeMode>(() => {
    const index = MODES.indexOf(mode.value)
    return MODES[(index + 1) % MODES.length] ?? 'system'
  })

  function applyDom(value: ResolvedTheme) {
    if (!import.meta.client) return
    document.documentElement.dataset.theme = value
    document.documentElement.classList.toggle('dark', value !== 'light')
    document.documentElement.classList.toggle('light', value === 'light')
    document.documentElement.style.colorScheme = value === 'light' ? 'light' : 'dark'
  }

  function setMode(next: ThemeMode) {
    mode.value = next
    cookie.value = next
    storedMode.value = next
    if (import.meta.client) {
      applyDom(next === 'system' ? (prefersDark.value ? 'dark' : 'light') : next)
    }
  }

  function cycle() {
    setMode(nextMode.value)
  }

  onMounted(() => {
    if (storedMode.value && MODES.includes(storedMode.value)) {
      mode.value = storedMode.value
    }
    applyDom(resolved.value)
  })

  watch(resolved, (value) => applyDom(value))

  return {
    mode: readonly(mode),
    resolved,
    nextMode,
    setMode,
    cycle,
  }
}

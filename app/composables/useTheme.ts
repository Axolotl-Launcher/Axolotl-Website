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
    document.documentElement.style.colorScheme = value === 'light' ? 'light' : 'dark'
  }

  function setMode(next: ThemeMode) {
    mode.value = next
    cookie.value = next
    if (import.meta.client) {
      localStorage.setItem(STORAGE_KEY, next)
      applyDom(next === 'system' ? (prefersDark.value ? 'dark' : 'light') : next)
    }
  }

  function cycle() {
    setMode(nextMode.value)
  }

  onMounted(() => {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored && MODES.includes(stored as ThemeMode)) {
      mode.value = stored as ThemeMode
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

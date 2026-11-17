/**
 * Studio persists its open state in localStorage. Opening the editor from an
 * edit link is intentional, but that state must not make every later hard
 * refresh open Studio (and navigate to the last edited document). Use a
 * one-shot marker for the edit link and leave Studio collapsed otherwise.
 */
const OPEN_STUDIO_KEY = 'axolotl:open-studio'

export default defineNuxtPlugin({
  name: 'axolotl-studio-active',
  enforce: 'pre',
  setup() {
    let current: Record<string, unknown>
    try {
      current = JSON.parse(localStorage.getItem('studio-active') || '{}') as Record<string, unknown>
    } catch {
      current = {}
    }

    if (sessionStorage.getItem(OPEN_STUDIO_KEY) === '1') {
      sessionStorage.removeItem(OPEN_STUDIO_KEY)
      localStorage.setItem('studio-active', JSON.stringify({ ...current, active: true, feature: 'content' }))
      return
    }

    if (current.active) {
      localStorage.setItem('studio-active', JSON.stringify({ ...current, active: false }))
    }
  },
})

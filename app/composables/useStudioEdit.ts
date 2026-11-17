/**
 * Link and click handler for the per-page Studio edit affordance.
 *
 * Studio is an overlay on the current page, not a standalone admin route. The
 * redirect query makes Studio return to the page after OAuth, and the persisted
 * `studio-active` state makes the editor open instead of showing its floating
 * launcher button.
 */
export function useStudioEdit() {
  const route = useRoute()

  const studioPath = computed(() => `/_studio?redirect=${encodeURIComponent(route.fullPath)}`)

  function prepareStudio(event: MouseEvent) {
    if (!import.meta.client) return
    localStorage.setItem('studio-active', JSON.stringify({ active: true, feature: 'content', fsPath: '/' }))

    const hasSession = document.cookie.split('; ').includes('studio-session-check=true')
    if (import.meta.dev || hasSession) {
      event.preventDefault()
      window.location.reload()
    }
  }

  return { studioPath, prepareStudio }
}

/**
 * Link and click handler for the per-page Studio edit affordance.
 *
 * Studio is an overlay on the current page. The
 * redirect query makes Studio return to the page after OAuth, and the persisted
 * `studio-active` state makes the editor open instead of showing its floating
 * launcher button.
 *
 * The affordance is only for maintainers: the prerendered HTML must not contain
 * a link into Studio, so `canEdit` stays false during prerender and is resolved
 * on the client after hydration.
 */
export function useStudioEdit() {
  const route = useRoute()
  const mounted = useMounted()
  const studioSession = useCookie('studio-session-check')

  const studioPath = computed(() => `/_studio?redirect=${encodeURIComponent(route.fullPath)}`)
  const canEdit = computed(() => mounted.value && (import.meta.dev || studioSession.value === 'true'))

  function prepareStudio(event: MouseEvent) {
    if (!import.meta.client || !canEdit.value) {
      event.preventDefault()
      return
    }
    // One-shot: only this explicit edit action may open Studio; a later F5
    // must leave the editor collapsed.
    sessionStorage.setItem('axolotl:open-studio', '1')
    localStorage.setItem('studio-active', JSON.stringify({ active: true, feature: 'content', fsPath: '/' }))

    if (import.meta.dev || studioSession.value === 'true') {
      event.preventDefault()
      window.location.reload()
    }
  }

  return { studioPath, prepareStudio, canEdit }
}

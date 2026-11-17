/**
 * Nuxt Studio 1.8.2 links route changes but not editor/preview scrolling.
 * This plugin maps the shared article headings and scrolls the other pane to
 * the matching section while Studio is open.
 */
interface LenisApp {
  $lenis?: {
    getLenis: () => { scrollTo: (target: number, options?: { immediate?: boolean }) => void } | null
  }
}

export default defineNuxtPlugin(() => {
  let editor: HTMLElement | null = null
  let scroller: HTMLElement | null = null
  let detach: (() => void) | undefined
  let lastPageSync = 0
  let lastEditorSync = 0
  let frame = 0

  function normalized(text: string | null | undefined) {
    return (text ?? '').replace(/\s+/g, ' ').trim().toLowerCase()
  }

  function active() {
    return document.body.hasAttribute('data-studio-active') && document.body.hasAttribute('data-expand-sidebar')
  }

  function findScroller(start: HTMLElement) {
    for (let node: HTMLElement | null = start; node; node = node.parentElement) {
      const style = getComputedStyle(node)
      if ((style.overflowY === 'auto' || style.overflowY === 'scroll') && node.scrollHeight > node.clientHeight) {
        return node
      }
    }
    return null
  }

  function headings(container: ParentNode) {
    return [...container.querySelectorAll<HTMLElement>('h1, h2, h3, h4, h5, h6')]
  }

  function sectionPairs() {
    if (!editor) return []
    const article = document.querySelector('main article')
    if (!article) return []

    const source = headings(editor).filter((heading) => !heading.closest('[contenteditable="false"]'))
    const target = headings(article)
    const pairs: { source: HTMLElement; target: HTMLElement }[] = []
    let targetIndex = 0

    for (const sourceHeading of source) {
      const text = normalized(sourceHeading.textContent)
      const match = target.findIndex(
        (targetHeading, index) => index >= targetIndex && normalized(targetHeading.textContent) === text,
      )
      const targetHeading = target[match]
      if (!targetHeading) continue
      pairs.push({ source: sourceHeading, target: targetHeading })
      targetIndex = match + 1
    }

    return pairs
  }

  function editorOffset(element: HTMLElement) {
    if (!scroller) return 0
    return element.getBoundingClientRect().top - scroller.getBoundingClientRect().top + scroller.scrollTop
  }

  function pageOffset(element: HTMLElement) {
    return element.getBoundingClientRect().top + window.scrollY
  }

  function pageMax() {
    return Math.max(0, document.documentElement.scrollHeight - window.innerHeight)
  }

  function editorMax() {
    return scroller ? Math.max(0, scroller.scrollHeight - scroller.clientHeight) : 0
  }

  function scrollPage(top: number) {
    const target = Math.max(0, Math.min(pageMax(), top))
    lastPageSync = Date.now()
    const lenis = (useNuxtApp() as unknown as LenisApp).$lenis?.getLenis()
    if (lenis) lenis.scrollTo(target, { immediate: true })
    else window.scrollTo(0, target)
  }

  function scrollEditor(top: number) {
    if (!scroller) return
    lastEditorSync = Date.now()
    scroller.scrollTop = Math.max(0, Math.min(editorMax(), top))
  }

  function editorToPage() {
    if (!active() || !editor || !scroller || Date.now() - lastEditorSync < 180) return
    if (frame) return
    frame = requestAnimationFrame(() => {
      frame = 0
      if (!active() || !scroller) return
      const pairs = sectionPairs()
      if (!pairs.length) {
        scrollPage((scroller.scrollTop / Math.max(1, editorMax())) * pageMax())
        return
      }
      const position = scroller.scrollTop + 24
      const current = pairs.filter((pair) => editorOffset(pair.source) <= position).at(-1)
      if (current) scrollPage(pageOffset(current.target) - 96)
      else scrollPage(0)
    })
  }

  function pageToEditor() {
    if (!active() || !editor || !scroller || Date.now() - lastPageSync < 180) return
    if (frame) return
    frame = requestAnimationFrame(() => {
      frame = 0
      if (!active() || !scroller) return
      const pairs = sectionPairs()
      if (!pairs.length) {
        scrollEditor((window.scrollY / Math.max(1, pageMax())) * editorMax())
        return
      }
      const position = window.scrollY + 120
      const current = pairs.filter((pair) => pageOffset(pair.target) <= position).at(-1)
      if (current) scrollEditor(editorOffset(current.source) - 20)
      else scrollEditor(0)
    })
  }

  function attach(root: ShadowRoot) {
    const prose = root.querySelector<HTMLElement>('.ProseMirror')
    const nextScroller = prose ? findScroller(prose) : null
    if (!prose || !nextScroller) return
    if (prose === editor && nextScroller === scroller) return

    detach?.()
    editor = prose
    scroller = nextScroller
    scroller.addEventListener('scroll', editorToPage, { passive: true })
    window.addEventListener('scroll', pageToEditor, { passive: true })
    detach = () => {
      scroller?.removeEventListener('scroll', editorToPage)
      window.removeEventListener('scroll', pageToEditor)
    }
  }

  // In development Studio uses its local filesystem provider. That provider
  // has no repository URL, but the breadcrumb action menu still renders an
  // "Open on Local" item that does nothing. Hide that dead action.
  function hideBrokenLocalAction(root: ShadowRoot) {
    for (const item of root.querySelectorAll<HTMLElement>('[role="menuitem"]')) {
      const text = item.textContent?.trim()
      if (text === '在 Local 打开' || text === 'Open on Local') item.hidden = true
    }
  }

  let observedRoot: ShadowRoot | undefined
  let shadowObserver: MutationObserver | undefined

  function scan() {
    const host = document.querySelector('nuxt-studio')
    const root = host?.shadowRoot
    if (!root) return
    hideBrokenLocalAction(root)
    if (root !== observedRoot) {
      shadowObserver?.disconnect()
      observedRoot = root
      shadowObserver = new MutationObserver(() => hideBrokenLocalAction(root))
      shadowObserver.observe(root, { childList: true, subtree: true })
    }
    attach(root)
  }

  scan()
  const timer = setInterval(scan, 1000)

  onBeforeUnmount(() => {
    clearInterval(timer)
    shadowObserver?.disconnect()
    detach?.()
    if (frame) cancelAnimationFrame(frame)
  })
})

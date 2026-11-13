import { onBeforeUnmount, onMounted, type Ref, ref } from 'vue'

import type { Rect } from './scene-engine'

/**
 * Measures the elements marked `data-target="name"` inside `root`, in root's own
 * pixels. Offsets are summed instead of read from the screen, so the camera, the
 * stage scale and running transitions do not affect the result. Scenes keep every
 * element they point at in the layout (hidden, not removed), so all of them can be
 * measured up front.
 */
export function useStageTargets(root: Ref<HTMLElement | null>) {
    const rects = ref<Record<string, Rect>>({})

    function offsetWithin(element: HTMLElement, container: HTMLElement) {
        let x = 0
        let y = 0
        let current: HTMLElement | null = element
        while (current && current !== container) {
            x += current.offsetLeft
            y += current.offsetTop
            current = current.offsetParent as HTMLElement | null
        }
        return { x, y }
    }

    function measure() {
        const container = root.value
        // Nothing has a layout yet while the dialog is still hidden.
        if (!container || container.offsetParent === null) return
        const next: Record<string, Rect> = {}
        container.querySelectorAll<HTMLElement>('[data-target]').forEach((element) => {
            const { x, y } = offsetWithin(element, container)
            next[element.dataset.target!] = {
                x,
                y,
                w: element.offsetWidth,
                h: element.offsetHeight,
            }
        })
        rects.value = next
    }

    let observer: ResizeObserver | undefined

    onMounted(() => {
        measure()
        document.fonts?.ready.then(measure)
        if (root.value) {
            observer = new ResizeObserver(() => measure())
            observer.observe(root.value)
        }
    })

    onBeforeUnmount(() => observer?.disconnect())

    return rects
}

/** The style that frames `rect` with the guide ring, `pad` px outside it. */
export function guideStyle(rect: Rect | undefined, opacity: number, pad = 3) {
    if (!rect || opacity <= 0) return { display: 'none' }
    return {
        left: `${rect.x - pad}px`,
        top: `${rect.y - pad}px`,
        width: `${rect.w + pad * 2}px`,
        height: `${rect.h + pad * 2}px`,
        opacity,
    }
}

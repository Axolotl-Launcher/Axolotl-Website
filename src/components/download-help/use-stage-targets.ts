import { onBeforeUnmount, onMounted, type Ref, ref } from 'vue'

export interface StageRect {
    x: number
    y: number
    w: number
    h: number
}

/**
 * Measures the elements marked `data-target="name"` inside `root`, in root's own
 * pixels, for drawings whose layout depends on wrapped text (a long file name, a
 * translation). Offsets are summed instead of read from the screen, so the stage
 * scale and running entrance animations do not affect the result.
 */
export function useStageTargets(root: Ref<HTMLElement | null>) {
    const rects = ref<Record<string, StageRect>>({})

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
        const next: Record<string, StageRect> = {}
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

/** Writes each rect's centre as `--name-cx` / `--name-cy` for use inside keyframes. */
export function centreVariables(rects: Record<string, StageRect>) {
    const variables: Record<string, string> = {}
    for (const [name, rect] of Object.entries(rects)) {
        variables[`--${name}-cx`] = `${Math.round(rect.x + rect.w / 2)}px`
        variables[`--${name}-cy`] = `${Math.round(rect.y + rect.h / 2)}px`
    }
    return variables
}

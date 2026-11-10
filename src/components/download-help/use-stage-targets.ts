import { onBeforeUnmount, onMounted, type Ref, ref } from 'vue'

export interface StageRect {
    x: number
    y: number
    w: number
    h: number
}

export interface StagePoint {
    x: number
    y: number
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

export function centreOf(rect: StageRect | undefined): StagePoint | undefined {
    return rect && { x: Math.round(rect.x + rect.w / 2), y: Math.round(rect.y + rect.h / 2) }
}

/** One stop on the pointer's path: where it is at these fractions of the step. */
export interface PointerStop {
    at: number | [number, number]
    to: StagePoint | undefined
    /** Drawn slightly smaller, as the button goes down. */
    press?: boolean
    /** Eases the move that leaves this stop. */
    ease?: boolean
    /** Hidden, as Windows hides the pointer while you type. */
    hidden?: boolean
}

const EASE = 'cubic-bezier(0.45, 0, 0.2, 1)'

/**
 * Writes the pointer's keyframes with plain numbers. Keyframes that read custom
 * properties are not updated by every browser once the animation has started, so
 * the measured positions are baked in instead. Returns no CSS until every stop is
 * known, so the pointer never starts from the corner.
 */
export function pointerKeyframes(name: string, stops: PointerStop[]) {
    if (stops.some((stop) => !stop.to)) return ''
    const frames = stops.map((stop) => {
        const at = (Array.isArray(stop.at) ? stop.at : [stop.at]).map(
            (t) => `${Math.round(t * 1000) / 10}%`,
        )
        const { x, y } = stop.to!
        const transform = `translate(${x}px, ${y}px)${stop.press ? ' scale(0.9)' : ''}`
        const easing = stop.ease ? ` animation-timing-function: ${EASE};` : ''
        return `${at.join(', ')} { transform: ${transform}; opacity: ${stop.hidden ? 0 : 1};${easing} }`
    })
    return `@keyframes ${name} { ${frames.join(' ')} }`
}

/** A press on `point`: arrive, go down, come back up. */
export function click(arrive: number, point: StagePoint | undefined): PointerStop[] {
    return [
        { at: arrive, to: point },
        { at: arrive + 0.025, to: point, press: true },
        { at: arrive + 0.05, to: point, ease: true },
    ]
}

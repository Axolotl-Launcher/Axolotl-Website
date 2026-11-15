/**
 * Draws a walkthrough as if it were recorded: every frame is computed from the
 * step's clock, the pointer moves like a hand, and hover and press states follow
 * from where the pointer is. The pointer model is the one the 《凌晨零点》 film uses
 * (Axolotl-Launcher/February-30, film/timeline.js), with times in milliseconds.
 */

export interface Point {
    x: number
    y: number
}

export interface Rect {
    x: number
    y: number
    w: number
    h: number
}

export const clamp = (value: number, min = 0, max = 1) => Math.min(max, Math.max(min, value))
export const lerp = (a: number, b: number, k: number) => a + (b - a) * k
/** Progress of `t` through `[a, b]`, clamped to 0…1. */
export const seg = (t: number, a: number, b: number) =>
    b <= a ? (t >= b ? 1 : 0) : clamp((t - a) / (b - a))
export const minJerk = (x: number) => x * x * x * (10 - 15 * x + 6 * x * x)
export const expoOut = (x: number) => (x >= 1 ? 1 : 1 - 2 ** (-10 * x))
export const cubicInOut = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - (-2 * x + 2) ** 3 / 2)

export function centre(rect: Rect | undefined): Point | undefined {
    return rect && { x: rect.x + rect.w / 2, y: rect.y + rect.h / 2 }
}

/** A point inside `rect`, at fractions of its width and height. */
export function inside(rect: Rect | undefined, fx = 0.5, fy = 0.5): Point | undefined {
    return rect && { x: rect.x + rect.w * fx, y: rect.y + rect.h * fy }
}

export function contains(rect: Rect | undefined, point: Point) {
    return (
        !!rect &&
        point.x >= rect.x &&
        point.x < rect.x + rect.w &&
        point.y >= rect.y &&
        point.y < rect.y + rect.h
    )
}

/** A small seeded generator, so every playback of a step moves the same way. */
export function rng(seed: number) {
    let a = seed >>> 0
    return () => {
        a = (a + 0x6d2b79f5) >>> 0
        let t = a
        t = Math.imul(t ^ (t >>> 15), t | 1)
        t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296
    }
}

export interface Move {
    t0: number
    t1: number
    to: Point
    /** How far the stroke bows away from the straight line, as a share of its length. */
    bow?: number
}

/**
 * The pointer's position over time. Each move is a fast primary stroke that lands
 * a little off target, then a small correction, on a slight arc with a faint
 * tremor; between moves the hand rests.
 */
export function pointerPath(start: Point, moves: Move[], seed = 1) {
    const plans = moves.map((move, index) => {
        const from = index ? moves[index - 1].to : start
        const random = rng(seed * 101 + index)
        const distance = Math.hypot(move.to.x - from.x, move.to.y - from.y)
        return {
            ...move,
            from,
            distance,
            along: clamp((random() * 0.15 - 0.05) * distance, -14, 22),
            across: clamp((random() - 0.5) * 0.05 * distance, -8, 8),
            phase: [random() * 6.3, random() * 6.3, random() * 6.3],
        }
    })

    return (t: number): Point => {
        let current = start
        for (const plan of plans) {
            if (t < plan.t0) return current
            if (t > plan.t1) {
                current = plan.to
                continue
            }
            const u = seg(t, plan.t0, plan.t1)
            const { from, to, distance } = plan
            const length = distance || 1
            const ux = (to.x - from.x) / length
            const uy = (to.y - from.y) / length
            const landX = to.x + ux * plan.along - uy * plan.across
            const landY = to.y + uy * plan.along + ux * plan.across
            const k1 = minJerk(Math.min(1, u / 0.74))
            const bow = Math.sin(Math.PI * k1) * (plan.bow ?? 0.06)
            let x = lerp(from.x, landX, k1) - (landY - from.y) * bow
            let y = lerp(from.y, landY, k1) + (landX - from.x) * bow
            const k2 = minJerk(seg(u, 0.7, 1))
            x += (to.x - landX) * k2
            y += (to.y - landY) * k2
            const seconds = t / 1000
            const tremor = Math.sin(Math.PI * u) * Math.min(1.2, distance / 300)
            x +=
                tremor *
                (Math.sin(seconds * 57 + plan.phase[0]) * 0.6 +
                    Math.sin(seconds * 83 + plan.phase[1]) * 0.35)
            y +=
                tremor *
                (Math.sin(seconds * 61 + plan.phase[2]) * 0.6 +
                    Math.sin(seconds * 79 + plan.phase[0]) * 0.35)
            return { x, y }
        }
        return current
    }
}

/** How long the button stays down before a click lands. */
export const PRESS_MS = 90

/** Whether the mouse button is down at `t`, for clicks that land (button up) at `clicks`. */
export function mouseDown(t: number, clicks: number[]) {
    return clicks.some((at) => t >= at - PRESS_MS && t < at)
}

/** The times at which each character of `text` appears, typed from `start`. */
export function keystrokes(text: string, start: number, seed = 7) {
    const random = rng(seed)
    const times: number[] = []
    let at = start
    for (let index = 0; index < text.length; index++) {
        times.push(at)
        const pause = random() < 0.12 ? 160 + random() * 140 : 0
        at += 55 + random() * 70 + pause
    }
    return times
}

export function typedLength(t: number, times: number[]) {
    let count = 0
    for (const at of times) if (t >= at) count++
    return count
}

/** Text carets blink every 530 ms. */
export function caretVisible(t: number, since: number) {
    return Math.floor((t - since) / 530) % 2 === 0
}

/** 0…1: a window or menu opening at `at`, as Windows 11 eases it. */
export function opening(t: number, at: number, duration = 250) {
    return expoOut(seg(t, at, at + duration))
}

/** 1…0: a window or menu closing at `at`. */
export function closing(t: number, at: number, duration = 140) {
    return 1 - seg(t, at, at + duration)
}

export interface Shot {
    at: number
    /** The top-left of the screen area in view. */
    x: number
    y: number
    scale: number
    /** How long the camera takes to get here. */
    duration?: number
}

/** Where the camera looks at `t`, gliding between shots like a screen recorder's zoom. */
export function cameraAt(t: number, shots: Shot[]) {
    let view = shots[0]
    for (let index = 1; index < shots.length; index++) {
        const shot = shots[index]
        const duration = shot.duration ?? 700
        if (t <= shot.at) break
        const k = cubicInOut(seg(t, shot.at, shot.at + duration))
        view = {
            at: shot.at,
            x: lerp(view.x, shot.x, k),
            y: lerp(view.y, shot.y, k),
            scale: lerp(view.scale, shot.scale, k),
        }
    }
    return view
}

/** The first of `names` whose rectangle holds `point`, in the order given (topmost first). */
export function hitTest(point: Point, names: string[], rects: Record<string, Rect>) {
    return names.find((name) => contains(rects[name], point))
}

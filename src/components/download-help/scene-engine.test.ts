import assert from 'node:assert/strict'
import { test } from 'node:test'

import {
    cameraAt,
    hitTest,
    keystrokes,
    mouseDown,
    pointerPath,
    PRESS_MS,
    typedLength,
} from './scene-engine.ts'

const start = { x: 100, y: 100 }
const target = { x: 400, y: 260 }
const path = pointerPath(start, [{ t0: 500, t1: 1100, to: target }], 3)

test('the pointer rests before a move and lands exactly on its target after it', () => {
    assert.deepEqual(path(0), start)
    assert.deepEqual(path(499), start)
    assert.deepEqual(path(1100), target)
    assert.deepEqual(path(5000), target)
})

test('the pointer travels between its start and target during a move', () => {
    const midway = path(800)
    assert(midway.x > start.x && midway.x < target.x + 30)
    assert(midway.y > start.y - 30 && midway.y < target.y + 30)
})

test('the same seed always plays the same path', () => {
    const again = pointerPath(start, [{ t0: 500, t1: 1100, to: target }], 3)
    assert.deepEqual(again(777), path(777))
})

test('the mouse button is down only just before each click lands', () => {
    assert(mouseDown(1000 - PRESS_MS, [1000]))
    assert(mouseDown(999, [1000]))
    assert(!mouseDown(1000, [1000]))
    assert(!mouseDown(1000 - PRESS_MS - 1, [1000]))
})

test('typing reveals one more character at each keystroke', () => {
    const times = keystrokes('abc', 200, 5)
    assert.equal(times.length, 3)
    assert.equal(times[0], 200)
    assert(times[1] > times[0] && times[2] > times[1])
    assert.equal(typedLength(199, times), 0)
    assert.equal(typedLength(times[1], times), 2)
    assert.equal(typedLength(times[2] + 1, times), 3)
})

test('the camera holds a shot, then glides to the next one', () => {
    const shots = [
        { at: 0, x: 0, y: 0, scale: 1 },
        { at: 1000, x: 200, y: 100, scale: 0.5, duration: 500 },
    ]
    assert.deepEqual(cameraAt(800, shots), shots[0])
    const gliding = cameraAt(1250, shots)
    assert(gliding.x > 0 && gliding.x < 200)
    assert.deepEqual(
        {
            x: cameraAt(2000, shots).x,
            y: cameraAt(2000, shots).y,
            scale: cameraAt(2000, shots).scale,
        },
        { x: 200, y: 100, scale: 0.5 },
    )
})

test('hit testing picks the first listed element under the pointer', () => {
    const rects = {
        menu: { x: 0, y: 0, w: 100, h: 100 },
        row: { x: 10, y: 10, w: 80, h: 20 },
    }
    assert.equal(hitTest({ x: 20, y: 15 }, ['row', 'menu'], rects), 'row')
    assert.equal(hitTest({ x: 20, y: 60 }, ['row', 'menu'], rects), 'menu')
    assert.equal(hitTest({ x: 200, y: 60 }, ['row', 'menu'], rects), undefined)
})

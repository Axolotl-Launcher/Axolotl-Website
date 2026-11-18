import { readFileSync } from 'node:fs'

import { describe, expect, it } from 'vitest'

/**
 * WCAG AA gates for the design tokens.
 *
 * The light theme is the default, so a subtle token drift silently breaks
 * readability for everyone. These assertions fail when a foreground/surface
 * pairing drops below 4.5:1, including the status roles that replaced
 * component-level emerald/sky/rose colours.
 */

const css = readFileSync(new URL('./themes.css', import.meta.url), 'utf8')

interface Theme {
  name: string
  values: Record<string, string>
}

function readTheme(name: string, selector: RegExp): Theme {
  const match = selector.exec(css)
  if (!match) throw new Error(`Missing theme block for ${name}`)
  const values: Record<string, string> = {}
  for (const [, key, value] of match[1]!.matchAll(/--([\w-]+):\s*([^;]+);/g)) {
    values[key!] = value!.trim()
  }
  return { name, values }
}

const themes = [
  readTheme('light', /:root,\s*\[data-theme='light'\]\s*\{([\s\S]*?)\n\}/),
  readTheme('dark', /\[data-theme='dark'\]\s*\{([\s\S]*?)\n\}/),
  readTheme('oled', /\[data-theme='oled'\]\s*\{([\s\S]*?)\n\}/),
]

function rgb(value: string): [number, number, number] {
  const match = /^#([\da-f]{6})$/i.exec(value)
  if (!match) throw new Error(`Expected a six-digit hex colour, got ${value}`)
  const hex = match[1]!
  return [0, 2, 4].map((offset) => Number.parseInt(hex.slice(offset, offset + 2), 16)) as [number, number, number]
}

function luminance(value: string): number {
  const [r, g, b] = rgb(value).map((channel) => {
    const normalized = channel / 255
    return normalized <= 0.03928 ? normalized / 12.92 : ((normalized + 0.055) / 1.055) ** 2.4
  }) as [number, number, number]
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

function contrast(foreground: string, background: string): number {
  const [lighter, darker] = [luminance(foreground), luminance(background)].sort((left, right) => right - left)
  return (lighter! + 0.05) / (darker! + 0.05)
}

/** Composite an accent/danger/success/info colour at `alpha` over a surface. */
function tint(foreground: string, background: string, alpha: number): string {
  const channels = rgb(foreground).map((channel, index) =>
    Math.round(channel * alpha + rgb(background)[index]! * (1 - alpha)),
  )
  return `#${channels.map((channel) => channel.toString(16).padStart(2, '0')).join('')}`
}

const surfaces = ['surface-0', 'surface-1', 'surface-2', 'surface-3', 'surface-4'] as const
const textRoles = ['fg', 'fg-muted', 'fg-subtle', 'accent-strong', 'danger', 'success', 'info'] as const

describe.each(themes)('$name theme contrast', ({ name, values }) => {
  it.each(textRoles)('%s meets AA on every surface', (role) => {
    for (const surface of surfaces) {
      expect(contrast(values[role]!, values[surface]!), `${role} on ${surface}`).toBeGreaterThanOrEqual(4.5)
    }
  })

  it('uses an AA fill pairing for primary buttons', () => {
    expect(contrast(values['on-accent']!, values.accent!)).toBeGreaterThanOrEqual(4.5)
  })

  it('keeps accent text readable on the soft selection background', () => {
    const alpha = name === 'light' ? 0.1 : name === 'dark' ? 0.14 : 0.16
    for (const surface of ['surface-0', 'surface-1', 'surface-2'] as const) {
      const background = tint(values.accent!, values[surface]!, alpha)
      expect(contrast(values['accent-strong']!, background), `accent-strong on ${surface}`).toBeGreaterThanOrEqual(4.5)
    }
  })

  it.each([
    ['danger', 'danger-soft'],
    ['success', 'success-soft'],
    ['info', 'info-soft'],
  ])('%s stays readable on its soft background', (role) => {
    for (const surface of ['surface-0', 'surface-1'] as const) {
      const background = tint(values[role]!, values[surface]!, name === 'light' ? 0.1 : 0.12)
      expect(contrast(values[role]!, background), `${role} on ${surface}`).toBeGreaterThanOrEqual(4.5)
    }
  })
})

import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'

import { describe, expect, it } from 'vitest'

/**
 * Studio's Markdown round-trip has, in practice, emitted escaped HTML entities
 * such as `\&#34;` into source files. They render as literal entity text in the
 * site and in frontmatter descriptions, so fail the test suite before they ship.
 */
const ESCAPED_ENTITY = /\\(?:&#\d+;|&#x[0-9a-f]+;|&(?:amp|lt|gt|quot|apos);)/i

function markdownFiles(directory: string): string[] {
  if (!existsSync(directory)) return []
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name)
    if (entry.isDirectory()) return markdownFiles(path)
    return entry.name.endsWith('.md') ? [path] : []
  })
}

describe('content hygiene', () => {
  it('recognizes escaped entities', () => {
    expect(ESCAPED_ENTITY.test(String.raw`\&#34;`)).toBe(true)
    expect(ESCAPED_ENTITY.test('“正常引号”')).toBe(false)
  })

  it('does not contain escaped HTML entities', () => {
    const offenders = ['content/docs', 'content/blog'].flatMap(markdownFiles).flatMap((file) =>
      readFileSync(file, 'utf8')
        .split(/\r?\n/)
        .map((line, index) => ({ file, line: index + 1, text: line }))
        .filter((entry) => ESCAPED_ENTITY.test(entry.text)),
    )

    expect(offenders).toEqual([])
  })
})

import { readdirSync, readFileSync } from 'node:fs'
import { dirname, extname, join, relative, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const javascriptExtensions = new Set(['.js', '.mjs', '.cjs', '.jsx'])
const ignoredDirectories = new Set([
  '.agents',
  '.git',
  '.nuxt',
  '.output',
  'coverage',
  'node_modules',
  'playwright-report',
  'public',
  'releases',
  'test-results',
])

function walk(directory: string): string[] {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    if (entry.isDirectory() && ignoredDirectories.has(entry.name)) return []
    const path = join(directory, entry.name)
    return entry.isDirectory() ? walk(path) : [path]
  })
}

const errors: string[] = []
const files = walk(root)

for (const file of files) {
  const relativePath = relative(root, file).replaceAll('\\', '/')

  if (javascriptExtensions.has(extname(file))) {
    errors.push(`${relativePath}: JavaScript source found; use TypeScript`)
    continue
  }

  if (file.endsWith('.vue')) {
    const scriptTag = /<script\b[^>]*>/i.exec(readFileSync(file, 'utf8'))?.[0]
    if (scriptTag && !/\blang\s*=\s*["']ts["']/.test(scriptTag)) {
      errors.push(`${relativePath}: <script> must declare lang="ts"`)
    }
  }
}

if (errors.length) {
  console.error('TypeScript enforcement failed:\n' + errors.map((error) => `  - ${error}`).join('\n'))
  process.exit(1)
}

console.log(`TypeScript check: ${files.length} files are TypeScript-only`)

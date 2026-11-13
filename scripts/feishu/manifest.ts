import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { dirname } from 'node:path'

import type { FeishuManifest, FeishuManifestDoc } from '../../shared/types/feishu'

export async function readManifest(path: string): Promise<FeishuManifest | undefined> {
  try {
    const raw = await readFile(path, 'utf8')
    return JSON.parse(raw) as FeishuManifest
  } catch {
    return undefined
  }
}

export async function writeManifest(path: string, manifest: FeishuManifest): Promise<boolean> {
  const next = `${JSON.stringify(manifest, null, 2)}\n`
  const previous = await readFile(path, 'utf8').catch(() => '')
  if (previous === next) return false
  await mkdir(dirname(path), { recursive: true })
  await writeFile(path, next, 'utf8')
  return true
}

export function sortManifestDocs(docs: FeishuManifestDoc[]): FeishuManifestDoc[] {
  return [...docs].sort((left, right) => left.order - right.order || left.slug.localeCompare(right.slug))
}

import { mkdir, writeFile } from 'node:fs/promises'
import { join } from 'node:path'

import pLimit from 'p-limit'
import sharp from 'sharp'

import type { FeishuClient } from './client'

const MAX_IMAGE_BYTES = 20 * 1024 * 1024
const IMAGE_WIDTH = 1600

export interface ImageDownloadResult {
  paths: Map<string, string>
  failures: Array<{ token: string; message: string }>
}

export async function downloadImages(
  client: FeishuClient,
  tokens: string[],
  destination: string,
  publicBase: string,
): Promise<ImageDownloadResult> {
  const paths = new Map<string, string>()
  const failures: Array<{ token: string; message: string }> = []
  if (!tokens.length) return { paths, failures }

  await mkdir(destination, { recursive: true })
  const limit = pLimit(3)

  await Promise.all(
    tokens.map((token) =>
      limit(async () => {
        try {
          const { buffer, contentType } = await client.downloadMedia(token)
          if (buffer.byteLength > MAX_IMAGE_BYTES) {
            throw new Error(`image is ${(buffer.byteLength / 1024 / 1024).toFixed(1)} MB, over the 20 MB limit`)
          }
          const { data, extension } = await optimizeImage(buffer, contentType)
          const filename = `${sanitizeToken(token)}.${extension}`
          await writeFile(join(destination, filename), data)
          paths.set(token, `${publicBase}/${filename}`)
        } catch (error) {
          failures.push({ token, message: error instanceof Error ? error.message : String(error) })
        }
      }),
    ),
  )

  return { paths, failures }
}

async function optimizeImage(buffer: Buffer, contentType: string): Promise<{ data: Buffer; extension: string }> {
  try {
    const data = await sharp(buffer)
      .rotate()
      .resize({ width: IMAGE_WIDTH, withoutEnlargement: true })
      .webp({ quality: 82, effort: 4 })
      .toBuffer()
    return { data, extension: 'webp' }
  } catch (error) {
    if (contentType.includes('svg')) {
      throw new Error('SVG images are not accepted from the knowledge base', { cause: error })
    }
    return { data: buffer, extension: extensionFor(contentType) }
  }
}

function extensionFor(contentType: string): string {
  if (contentType.includes('png')) return 'png'
  if (contentType.includes('jpeg') || contentType.includes('jpg')) return 'jpg'
  if (contentType.includes('gif')) return 'gif'
  if (contentType.includes('webp')) return 'webp'
  return 'bin'
}

function sanitizeToken(token: string): string {
  return token.replace(/[^A-Za-z0-9_-]/g, '')
}

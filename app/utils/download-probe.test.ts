import { describe, expect, it, vi } from 'vitest'
import {
  pickFastestSource,
  probeDownloadCandidate,
  probeDownloadSources,
  type DownloadCandidate,
} from './download-probe'

const candidates: DownloadCandidate[] = [
  { id: 'update-server', url: 'https://dist.example.com/file.exe' },
  { id: 'github', url: 'https://github.com/example/file.exe' },
  { id: 'gitlink', url: 'https://gitlink.example.com/file.exe' },
]

function fakeFetch(failures: readonly string[] = []): typeof fetch {
  return vi.fn(async (input: RequestInfo | URL) => {
    if (failures.includes(String(input))) throw new Error('network')
    return new Response(null, { status: 204 })
  }) as unknown as typeof fetch
}

function sequence(values: number[]): () => number {
  let index = 0
  return () => values[index++] ?? values.at(-1) ?? 0
}

describe('probeDownloadCandidate', () => {
  it('measures a healthy mirror', async () => {
    const result = await probeDownloadCandidate(candidates[0]!, {
      fetch: fakeFetch(),
      now: sequence([0, 120]),
    })
    expect(result).toEqual({ ...candidates[0], ok: true, latencyMs: 120 })
  })

  it('marks a network failure as unavailable', async () => {
    const result = await probeDownloadCandidate(candidates[1]!, {
      fetch: fakeFetch([candidates[1]!.url]),
      now: sequence([0]),
    })
    expect(result).toEqual({ ...candidates[1], ok: false, latencyMs: null })
  })
})

describe('probeDownloadSources', () => {
  it('orders healthy mirrors by latency', async () => {
    const results = await probeDownloadSources(candidates, {
      fetch: fakeFetch(),
      // Three starts, then the three measured completions in request order.
      now: sequence([0, 0, 0, 180, 90, 300]),
    })
    expect(results.map((result) => result.id)).toEqual(['github', 'update-server', 'gitlink'])
  })

  it('puts unavailable mirrors last', async () => {
    const results = await probeDownloadSources(candidates, {
      fetch: fakeFetch([candidates[0]!.url, candidates[2]!.url]),
      now: sequence([0, 0, 0, 150]),
    })
    expect(results.map((result) => [result.id, result.ok])).toEqual([
      ['github', true],
      ['update-server', false],
      ['gitlink', false],
    ])
  })
})

describe('pickFastestSource', () => {
  it('returns the first healthy source', () => {
    expect(
      pickFastestSource(
        [
          { ...candidates[0]!, ok: false, latencyMs: null },
          { ...candidates[1]!, ok: true, latencyMs: 80 },
        ],
        'update-server',
      ),
    ).toBe('github')
  })

  it('falls back when every mirror fails', () => {
    expect(
      pickFastestSource(
        candidates.map((candidate) => ({ ...candidate, ok: false, latencyMs: null })),
        'update-server',
      ),
    ).toBe('update-server')
  })
})

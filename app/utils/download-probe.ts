import type { DownloadSourceId } from './download-sources'

export interface DownloadCandidate {
  id: DownloadSourceId
  url: string
}

export interface DownloadProbeResult extends DownloadCandidate {
  ok: boolean
  latencyMs: number | null
}

export interface ProbeOptions {
  /** Per-candidate timeout. Slow mirrors are treated as unavailable. */
  timeoutMs?: number
  fetch?: typeof fetch
  now?: () => number
}

const DEFAULT_TIMEOUT_MS = 2000

/**
 * Measures the response latency of one mirror. A HEAD request keeps the probe
 * cheap; `no-cors` lets it run without asking every mirror for CORS headers.
 */
export async function probeDownloadCandidate(
  candidate: DownloadCandidate,
  options: ProbeOptions = {},
): Promise<DownloadProbeResult> {
  const fetchFn = options.fetch ?? fetch
  const now = options.now ?? (() => performance.now())
  const timeoutMs = options.timeoutMs ?? DEFAULT_TIMEOUT_MS
  const controller = new AbortController()
  const startedAt = now()
  const timer = setTimeout(() => controller.abort(), timeoutMs)

  try {
    await fetchFn(candidate.url, {
      method: 'HEAD',
      mode: 'no-cors',
      cache: 'no-store',
      redirect: 'follow',
      signal: controller.signal,
    })
    return { ...candidate, ok: true, latencyMs: Math.max(0, Math.round(now() - startedAt)) }
  } catch {
    return { ...candidate, ok: false, latencyMs: null }
  } finally {
    clearTimeout(timer)
  }
}

/**
 * Races every candidate in parallel, mirroring rabbito's approach without the
 * dependency: healthy mirrors first, ordered by measured latency.
 */
export async function probeDownloadSources(
  candidates: readonly DownloadCandidate[],
  options: ProbeOptions = {},
): Promise<DownloadProbeResult[]> {
  const results = await Promise.all(candidates.map((candidate) => probeDownloadCandidate(candidate, options)))
  return results.sort((a, b) => {
    if (a.ok !== b.ok) return a.ok ? -1 : 1
    return (a.latencyMs ?? Number.POSITIVE_INFINITY) - (b.latencyMs ?? Number.POSITIVE_INFINITY)
  })
}

/** Returns the fastest healthy source, or the preferred fallback when none respond. */
export function pickFastestSource(
  results: readonly DownloadProbeResult[],
  fallback: DownloadSourceId,
): DownloadSourceId {
  return results.find((result) => result.ok)?.id ?? fallback
}

import { loadRouteLocation, type Router } from 'vue-router'

import type { PreviewState } from './state'

const PRIMARY_ROUTES = [
    '/screenshots',
    '/browse/mod',
    '/skins',
    '/multiplayer/servers',
    '/library',
    '/lab',
]

/** Resolves when the page is idle, or after `timeout` at the latest. */
function idle(timeout: number) {
    return new Promise<void>((resolve) => {
        if (typeof window.requestIdleCallback === 'function') {
            window.requestIdleCallback(() => resolve(), { timeout })
        } else {
            window.setTimeout(resolve, 50)
        }
    })
}

/**
 * Warms up the rail destinations (their code and data) in the background, one per
 * idle period so the visitor's own clicks stay responsive. Each screen still loads
 * what it needs when opened before this reaches it.
 */
export async function preparePrimaryNavigation(
    router: Router,
    preview: PreviewState,
    signal: AbortSignal,
) {
    for (const path of PRIMARY_ROUTES) {
        await idle(2000)
        signal.throwIfAborted()
        await loadRouteLocation(router.resolve(path))
        if (path === '/browse/mod') {
            const { prepareDiscover } = await import('../screens/discover/state')
            await prepareDiscover(preview)
        } else if (path === '/multiplayer/servers') {
            const { refresh } = await import('../screens/multiplayer/composables/useServers')
            await refresh()
        }
    }
}

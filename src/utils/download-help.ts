/** Anything the download help dialog can limit to some browsers or systems. */
export interface UserAgentScoped {
    /**
     * Shown only when the visitor's User-Agent contains this text (case-sensitive),
     * such as `Edg` for Microsoft Edge or `Windows` for Windows. Leave it out to
     * show the item to everyone.
     */
    userAgent?: string
}

export function matchesUserAgent(item: UserAgentScoped, userAgent: string) {
    return !item.userAgent || userAgent.includes(item.userAgent)
}

export function filterByUserAgent<T extends UserAgentScoped>(
    items: readonly T[],
    userAgent: string,
) {
    return items.filter((item) => matchesUserAgent(item, userAgent))
}

/** The file name a download link saves as, for showing it in the walkthroughs. */
export function fileNameFromUrl(url: string | null | undefined) {
    if (!url) return null
    try {
        const name = new URL(url, 'https://localhost').pathname.split('/').pop()
        return name ? decodeURIComponent(name) : null
    } catch {
        return null
    }
}

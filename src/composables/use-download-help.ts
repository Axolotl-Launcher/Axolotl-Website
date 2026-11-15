import { fileNameFromUrl } from '~/utils/download-help'

interface DownloadHelpRequest {
    /** Increases on every request, so the same download clicked twice opens the dialog twice. */
    id: number
    /** Name of the file the visitor just started downloading, shown in the walkthroughs. */
    fileName: string | null
}

/**
 * Opens the download help dialog next to a download that has just started.
 *
 * Bind `openDownloadHelp(link)` to the click of every element that starts a
 * download. It does not cancel the click, so the browser still saves the file.
 */
export function useDownloadHelp() {
    const request = useState<DownloadHelpRequest>('download-help', () => ({
        id: 0,
        fileName: null,
    }))

    function openDownloadHelp(link?: string | null) {
        request.value = { id: request.value.id + 1, fileName: fileNameFromUrl(link) }
    }

    return { request, openDownloadHelp }
}

import { defineMessages, type MessageDescriptor } from '@modrinth/ui'
import { type Component, markRaw } from 'vue'

import type { UserAgentScoped } from '~/utils/download-help'

import EdgeKeepScene from './EdgeKeepScene.vue'
import VcRuntimeScene from './VcRuntimeScene.vue'

export interface DownloadHelpStep {
    /** May use `<strong>` for the thing to click and `<link>` for the question's link. */
    text: MessageDescriptor
    /** How long the step plays before the next one; the scene times itself to it. */
    durationMs?: number
}

export interface DownloadHelpQuestion extends UserAgentScoped {
    id: string
    /** The tab label, phrased as the problem the visitor sees. */
    question: MessageDescriptor
    /** Draws the walkthrough. It receives the 0-based `step` and the downloaded `fileName`. */
    scene: Component
    steps: DownloadHelpStep[]
    /** Where `<link>` in the step text points. */
    link?: string
}

export const DEFAULT_STEP_DURATION_MS = 5000

const messages = defineMessages({
    edgeQuestion: {
        id: 'axolotl-download-help.edge.question',
        defaultMessage: 'Edge says the file "isn\'t commonly downloaded"?',
    },
    edgeStep1: {
        id: 'axolotl-download-help.edge.step-1',
        defaultMessage:
            'Click <strong>···</strong> to the right of the download, then choose <strong>Keep</strong>.',
    },
    edgeStep2: {
        id: 'axolotl-download-help.edge.step-2',
        defaultMessage:
            'In the window that opens, click the <strong>arrow</strong> next to <strong>Delete</strong>.',
    },
    edgeStep3: {
        id: 'axolotl-download-help.edge.step-3',
        defaultMessage: 'Choose <strong>Keep anyway</strong>. The file is saved and ready to open.',
    },
    vcQuestion: {
        id: 'axolotl-download-help.vc.question',
        defaultMessage: 'Setup says VCRUNTIME140_1.dll was not found?',
    },
    vcStep1: {
        id: 'axolotl-download-help.vc.step-1',
        defaultMessage:
            'Download the Microsoft Visual C++ Redistributable from <link>aka.ms/vc14/vc_redist.x64.exe</link>.',
    },
    vcStep2: {
        id: 'axolotl-download-help.vc.step-2',
        defaultMessage:
            'Open <strong>vc_redist.x64.exe</strong>, tick <strong>I agree to the license terms and conditions</strong>, click <strong>Install</strong>, then <strong>Yes</strong> in User Account Control.',
    },
    vcStep3: {
        id: 'axolotl-download-help.vc.step-3',
        defaultMessage:
            'When it says <strong>Setup Successful</strong>, click <strong>Close</strong> and run the Axolotl Launcher installer again.',
    },
})

/**
 * Problems people commonly hit right after downloading, in tab order.
 *
 * Set `userAgent` to show a question only to visitors whose User-Agent contains
 * that text; leave it out to show it to everyone.
 */
export const DOWNLOAD_HELP_QUESTIONS: DownloadHelpQuestion[] = [
    {
        id: 'edge-uncommon-download',
        userAgent: 'Edg',
        question: messages.edgeQuestion,
        scene: markRaw(EdgeKeepScene),
        steps: [
            { text: messages.edgeStep1 },
            { text: messages.edgeStep2 },
            { text: messages.edgeStep3 },
        ],
    },
    {
        id: 'vcruntime-missing',
        userAgent: 'Windows',
        question: messages.vcQuestion,
        scene: markRaw(VcRuntimeScene),
        link: 'https://aka.ms/vc14/vc_redist.x64.exe',
        steps: [
            { text: messages.vcStep1, durationMs: 6000 },
            { text: messages.vcStep2, durationMs: 9000 },
            { text: messages.vcStep3, durationMs: 6000 },
        ],
    },
]

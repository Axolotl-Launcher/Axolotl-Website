import assert from 'node:assert/strict'
import { test } from 'node:test'

import { fileNameFromUrl, filterByUserAgent, matchesUserAgent } from './download-help.ts'

const EDGE_ON_WINDOWS =
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0'
const CHROME_ON_WINDOWS =
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36'
const SAFARI_ON_MAC =
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/19.0 Safari/605.1.15'

const questions = [
    { id: 'edge', userAgent: 'Edg' },
    { id: 'vc-runtime', userAgent: 'Windows' },
    { id: 'everyone' },
]

test('a question without a User-Agent filter is shown to everyone', () => {
    assert(matchesUserAgent({}, ''))
    assert(matchesUserAgent({ userAgent: '' }, SAFARI_ON_MAC))
})

test('questions are kept only when the User-Agent contains their text', () => {
    const ids = (userAgent: string) =>
        filterByUserAgent(questions, userAgent).map((question) => question.id)

    assert.deepEqual(ids(EDGE_ON_WINDOWS), ['edge', 'vc-runtime', 'everyone'])
    assert.deepEqual(ids(CHROME_ON_WINDOWS), ['vc-runtime', 'everyone'])
    assert.deepEqual(ids(SAFARI_ON_MAC), ['everyone'])
})

test('the match is case-sensitive, as the filter text is written', () => {
    assert(!matchesUserAgent({ userAgent: 'edg' }, EDGE_ON_WINDOWS))
})

test('the saved file name comes from the last path segment of the link', () => {
    assert.equal(
        fileNameFromUrl(
            'https://dist.test/dist/1.10.5/Axolotl_Launcher_1.10.5_x64_modern-setup.exe?download=1',
        ),
        'Axolotl_Launcher_1.10.5_x64_modern-setup.exe',
    )
    assert.equal(
        fileNameFromUrl('https://example.test/v1.0.0/Axolotl%20Launcher_1.0.0.dmg'),
        'Axolotl Launcher_1.0.0.dmg',
    )
    assert.equal(fileNameFromUrl(null), null)
    assert.equal(fileNameFromUrl('https://example.test/'), null)
})

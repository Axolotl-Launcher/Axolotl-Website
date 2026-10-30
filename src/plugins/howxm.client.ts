import { initHowxm } from 'howxm-js'

const HOWXM_APP_ID = '0b1c924f-5bca-4865-a52f-e3416fd26e46'

export default defineNuxtPlugin((nuxtApp) => {
    nuxtApp.hook('app:mounted', () => {
        // The feedback widget plays no part in the first screen: start it once the page has
        // loaded and the browser is idle, so it does not compete with the page's own requests.
        const start = () => {
            if (typeof window.requestIdleCallback === 'function') {
                window.requestIdleCallback(() => initHowxm(HOWXM_APP_ID), { timeout: 5000 })
            } else {
                window.setTimeout(() => initHowxm(HOWXM_APP_ID), 2000)
            }
        }
        if (document.readyState === 'complete') start()
        else window.addEventListener('load', start, { once: true })
    })
})

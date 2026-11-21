import type Lenis from 'lenis'

export default defineNuxtPlugin(() => {
  const nuxtApp = useNuxtApp()
  let lenis: Lenis | null = null

  // The nuxt-lenis component owns the instance; keep a reference so the
  // document height can be re-measured when a new page finishes rendering.
  nuxtApp.hook('lenis:initiated', (payload) => {
    lenis = payload.lenis
  })

  nuxtApp.hook('page:finish', () => {
    lenis?.resize()
  })
})

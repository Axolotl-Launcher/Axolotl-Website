/* eslint-disable @typescript-eslint/no-explicit-any */
import type Lenis from 'lenis'

// nuxt-lenis 3.0.0 does not ship its NuxtApp augmentation with the package
// entry, and typing `$lenis` precisely makes the module's own component fail
// vue-tsc. Keep the runtime contract loose and add the hook it emits.

declare module '#app' {
  interface NuxtApp {
    $lenis: any
  }
}

declare module 'nuxt/app' {
  interface NuxtApp {
    $lenis: any
  }

  interface RuntimeNuxtHooks {
    'lenis:initiated': (payload: { lenis: Lenis; id: string; isDefault: boolean }) => void
  }
}

export {}

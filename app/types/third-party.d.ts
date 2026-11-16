import type dayjs from 'dayjs'
import type { Props } from 'tippy.js'
import type { Swiper, SwiperSlide } from 'swiper/vue'
import type { Directive } from 'vue'

declare module '#app' {
  interface NuxtApp {
    $dayjs: typeof dayjs
  }
}

declare module 'nuxt/app' {
  interface NuxtApp {
    $dayjs: typeof dayjs
  }
}

declare module 'vue' {
  interface GlobalComponents {
    Swiper: typeof Swiper
    SwiperSlide: typeof SwiperSlide
  }

  interface GlobalDirectives {
    vTippy: Directive<HTMLElement, string | Partial<Props> | false | null | undefined>
  }
}

export {}

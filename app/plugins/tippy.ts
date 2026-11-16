import tippy, { type Instance, type Props } from 'tippy.js'

type TippyValue = string | Partial<Props> | false | null | undefined

function toProps(value: TippyValue): Partial<Props> {
  if (typeof value === 'string') return { content: value }
  if (value && typeof value === 'object') return value
  return {}
}

export default defineNuxtPlugin((nuxtApp) => {
  const instances = new WeakMap<HTMLElement, Instance>()

  function create(el: HTMLElement, value: TippyValue) {
    if (value === false) return
    instances.set(
      el,
      tippy(el, {
        theme: 'axolotl',
        animation: 'scale',
        placement: 'top',
        delay: [120, 0],
        duration: [180, 120],
        ...toProps(value),
      }),
    )
  }

  function destroy(el: HTMLElement) {
    instances.get(el)?.destroy()
    instances.delete(el)
  }

  nuxtApp.vueApp.directive<HTMLElement, TippyValue>('tippy', {
    mounted(el, binding) {
      create(el, binding.value)
    },
    updated(el, binding) {
      if (binding.value === false) {
        destroy(el)
        return
      }
      const instance = instances.get(el)
      if (!instance) {
        create(el, binding.value)
        return
      }
      instance.setProps(toProps(binding.value))
    },
    unmounted(el) {
      destroy(el)
    },
  })
})

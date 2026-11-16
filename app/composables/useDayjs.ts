import type { ConfigType } from 'dayjs'

import { dayjs } from '~/utils/dayjs'

export function useDayjs() {
  const { locale } = useI18n()
  const dayjsLocale = computed(() => (locale.value === 'en' ? 'en' : 'zh-cn'))

  function localize(value?: ConfigType) {
    return dayjs(value).locale(dayjsLocale.value)
  }

  return {
    dayjs: localize,
    dayjsLocale,
    format(value: ConfigType, template: string) {
      return localize(value).format(template)
    },
    fromNow(value: ConfigType) {
      return localize(value).fromNow()
    },
  }
}

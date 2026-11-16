import { dayjs } from '~/utils/dayjs'

export default defineNuxtPlugin(() => ({
  provide: { dayjs },
}))

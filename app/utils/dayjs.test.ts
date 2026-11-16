import { describe, expect, it } from 'vitest'

import { dayjs } from './dayjs'

describe('dayjs setup', () => {
  it('registers the localized format plugin for both site languages', () => {
    const date = '2026-11-16T12:00:00Z'

    expect(dayjs(date).locale('zh-cn').format('LL')).toBe('2026年11月16日')
    expect(dayjs(date).locale('en').format('LL')).toBe('November 16, 2026')
  })

  it('supports relative time', () => {
    expect(dayjs('2026-11-16').locale('en').from(dayjs('2026-11-14'))).toBe('in 2 days')
  })
})

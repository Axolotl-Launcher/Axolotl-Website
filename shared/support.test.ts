import { describe, expect, it } from 'vitest'
import { getSupportPlan, SUPPORT_PLANS } from './support'

describe('support plans', () => {
  it('builds Afdian checkout links instead of plan presentation links', () => {
    expect(SUPPORT_PLANS.coffee.url).toBe(
      'https://afdian.com/order/create?plan_id=f085a35e921111f191ac5254001e7c00&product_type=0',
    )
    expect(SUPPORT_PLANS.token.fallbackUrl).toBe(
      'https://ifdian.net/order/create?plan_id=19595244921211f1ac6452540025c377&product_type=0',
    )
  })

  it('keeps custom support on the creator page', () => {
    expect(SUPPORT_PLANS.custom.url).toBe('https://afdian.com/a/Mystic-Stars')
  })

  it('only resolves known plans', () => {
    expect(getSupportPlan('coffee')).toBe(SUPPORT_PLANS.coffee)
    expect(getSupportPlan('missing')).toBeNull()
    expect(getSupportPlan(undefined)).toBeNull()
  })
})

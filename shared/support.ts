export type SupportPlanId = 'coffee' | 'token' | 'custom'

export interface SupportPlanDefinition {
  id: SupportPlanId
  planId?: string
  url: string
  fallbackUrl: string
}

const creatorUrl = 'https://afdian.com/a/Mystic-Stars'
const creatorFallbackUrl = 'https://ifdian.net/a/Mystic-Stars'

function checkoutUrl(base: string, planId: string) {
  const query = new URLSearchParams({ plan_id: planId, product_type: '0' })
  return `${base}/order/create?${query}`
}

// Afdian plan IDs are not the post/album IDs used by the old `/p/` links.
// These are the current IDs returned by `/api/creator/get-plans` for the
// Mystic-Stars creator page.
const coffeePlanId = 'f085a35e921111f191ac5254001e7c00'
const tokenPlanId = '19595244921211f1ac6452540025c377'

export const SUPPORT_PLANS: Record<SupportPlanId, SupportPlanDefinition> = {
  coffee: {
    id: 'coffee',
    planId: coffeePlanId,
    url: checkoutUrl('https://afdian.com', coffeePlanId),
    fallbackUrl: checkoutUrl('https://ifdian.net', coffeePlanId),
  },
  token: {
    id: 'token',
    planId: tokenPlanId,
    url: checkoutUrl('https://afdian.com', tokenPlanId),
    fallbackUrl: checkoutUrl('https://ifdian.net', tokenPlanId),
  },
  custom: {
    id: 'custom',
    url: creatorUrl,
    fallbackUrl: creatorFallbackUrl,
  },
}

export function getSupportPlan(id: string | null | undefined): SupportPlanDefinition | null {
  if (!id || !Object.prototype.hasOwnProperty.call(SUPPORT_PLANS, id)) return null
  return SUPPORT_PLANS[id as SupportPlanId]
}

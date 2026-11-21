import { createHash } from 'node:crypto'

import { createError, defineEventHandler, getRouterParam, setHeader } from 'h3'
import { useRuntimeConfig } from 'nitropack/runtime'

import { getSupportPlan } from '#shared/support'

type Validation = 'skipped' | 'valid' | 'invalid' | 'unavailable'

async function validateAfdianPlan(planId: string, userId: string, token: string): Promise<Validation> {
  const params = JSON.stringify({ plan_id: planId })
  const ts = Math.floor(Date.now() / 1000).toString()
  const sign = createHash('md5').update(`${token}params${params}ts${ts}user_id${userId}`).digest('hex')

  try {
    const response = await fetch('https://afdian.com/api/open/query-plan', {
      method: 'POST',
      headers: { accept: 'application/json', 'content-type': 'application/json' },
      body: JSON.stringify({ user_id: userId, params, ts, sign }),
      signal: AbortSignal.timeout(5000),
    })
    if (!response.ok) return 'unavailable'

    const payload = (await response.json()) as { ec?: number | string }
    return Number(payload.ec) === 200 ? 'valid' : 'invalid'
  } catch {
    return 'unavailable'
  }
}

export default defineEventHandler(async (event) => {
  const planId = getRouterParam(event, 'plan')?.replace(/\.json$/, '')
  const plan = getSupportPlan(planId)
  if (!plan) {
    throw createError({ statusCode: 404, statusMessage: 'Unknown support plan' })
  }

  const config = useRuntimeConfig(event)
  let validation: Validation = 'skipped'

  if (plan.planId && config.afdian.userId && config.afdian.token) {
    validation = await validateAfdianPlan(plan.planId, config.afdian.userId, config.afdian.token)
    if (validation === 'invalid') {
      throw createError({ statusCode: 404, statusMessage: 'Support plan is not available' })
    }
  }

  setHeader(event, 'cache-control', 'public, max-age=300')
  return {
    id: plan.id,
    url: plan.url,
    fallbackUrl: plan.fallbackUrl,
    validated: validation === 'valid',
  }
})

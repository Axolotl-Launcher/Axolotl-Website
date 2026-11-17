import { defineEventHandler, getRouterParam, sendRedirect } from 'h3'

export default defineEventHandler((event) => {
  const slug = getRouterParam(event, 'slug') ?? ''
  return sendRedirect(event, `/en/blog/${encodeURIComponent(slug)}`, 301)
})

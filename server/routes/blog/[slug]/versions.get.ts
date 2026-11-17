import { defineEventHandler, getRouterParam, sendRedirect } from 'h3'

export default defineEventHandler((event) => {
  const slug = getRouterParam(event, 'slug') ?? ''
  return sendRedirect(event, `/blog/${encodeURIComponent(slug)}`, 301)
})

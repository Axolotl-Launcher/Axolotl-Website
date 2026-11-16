import { defineTransformer } from '@nuxt/content'
import { parseMarkdown } from '@nuxtjs/mdc/runtime'

// Nuxt Content ships a Markdown transformer for `.md` only. Local docs use
// `.mdx` so the repository keeps one explicit, future-proof extension; this
// transformer feeds those files through the same MDC parser.
export default defineTransformer({
  name: 'mdx',
  extensions: ['.mdx'],
  async parse(file, options = {}) {
    const parsed = await parseMarkdown(file.body, options, { fileOptions: file })
    return {
      ...parsed.data,
      excerpt: parsed.excerpt,
      body: { ...parsed.body, toc: parsed.toc },
      id: file.id,
      title: parsed.data?.title || undefined,
    }
  },
})

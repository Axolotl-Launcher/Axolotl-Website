import { defineCollection, defineContentConfig, property, z } from '@nuxt/content'

const locale = z.enum(['zh-CN', 'en-US'])

const common = {
  title: property(z.string()).editor({ label: 'Title' }),
  description: property(z.string()).editor({ input: 'textarea', label: 'Description' }),
  locale,
  updatedAt: z.string(),
  cover: property(z.string()).optional().editor({ input: 'media', label: 'Cover' }),
  tags: z.array(z.string()).default([]),
  authors: z.array(z.string()).default([]),
  draft: z.boolean().default(false),
  rawbody: z.string().optional(),
}

export default defineContentConfig({
  collections: {
    docs: defineCollection({
      type: 'page',
      source: 'docs/**/*.md',
      schema: z.object({
        ...common,
        slug: z.string(),
        group: z.string().default('Docs'),
        order: z.number().default(0),
      }),
    }),
    blog: defineCollection({
      type: 'page',
      // One Markdown file per post; history is Git, not timestamped copies.
      source: 'blog/**/*.md',
      schema: z.object({
        ...common,
        publishedAt: z.string(),
        sponsored: z.boolean().default(false),
      }),
    }),
  },
})

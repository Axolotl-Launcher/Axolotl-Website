import { defineCollection, defineContentConfig, z } from '@nuxt/content'

const locale = z.enum(['zh-CN', 'en-US'])

export default defineContentConfig({
  collections: {
    docs: defineCollection({
      type: 'page',
      source: { include: 'docs/**/*.md', prefix: '' },
      schema: z.object({
        locale,
        slug: z.string(),
        group: z.string().default('Docs'),
        order: z.number().default(0),
        description: z.string().default(''),
        updatedAt: z.string(),
        rawbody: z.string(),
      }),
    }),
    articles: defineCollection({
      type: 'page',
      source: { include: 'articles/**/*.md', prefix: '' },
      schema: z.object({
        locale,
        title: z.string(),
        description: z.string().default(''),
        publishedAt: z.string(),
        updatedAt: z.string().optional(),
        authors: z.array(z.string()).default([]),
        tags: z.array(z.string()).default([]),
        cover: z.string().optional(),
        draft: z.boolean().default(false),
      }),
    }),
  },
})

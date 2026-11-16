import { z } from 'zod'

/**
 * Frontmatter shared by documentation pages and articles. Blog versions are
 * indexed separately by `scripts/build-blog-index.ts`.
 */
export const contentFrontmatterSchema = z
  .object({
    title: z.string(),
    description: z.string().default(''),
    locale: z.enum(['zh-CN', 'en-US']),
    slug: z.string().optional(),
    group: z.string().optional(),
    order: z.number().optional(),
    updatedAt: z.string(),
    publishedAt: z.string().optional(),
    authors: z.array(z.string()).optional(),
    tags: z.array(z.string()).optional(),
    cover: z.string().optional(),
    draft: z.boolean().optional(),
  })
  .passthrough()

export type ContentFrontmatter = z.infer<typeof contentFrontmatterSchema>

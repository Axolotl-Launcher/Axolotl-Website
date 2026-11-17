export const BLOG_CONTENT_DIRECTORIES = {
  'zh-CN': 'zh-cn',
  'en-US': 'en-us',
} as const

export type BlogContentLocale = keyof typeof BLOG_CONTENT_DIRECTORIES

/** A canonical blog post. Previous revisions live in Git, not extra files. */
export interface BlogPost {
  id: string
  path: string
  stem: string
  slug: string
  locale: BlogContentLocale
  title: string
  description: string
  publishedAt: string
  updatedAt: string
  authors: string[]
  tags: string[]
  cover?: string | null
  draft: boolean
  sponsored: boolean
  rawbody?: string
}

export const BLOG_MAIN_AUTHOR = {
  name: 'Axolotl Team',
  avatar: '/axolotl.png',
  gender: 'team',
  title: '维护团队',
  signature: '保持免费、开源、无广告。',
  url: 'https://github.com/Axolotl-Launcher',
} as const

export const BLOG_LICENSE = {
  name: 'CC BY-SA 4.0',
  url: 'https://creativecommons.org/licenses/by-sa/4.0/',
  image: '/licenses/by-sa-4.0.png',
} as const

export function blogCoauthor(name: string) {
  return {
    name,
    avatar: '/axolotl.png',
    roleKey: 'blog.coAuthorRole',
  }
}

/** `blog/zh-cn/first-launch` -> `first-launch` */
export function blogSlug(stem: string) {
  return stem.split('/').filter(Boolean).at(-1) ?? ''
}

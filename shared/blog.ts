export interface BlogVersion {
  timestamp: number
  title: string
  description: string
  authors: string[]
  tags: string[]
  cover?: string | null
  body: string
  isUpdate: boolean
  sponsored: boolean
}

export interface BlogPost {
  slug: string
  locale: string
  versions: BlogVersion[]
}

export interface BlogVersionEntry extends BlogVersion {
  slug: string
  latest: boolean
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
  image: 'https://licensebuttons.net/l/by-sa/4.0/88x31.png',
} as const

export function blogCoauthor(name: string) {
  return {
    name,
    avatar: '/axolotl.png',
    roleKey: 'blog.coAuthorRole',
  }
}

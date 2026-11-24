import { existsSync, readFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'

import tailwindcss from '@tailwindcss/vite'

const themeInit = `(function(){try{var m=localStorage.getItem('axolotl-theme')||'system';var d=m==='dark'||(m==='system'&&window.matchMedia('(prefers-color-scheme: dark)').matches);var o=m==='oled';var t=o?'oled':d?'dark':'light';document.documentElement.dataset.theme=t;document.documentElement.classList.toggle('dark',d||o);document.documentElement.classList.toggle('light',!d&&!o);document.documentElement.style.colorScheme=(d||o)?'dark':'light'}catch(e){}})()`

/** The entry page of the launcher web demo build, or an empty string when none is installed. */
function launcherDemoEntry() {
  const directory = fileURLToPath(new URL('./public/launcher-demo', import.meta.url))
  const version = existsSync(directory)
    ? readdirSync(directory).find((name) => existsSync(join(directory, name, 'demo/index.html')))
    : undefined
  return version ? `/launcher-demo/${version}/demo/index.html` : ''
}

/** Public blog routes, one per canonical Markdown file. */
function blogPostRoutes() {
  const base = fileURLToPath(new URL('./content/blog', import.meta.url))
  if (!existsSync(base)) return []

  return (
    [
      ['zh-cn', '/blog'],
      ['en-us', '/en/blog'],
    ] as const
  ).flatMap(([directory, prefix]) => {
    const path = join(base, directory)
    if (!existsSync(path)) return []
    return readdirSync(path)
      .filter((name) => name.endsWith('.md'))
      .filter((name) => !/^draft:\s*true\s*$/m.test(readFileSync(join(path, name), 'utf8')))
      .map((name) => `${prefix}/${name.slice(0, -3)}`)
  })
}

export default defineNuxtConfig({
  compatibilityDate: '2026-11-13',
  // Opt into the Nuxt 5 behavior preview: Vite Environment API, case-sensitive
  // routing, normalized page names, client-side payload extraction and the
  // other v5 defaults documented in the upgrade guide.
  future: {
    compatibilityVersion: 5,
  },
  devtools: {
    enabled: true,
    componentInspector: true,
    vueDevTools: true,
    viteInspect: true,
    dataInspector: true,
    timeline: { enabled: true },
    mcp: 'auto',
  },

  // Nuxt 4.6.4 resolves an unset devServer.host to {} and the CLI then throws
  // `options.hostname.toLowerCase is not a function`. Pin the local host.
  devServer: {
    host: 'localhost',
  },

  modules: [
    '@nuxt/devtools',
    '@nuxtjs/device',
    '@nuxt/content',
    'nuxt-studio',
    '@nuxtjs/i18n',
    '@nuxtjs/seo',
    '@nuxt/image',
    '@nuxt/icon',
    'nuxt-qrcode',
    'nuxt-icons',
    'nuxt-lenis',
    'motion-v/nuxt',
    '@nuxt/eslint',
    '@vueuse/nuxt',
  ],

  css: ['lenis/dist/lenis.css', '~/assets/css/main.css'],

  alias: {
    '#shared': fileURLToPath(new URL('./shared', import.meta.url)),
  },

  vite: {
    plugins: [tailwindcss()],
    optimizeDeps: {
      // Vite discovers these on first use in development. Listing them keeps
      // the optimizer from re-bundling and reloading the page mid-session.
      include: [
        '@comark/vue',
        '@comark/vue/parse',
        '@comark/vue/plugins/shiki',
        '@comark/vue/plugins/toc',
        'minisearch',
        'nuxt > @nuxt/devtools > @vitejs/devtools-kit/client',
        'nuxt > @nuxt/devtools > error-stack-parser-es',
        'nuxt > @nuxt/devtools > vite-plugin-vue-devtools/client',
        'nuxt > @nuxt/devtools > vite-plugin-vue-tracer/client/overlay',
        'tailwind-merge',
        'verkit',
      ],
    },
  },

  app: {
    head: {
      meta: [
        { name: 'color-scheme', content: 'light dark' },
        { name: 'theme-color', content: '#ebebeb', media: '(prefers-color-scheme: light)' },
        { name: 'theme-color', content: '#101215', media: '(prefers-color-scheme: dark)' },
      ],
      link: [{ rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }],
      script: [{ innerHTML: themeInit, tagPosition: 'head' }],
    },
  },

  hooks: {
    // Nuxt Content derives page paths from the file location, which includes
    // the locale directory. Studio previews documents at their `path`, so map
    // those internal paths to the actual public routes.
    'content:file:afterParse'(ctx) {
      const content = ctx.content as Record<string, unknown>
      const stem = typeof content.stem === 'string' ? content.stem : ''
      const locale = typeof content.locale === 'string' ? content.locale : ''
      const [collection, directory, ...rest] = stem.split('/')
      const slug = rest.join('/')
      if (!slug || (directory !== 'zh-cn' && directory !== 'en-us')) return
      const prefix = locale === 'en-US' || directory === 'en-us' ? '/en' : ''
      if (collection === 'docs') content.path = `${prefix}/docs/${slug}`
      else if (collection === 'blog') content.path = `${prefix}/blog/${slug}`
    },
  },

  linkChecker: {
    failOnError: true,
    // Studio is served by Node and requires a session, so it is neither
    // prerendered nor inspectable during the static scan.
    excludeLinks: ['/_studio', '/_studio/**', '/__nuxt_studio/**'],
    excludePages: ['/_studio/**', '/__nuxt_studio/**'],
    report: { json: true, markdown: true },
  },

  studio: {
    route: '/_studio',
    repository: {
      provider: 'github',
      owner: 'Axolotl-Launcher',
      repo: 'Axolotl-Website',
      branch: 'main',
      private: true,
    },
    // Studio's own UI locale codes are its bundled editor locales, not the
    // site's content locales. It ships `zh`, not `zh-CN`; passing `zh-CN` makes
    // its lazy loader request a missing `../locales/zh-CN.json`.
    i18n: { defaultLocale: 'zh' },
    git: { commit: { messagePrefix: 'content:' } },
  },

  routeRules: {
    '/_studio': { ssr: true, headers: { 'X-Robots-Tag': 'noindex, nofollow' } },
    '/_studio/**': { ssr: true, headers: { 'X-Robots-Tag': 'noindex, nofollow' } },
    '/__nuxt_studio/**': { ssr: true, headers: { 'X-Robots-Tag': 'noindex, nofollow' } },
  },

  i18n: {
    strategy: 'prefix_except_default',
    defaultLocale: 'zh-CN',
    baseUrl: 'https://axlmc.org',
    locales: [
      { code: 'zh-CN', language: 'zh-CN', name: '简体中文', file: 'zh-CN.json' },
      { code: 'en', language: 'en-US', name: 'English', file: 'en-US.json' },
    ],
    detectBrowserLanguage: false,
    compilation: {
      strictMessage: false,
    },
  },

  image: {
    // ipxStatic only writes variants during prerendering. In dev nothing serves
    // `/_ipx/*`, so every NuxtImg request would 404; use the on-demand IPX server.
    provider: process.env.NODE_ENV === 'production' ? 'ipxStatic' : 'ipx',
    format: ['avif', 'webp'],
  },

  qrcode: {
    options: {
      variant: 'default',
      radius: 0,
      blackColor: '#101215',
      whiteColor: '#ffffff',
      disableNuxtUiIntegration: true,
    },
  },

  icon: {
    serverBundle: {
      collections: ['lucide'],
    },
    clientBundle: {
      scan: true,
      sizeLimitKb: 256,
    },
  },

  device: {
    // Static pages have no request user-agent during prerendering. Render the
    // Windows fallback first, then let the client detect the real OS after
    // hydration without changing the server-rendered markup.
    defaultUserAgent:
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
  },

  experimental: {
    viewTransition: true,
    renderJsonPayloads: true,
    appManifest: true,
  },

  typescript: {
    strict: true,
    typeCheck: false,
    shim: false,
  },

  runtimeConfig: {
    afdian: {
      userId: '',
      token: '',
    },
    public: {
      siteUrl: 'https://axlmc.org',
      githubUrl: 'https://github.com/Axolotl-Launcher/Axolotl',
      updateServerUrl: 'https://update.axlmc.org',
      updateArtifactUrl: 'https://dist.axlmc.org',
      gitlinkReleasesUrl: 'https://www.gitlink.org.cn/xinvxueyuan/Axolotl/releases/download',
      launcherDemo: launcherDemoEntry(),
      // Page-view analytics are opt-in: cloud.umami.is is unreachable from some
      // regions, so the default build ships without a third-party script. Point
      // these at a self-hosted instance (and set NUXT_PUBLIC_UMAMI_ENABLED=true)
      // to enable them.
      umami: {
        enabled: process.env.NUXT_PUBLIC_UMAMI_ENABLED === 'true',
        scriptUrl: process.env.NUXT_PUBLIC_UMAMI_SCRIPT_URL ?? 'https://cloud.umami.is/script.js',
        websiteId: process.env.NUXT_PUBLIC_UMAMI_WEBSITE_ID ?? '',
      },
    },
  },

  site: {
    url: 'https://axlmc.org',
    name: 'Axolotl Launcher',
    description: 'A modern Minecraft launcher for Windows, macOS and Linux.',
    defaultLocale: 'zh-CN',
    trailingSlash: false,
  },

  robots: {
    allow: '/',
    disallow: ['/api/', '/_studio', '/_studio/', '/__nuxt_studio/'],
  },

  sitemap: {
    autoLastmod: true,
    exclude: ['/api/**', '/_studio/**', '/__nuxt_studio/**'],
  },

  schemaOrg: {
    identity: {
      type: 'Organization',
      name: 'Axolotl Launcher',
      url: 'https://axlmc.org',
      logo: 'https://axlmc.org/axolotl.png',
    },
  },

  ogImage: {
    enabled: true,
    zeroRuntime: true,
    defaults: { width: 1200, height: 630, extension: 'png' },
  },

  seo: {
    automaticOgAndTwitterTags: true,
    automaticTwitterTags: true,
    metaDataFiles: true,
  },

  aiReady: {
    // Project instructions and agent skills stay private.
    agentSkills: false,
  },

  nitro: {
    // nuxt-studio imports these three helpers from Nuxt's virtual #imports.
    // Export only them explicitly; do not re-enable all Nitro auto-imports.
    imports: {
      imports: [
        { name: 'createError', from: 'h3' },
        { name: 'useRuntimeConfig', from: 'nitropack/runtime' },
        { name: 'useStorage', from: 'nitropack/runtime' },
      ],
    },
    prerender: {
      crawlLinks: true,
      failOnError: true,
      // Studio needs a live Nitro server and an authenticated request; it must
      // never be rendered into the static output.
      ignore: ['/_studio', '/_studio/**', '/__nuxt_studio/**'],
      routes: [
        '/',
        '/en',
        '/download',
        '/en/download',
        '/download/thanks',
        '/en/download/thanks',
        '/docs',
        '/en/docs',
        '/changelog',
        '/en/changelog',
        '/demo',
        '/en/demo',
        '/support',
        '/en/support',
        '/blog',
        '/en/blog',
        '/blog/terms',
        '/en/blog/terms',
        '/blog/privacy',
        '/en/blog/privacy',
        ...blogPostRoutes(),
        '/llms.txt',
        '/robots.txt',
        '/sitemap_index.xml',
        '/api/support/checkout/coffee.json',
        '/api/support/checkout/token.json',
        '/api/support/checkout/custom.json',
      ],
    },
  },
})

import { existsSync, readdirSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'

import tailwindcss from '@tailwindcss/vite'

const themeInit = `(function(){try{var m=localStorage.getItem('axolotl-theme')||'system';var d=m==='dark'||(m==='system'&&window.matchMedia('(prefers-color-scheme: dark)').matches);var o=m==='oled';var t=o?'oled':d?'dark':'light';document.documentElement.dataset.theme=t;document.documentElement.classList.toggle('dark',d||o);document.documentElement.classList.toggle('light',!d&&!o);document.documentElement.style.colorScheme=d?'dark':'light'}catch(e){}})()`

/** The entry page of the launcher web demo build, or an empty string when none is installed. */
function launcherDemoEntry() {
  const directory = fileURLToPath(new URL('./public/launcher-demo', import.meta.url))
  const version = existsSync(directory)
    ? readdirSync(directory).find((name) => existsSync(join(directory, name, 'demo/index.html')))
    : undefined
  return version ? `/launcher-demo/${version}/demo/index.html` : ''
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
    // Content already pulls MDC in as a module dependency; registering it
    // explicitly keeps the Markdown pipeline configurable and available to
    // pages directly (MDC, MDCRenderer, parseMarkdown).
    '@nuxtjs/mdc',
    '@nuxt/content',
    '@nuxtjs/i18n',
    '@nuxtjs/seo',
    '@nuxt/image',
    '@nuxt/icon',
    'nuxt-icons',
    'nuxt-lenis',
    'motion-v/nuxt',
    '@atoms-studio/nuxt-swiftsearch',
    '@nuxt/eslint',
    '@vueuse/nuxt',
  ],

  css: ['lenis/dist/lenis.css', '~/assets/css/main.css'],

  alias: {
    '#shared': fileURLToPath(new URL('./shared', import.meta.url)),
  },

  vite: {
    plugins: [tailwindcss()],
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

  content: {
    build: {
      markdown: {
        toc: { depth: 3, searchDepth: 3 },
      },
    },
  },

  linkChecker: {
    failOnError: true,
    report: { json: true, markdown: true },
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
    // @nuxtjs/i18n 10.6.0 imports `useRuntimeConfig` from Nitro's `#imports`.
    // Nuxt 5 turns Nitro auto-imports off by default; keep them on until i18n
    // stops relying on them.
    nitroAutoImports: true,
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
      // Search-only Algolia credentials are public by design. They are
      // injected at build time so the search page can SSR its first results.
      algolia: {
        appId: process.env.NUXT_PUBLIC_ALGOLIA_APP_ID ?? '',
        searchApiKey: process.env.NUXT_PUBLIC_ALGOLIA_SEARCH_API_KEY ?? '',
        indexName: process.env.NUXT_PUBLIC_ALGOLIA_INDEX_NAME ?? '',
      },
    },
  },

  site: {
    url: 'https://axlmc.org',
    name: 'Axolotl Launcher',
    description: 'A modern Minecraft launcher for Windows, macOS and Linux.',
    defaultLocale: 'zh-CN',
  },

  nitro: {
    preset: 'static',
    prerender: {
      crawlLinks: true,
      failOnError: true,
      routes: [
        '/',
        '/en',
        '/download',
        '/en/download',
        '/download/thanks',
        '/en/download/thanks',
        '/search',
        '/en/search',
        '/docs',
        '/en/docs',
        '/articles',
        '/en/articles',
        '/changelog',
        '/en/changelog',
        '/demo',
        '/en/demo',
        '/support',
        '/en/support',
        '/terms',
        '/en/terms',
        '/privacy',
        '/en/privacy',
        '/llms.txt',
        '/api/support/checkout/coffee.json',
        '/api/support/checkout/token.json',
        '/api/support/checkout/custom.json',
      ],
    },
  },
})

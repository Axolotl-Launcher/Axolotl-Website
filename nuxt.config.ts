import { realpathSync } from 'node:fs'
import { createRequire } from 'node:module'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

import type { Plugin } from 'vite'
import svgLoader from 'vite-svg-loader'

import { SUPPORTED_SITE_LOCALES } from './src/locales/site'

const UI_PUBLIC_ENTRY = fileURLToPath(new URL('./packages/ui/index.ts', import.meta.url))

/**
 * A prerendered page paints from its HTML and CSS alone, but Nuxt starts the app module
 * (~100 KB compressed, plus everything it imports) from `<head>`, where on slow
 * connections it competed with that first paint. The page now starts it once the
 * document is parsed and its first contentful paint is on screen (at the latest after
 * 3 s, or right away in a background tab, which paints nothing); hydration then
 * proceeds as before.
 */
function deferAppEntry(html: string) {
    const entry = html.match(/<script type="module" src="([^"]+)" crossorigin><\/script>/)
    if (!entry) return html
    const src = JSON.stringify(entry[1])
    const loader = `<script>(function(){var d=0;function l(){if(d)return;d=1;var s=document.createElement('script');s.type='module';s.crossOrigin='anonymous';s.src=${src};document.head.appendChild(s)}function g(){if(document.visibilityState==='hidden')return l();var P=window.PerformanceObserver,t=P&&P.supportedEntryTypes;if(t&&t.indexOf('paint')>=0){new P(function(list,o){if(list.getEntriesByName('first-contentful-paint').length){o.disconnect();setTimeout(l,0)}}).observe({type:'paint',buffered:true});setTimeout(l,3000)}else requestAnimationFrame(function(){setTimeout(l,0)})}if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',g);else g()})()</script>`
    return html
        .replace(entry[0], loader)
        .replace(/<link rel="modulepreload"[^>]*>/g, (link) =>
            link.includes(entry[1]) ? '' : link,
        )
}

/** The characters Inter's Latin subset keeps (Google Fonts' `latin` range plus a few symbols). */
const INTER_LATIN_RANGE =
    'U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+20AC, U+2122, U+2190-2193, U+2212, U+2215, U+2713, U+FEFF, U+FFFD'

/**
 * Serves the Inter weights `@modrinth/assets` loads from Modrinth's CDN (vendored
 * packages/assets/styles/inter.scss) as self-hosted Latin subsets in public/fonts/inter:
 * about 26 KB each instead of about 100 KB from a third-party origin. Chinese text never
 * used Inter's glyphs and still falls back to the system fonts.
 */
function selfHostedInter(): Plugin {
    return {
        name: 'axolotl:self-hosted-inter',
        // Runs after Sass has compiled the stylesheet that imports inter.scss.
        transform(code, id) {
            if (!/\/packages\/assets\/omorphia\.scss(\?|$)/.test(id)) return
            return code.replace(/@font-face\s*\{[^}]*\}/g, (rule) => {
                const file = rule.match(/fonts\/inter\/(Inter-\w+)\.woff2/)?.[1]
                const weight = rule.match(/font-weight:\s*(\d+)/)?.[1]
                if (!file || !weight) return rule
                return `@font-face{font-family:inter;font-style:normal;font-weight:${weight};font-display:swap;src:url(/fonts/inter/${file}.latin.woff2) format("woff2");unicode-range:${INTER_LATIN_RANGE}}`
            })
        },
    }
}

/**
 * The browser build of the vue-router Nuxt itself uses. packages/ui depends on its own
 * 4.x copy, and its composables (useRoute) read that copy's injection keys, so inside
 * the launcher preview, whose router comes from Nuxt's copy, they found no route.
 */
const NUXT_VUE_ROUTER = join(
    dirname(
        createRequire(
            join(
                realpathSync(fileURLToPath(new URL('./node_modules/nuxt', import.meta.url))),
                'package.json',
            ),
        ).resolve('vue-router'),
    ),
    'dist/vue-router.js',
)
const SITE_URL = 'https://axlmc.org'

export default defineNuxtConfig({
    srcDir: 'src/',
    devtools: { enabled: false },
    dir: {
        // Nuxt 4 resolves `dir.public` against the project root, while this site
        // keeps every source directory (including its static assets) under `src/`.
        public: 'src/public',
    },
    app: {
        head: {
            // Theme classes are applied by the pre-hydration script below. Keeping
            // them out of htmlAttrs prevents Nuxt from re-adding a stale class.
            htmlAttrs: {
                class: 'accent-pink',
                lang: 'zh-CN',
            },
            title: 'Axolotl Launcher - 免费开源的 Minecraft 启动器',
            // 在 body 渲染前同步应用已保存的主题偏好，避免浅色用户首屏闪深色
            script: [
                {
                    key: 'theme-init',
                    innerHTML: `(function(){try{var t=localStorage.getItem('axolotl-theme');var r=t;if(!r||r==='system'){r=(window.matchMedia&&window.matchMedia('(prefers-color-scheme: light)').matches)?'light':'dark'}var d=document.documentElement;d.classList.remove('light-mode','dark-mode','oled-mode');d.classList.add(r==='light'?'light-mode':r==='oled'?'oled-mode':'dark-mode');d.style.colorScheme=r==='light'?'light':'dark'}catch(e){}})()`,
                },
            ],
            link: [
                { rel: 'icon', type: 'image/png', href: '/axolotl.png' },
                { rel: 'apple-touch-icon', type: 'image/png', href: '/axolotl.png' },
            ],
        },
    },
    runtimeConfig: {
        public: {
            siteUrl: SITE_URL,
        },
    },
    experimental: {
        // Keep the app manifest disabled for the static website. Nuxt's runtime
        // composable still contains a server-side `#app-manifest` import, which
        // Vite tries to resolve during dev even when the feature is disabled.
        appManifest: false,
    },
    vite: {
        css: {
            preprocessorOptions: {
                scss: {
                    silenceDeprecations: ['import'],
                },
            },
        },
        resolve: {
            alias: [{ find: /^@modrinth\/ui$/, replacement: UI_PUBLIC_ENTRY }],
            dedupe: ['vue'],
        },
        plugins: [
            selfHostedInter(),
            svgLoader({
                svgoConfig: {
                    plugins: [
                        {
                            name: 'preset-default',
                            params: {
                                overrides: {
                                    removeViewBox: false,
                                    cleanupIds: { minify: false },
                                },
                            },
                        },
                    ],
                },
            }),
        ],
    },
    css: ['~/assets/styles/tailwind.css'],
    postcss: {
        plugins: {
            tailwindcss: {},
            autoprefixer: {},
        },
    },
    nitro: {
        prerender: {
            crawlLinks: false,
            routes: ['/', '/changelog', '/terms', '/privacy'],
        },
        hooks: {
            'prerender:generate'(route) {
                if (typeof route.contents === 'string' && route.fileName?.endsWith('.html')) {
                    route.contents = deferAppEntry(route.contents)
                }
            },
        },
    },
    routeRules: {
        '/': { static: true },
        '/changelog': { static: true },
        '/terms': { static: true },
        '/privacy': { static: true },
    },
    typescript: {
        shim: false,
        strict: true,
        typeCheck: false,
    },
    compatibilityDate: '2025-01-01',
    telemetry: false,
    hooks: {
        'vite:extendConfig'(config, { isClient }) {
            // Client only: server rendering keeps vue-router's Node entry.
            if (!isClient) return
            const resolve = (config.resolve ??= {})
            const alias = resolve.alias ?? []
            resolve.alias = [
                { find: /^vue-router$/, replacement: NUXT_VUE_ROUTER },
                ...(Array.isArray(alias)
                    ? alias
                    : Object.entries(alias).map(([find, replacement]) => ({ find, replacement }))),
            ]
        },
        'build:manifest'(manifest) {
            // The launcher preview loads only when a visitor opens it, so the page must
            // not prefetch its code, styles or images ahead of that: neither its own
            // modules nor what only it imports (three.js and the skin renderer reach the
            // page's graph as lazy exports of the @modrinth/ui barrel).
            const isPreview = (id: string) => id.includes('components/launcher-preview/')
            const staticClosure = (roots: string[]) => {
                const seen = new Set<string>()
                const visit = (id: string) => {
                    if (seen.has(id) || !manifest[id]) return
                    seen.add(id)
                    for (const dep of manifest[id].imports ?? []) visit(dep)
                }
                roots.forEach(visit)
                return seen
            }
            const ids = Object.keys(manifest)
            const site = staticClosure(
                ids.filter(
                    (id) =>
                        !isPreview(id) && (manifest[id].isEntry || /^(pages|layouts)\//.test(id)),
                ),
            )
            const previewOnly = [...staticClosure(ids.filter(isPreview))].filter(
                (id) => !site.has(id),
            )
            // The UI package bundles a catalog per language; the site renders only its own.
            const unusedLocales = ids.filter((id) => {
                const code = id.match(/packages\/ui\/src\/locales\/([^/]+)\/index\.json$/)?.[1]
                return code && !(SUPPORTED_SITE_LOCALES as readonly string[]).includes(code)
            })
            // Assets appear twice: under their source path and under their output file.
            const unprefetched = new Set(
                [...previewOnly, ...unusedLocales].map((id) => manifest[id].file),
            )
            for (const entry of Object.values(manifest)) {
                if (entry.dynamicImports) {
                    entry.dynamicImports = entry.dynamicImports.filter((dep) => !isPreview(dep))
                }
                if (unprefetched.has(entry.file)) entry.prefetch = false
                // The page first paints from its server-rendered HTML and CSS. Preloading
                // every module the app imports (~80 requests, ~500 KB) made that paint
                // wait behind them on slow connections; the entry now fetches its
                // imports itself once it runs.
                if (!entry.isEntry && entry.file.endsWith('.js')) entry.preload = false
            }
        },
    },
})

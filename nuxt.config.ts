import { realpathSync } from 'node:fs'
import { createRequire } from 'node:module'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

import svgLoader from 'vite-svg-loader'

const UI_PUBLIC_ENTRY = fileURLToPath(new URL('./packages/ui/index.ts', import.meta.url))

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
            // The hero loads the launcher preview itself, and the preview loads its other
            // screens only once the visitor interacts, so the page must not prefetch its
            // code, styles or images ahead of that: neither its own modules nor what only
            // it imports (three.js and the skin renderer reach the page's graph as lazy
            // exports of the @modrinth/ui barrel).
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
            // Assets appear twice: under their source path and under their output file.
            const previewFiles = new Set(previewOnly.map((id) => manifest[id].file))
            for (const entry of Object.values(manifest)) {
                if (entry.dynamicImports) {
                    entry.dynamicImports = entry.dynamicImports.filter((dep) => !isPreview(dep))
                }
                if (previewFiles.has(entry.file)) entry.prefetch = false
            }
        },
    },
})

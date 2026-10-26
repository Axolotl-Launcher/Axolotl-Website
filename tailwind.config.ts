import preset from '@modrinth/tooling-config/tailwind/tailwind-preset.ts'
import type { Config } from 'tailwindcss'

const config: Config = {
    content: [
        './src/components/**/*.{js,vue,ts}',
        './src/layouts/**/*.vue',
        './src/pages/**/*.vue',
        './src/plugins/**/*.{js,ts}',
        './src/app.vue',
        './src/error.vue',
        // Shared components and styles vendored under packages/
        './packages/**/*.{js,vue,ts}',
        '!./packages/**/node_modules/**',
    ],
    presets: [preset],
}

export default config

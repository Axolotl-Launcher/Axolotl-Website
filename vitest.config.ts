import { fileURLToPath } from 'node:url'

import { defineConfig } from 'vitest/config'

export default defineConfig({
  resolve: {
    alias: {
      '#shared': fileURLToPath(new URL('./shared', import.meta.url)),
    },
  },
  test: {
    environment: 'node',
    include: ['app/**/*.test.ts', 'scripts/**/*.test.ts', 'shared/**/*.test.ts'],
    coverage: {
      reporter: ['text', 'html'],
    },
  },
})

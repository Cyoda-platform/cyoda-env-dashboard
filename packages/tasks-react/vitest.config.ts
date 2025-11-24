import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['../../vitest.setup.ts'],
    css: true,
    testTimeout: 10000,
    hookTimeout: 10000,
    environmentOptions: {
      jsdom: {
        resources: 'usable',
      },
    },
  },
  resolve: {
    alias: {
      '@cyoda/http-api-react': resolve(__dirname, '../http-api-react/src/index.ts'),
      '@cyoda/ui-lib-react': resolve(__dirname, '../ui-lib-react/src/index.ts'),
    }
  }
})


import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.ts'],
    css: true,
    environmentOptions: {
      jsdom: {
        resources: 'usable',
      },
    },
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'dist/',
        '**/*.d.ts',
        '**/*.config.*',
        '**/mockData',
        'vitest.setup.ts',
        '**/e2e/**',
        '**/*.spec.ts'
      ]
    },
    exclude: [
      '**/node_modules/**',
      '**/dist/**',
      '**/e2e/**',
      '**/*.spec.ts'
    ]
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './packages/ui-lib-react/src'),
      '@cyoda/http-api-react': resolve(__dirname, './packages/http-api-react/src/index.ts'),
      '@cyoda/ui-lib-react': resolve(__dirname, './packages/ui-lib-react/src/index.ts'),
      '@cyoda/tasks-react': resolve(__dirname, './packages/tasks-react/src/index.ts'),
      '@cyoda/statemachine-react': resolve(__dirname, './packages/statemachine-react/src/index.ts'),
    }
  }
})


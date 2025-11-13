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
    testTimeout: 10000, // 10 seconds for async operations
    hookTimeout: 10000, // 10 seconds for setup/teardown hooks
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
      '@cyoda/http-api-react/api/entities': resolve(__dirname, './packages/http-api-react/src/api/entities.ts'),
      '@cyoda/http-api-react/api': resolve(__dirname, './packages/http-api-react/src/api'),
      '@cyoda/http-api-react/utils': resolve(__dirname, './packages/http-api-react/src/utils'),
      '@cyoda/http-api-react/stores/globalUiSettingsStore': resolve(__dirname, './packages/http-api-react/src/stores/globalUiSettingsStore.ts'),
      '@cyoda/http-api-react/stores': resolve(__dirname, './packages/http-api-react/src/stores'),
      '@cyoda/http-api-react': resolve(__dirname, './packages/http-api-react/src/index.ts'),
      '@cyoda/ui-lib-react': resolve(__dirname, './packages/ui-lib-react/src/index.ts'),
      '@cyoda/tasks-react': resolve(__dirname, './packages/tasks-react/src/index.ts'),
      '@cyoda/statemachine-react': resolve(__dirname, './packages/statemachine-react/src/index.ts'),
      '@cyoda/tableau-react': resolve(__dirname, './packages/tableau-react/src/index.ts'),
      'monaco-editor': resolve(__dirname, './vitest.monaco-mock.ts'),
    }
  }
})


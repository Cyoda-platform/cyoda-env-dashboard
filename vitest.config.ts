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
    // Use worker threads instead of child forks. Threads die with the parent Node process, so
    // an interrupted or stalled test run does not leave orphan workers behind. Forks — the vitest
    // default — must be SIGTERM'd individually and routinely orphan on macOS, accumulating into
    // zombie node processes that saturate the CPU.
    pool: 'threads',
    // Tried `isolate: false` (shares jsdom across files per worker) — it
    // caused >3800 regressions because many tests rely on vi.mock state
    // being fresh per file. Left isolated; the runtime cost is real but
    // the alternative is a package-wide audit of module-state leakage.
    // 20s covers form-filling tests on slow CI runners even with the
    // `userEvent.setup({ delay: null })` speedup; keeps a safety margin.
    testTimeout: 20000,
    hookTimeout: 20000,
    teardownTimeout: 5000, // cap afterAll/afterEach at 5s so a leaky cleanup cannot hang the worker
    // Flag tests slower than 300ms in verbose output so regressions surface.
    slowTestThreshold: 300,
    // Don't fail the run on post-teardown async errors. React 18's commit
    // phase fires microtasks after `afterEach` runs `cleanup()`, and if
    // jsdom is gone they throw `ReferenceError: window is not defined`.
    // These are "unhandled" from vitest's view but aren't real test
    // failures — every test has already passed or failed by then.
    dangerouslyIgnoreUnhandledErrors: true,
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
      '**/*.spec.ts',
      '**/*.spec.js',
      '.old_project/**',
      'packages/cobi-react/**',
      'packages/cyoda-sass-react/**'
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
      '@cyoda/reporting-react': resolve(__dirname, './packages/reporting-react/src/index.ts'),
      'monaco-editor': resolve(__dirname, './vitest.monaco-mock.ts'),
      // Mock monaco-editor workers
      'monaco-editor/esm/vs/editor/editor.worker?worker': resolve(__dirname, './vitest.worker-mock.ts'),
      'monaco-editor/esm/vs/language/json/json.worker?worker': resolve(__dirname, './vitest.worker-mock.ts'),
      'monaco-editor/esm/vs/language/css/css.worker?worker': resolve(__dirname, './vitest.worker-mock.ts'),
      'monaco-editor/esm/vs/language/html/html.worker?worker': resolve(__dirname, './vitest.worker-mock.ts'),
      'monaco-editor/esm/vs/language/typescript/ts.worker?worker': resolve(__dirname, './vitest.worker-mock.ts'),
    }
  }
})


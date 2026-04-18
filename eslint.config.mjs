import js from '@eslint/js'
import tseslint from 'typescript-eslint'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import globals from 'globals'

export default tseslint.config(
  {
    ignores: [
      '.old_project/**',
      'packages/cobi-react/**',
      'packages/cyoda-sass-react/**',
      'packages/cli/**',
      '**/dist/**',
      '**/coverage/**',
      '**/node_modules/**',
      '**/playwright-report/**',
      '**/.playwright-mcp/**',
      '**/.vite/**',
      '**/vite-env.d.ts',
      '**/*.{js,mjs,cjs,jsx}',
      'playwright.config.ts',
      'vitest.config.ts',
      'vitest.setup.ts',
      'vitest.monaco-mock.ts',
      'vitest.worker-mock.ts',
      'e2e/**',
    ],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: [
      'packages/http-api-react/**/*.{ts,tsx}',
      'packages/ui-lib-react/**/*.{ts,tsx}',
      'packages/tasks-react/**/*.{ts,tsx}',
      'packages/statemachine-react/**/*.{ts,tsx}',
      'packages/reporting-react/**/*.{ts,tsx}',
      'packages/source-configuration-react/**/*.{ts,tsx}',
      'packages/processing-manager-react/**/*.{ts,tsx}',
      'apps/saas-app/**/*.{ts,tsx}',
    ],
    languageOptions: { globals: { ...globals.browser } },
    plugins: { 'react-hooks': reactHooks, 'react-refresh': reactRefresh },
    rules: {
      ...reactHooks.configs.recommended.rules,
      'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
      'no-undef': 'off',
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
      'react-hooks/exhaustive-deps': 'warn',
    },
  },
)

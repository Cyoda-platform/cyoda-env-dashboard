import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'src/test/',
        '**/*.d.ts',
        '**/*.config.*',
        '**/mockData',
        'dist/',
      ],
    },
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
      '@cyoda/ui-lib-react': resolve(__dirname, '../ui-lib-react/src/index.ts'),
      '@cyoda/http-api-react/api/entities': resolve(__dirname, '../http-api-react/src/api/entities.ts'),
      '@cyoda/http-api-react/api': resolve(__dirname, '../http-api-react/src/api/index.ts'),
      '@cyoda/http-api-react/utils/HelperEntities': resolve(__dirname, '../http-api-react/src/utils/HelperEntities.ts'),
      '@cyoda/http-api-react/utils': resolve(__dirname, '../http-api-react/src/utils/index.ts'),
      '@cyoda/http-api-react/stores/globalUiSettingsStore': resolve(__dirname, '../http-api-react/src/stores/globalUiSettingsStore.ts'),
      '@cyoda/http-api-react/stores/entityViewerStore': resolve(__dirname, '../http-api-react/src/stores/entityViewerStore.ts'),
      '@cyoda/http-api-react/stores': resolve(__dirname, '../http-api-react/src/stores/index.ts'),
      '@cyoda/http-api-react': resolve(__dirname, '../http-api-react/src/index.ts'),
      'react-chartjs-2': resolve(__dirname, './src/__mocks__/react-chartjs-2.tsx'),
      'chart.js': resolve(__dirname, './src/__mocks__/chart.js.ts'),
      'chartjs-adapter-date-fns': resolve(__dirname, './src/__mocks__/chart.js.ts'),
      'monaco-editor': resolve(__dirname, './src/__mocks__/monaco-editor.ts'),
    },
  },
});


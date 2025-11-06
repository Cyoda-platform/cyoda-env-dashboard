import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3014,
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
      '@cyoda/http-api-react': resolve(__dirname, './src/__mocks__/@cyoda/http-api-react.ts'),
      '@cyoda/http-api-react/utils': resolve(__dirname, '../http-api-react/src/utils/index.ts'),
      '@cyoda/http-api-react/stores': resolve(__dirname, '../http-api-react/src/stores/index.ts'),
      '@cyoda/tableau-react': resolve(__dirname, './src/__mocks__/@cyoda/tableau-react.tsx'),
    },
  },
  define: {
    'global': 'globalThis',
  },
  optimizeDeps: {
    esbuildOptions: {
      define: {
        global: 'globalThis',
      },
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
  },
});


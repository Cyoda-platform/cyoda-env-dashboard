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
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
  },
});


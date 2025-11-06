import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3008,
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
      '@cyoda/ui-lib-react': resolve(__dirname, '../ui-lib-react/src/index.ts'),
      '@cyoda/http-api-react': resolve(__dirname, '../http-api-react/src/index.ts'),
    },
  },
  css: {
    preprocessorOptions: {
      scss: {
        api: 'modern-compiler',
      },
    },
  },
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'ProcessingManagerReact',
      formats: ['es', 'umd'],
      fileName: (format) => `processing-manager-react.${format}.js`,
    },
    rollupOptions: {
      external: ['react', 'react-dom', 'react-router-dom'],
      output: {
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM',
          'react-router-dom': 'ReactRouterDOM',
        },
      },
    },
  },
});


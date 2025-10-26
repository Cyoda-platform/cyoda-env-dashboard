import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  define: {
    'global': 'globalThis',
    'process.env': {},
  },
  optimizeDeps: {
    esbuildOptions: {
      define: {
        global: 'globalThis',
      },
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@cyoda/ui-lib-react': path.resolve(__dirname, '../../packages/ui-lib-react/src'),
      '@cyoda/http-api-react': path.resolve(__dirname, '../../packages/http-api-react/src'),
      '@cyoda/cyoda-sass-react': path.resolve(__dirname, '../../packages/cyoda-sass-react/src'),
      '@cyoda/tableau-react': path.resolve(__dirname, '../../packages/tableau-react/src'),
      '@cyoda/statemachine-react': path.resolve(__dirname, '../../packages/statemachine-react/src'),
      '@cyoda/tasks-react': path.resolve(__dirname, '../../packages/tasks-react/src'),
      '@cyoda/processing-manager-react': path.resolve(__dirname, '../../packages/processing-manager-react/src'),
    },
  },
  server: {
    port: 3000,
    proxy: {
      '/platform-api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
      '/platform-processing': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
      '/processing': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          'vendor-antd': ['antd', '@ant-design/icons'],
          'vendor-query': ['@tanstack/react-query', 'axios', 'zustand'],
        },
      },
    },
  },
  css: {
    preprocessorOptions: {
      scss: {
        api: 'modern-compiler',
      },
    },
  },
});


import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file from the workspace root (two levels up from this config file)
  const envDir = path.resolve(__dirname, '../..');
  const env = loadEnv(mode, envDir, '');

  // Fail fast if required environment variables are not set
  if (!env.VITE_APP_BASE_URL) {
    throw new Error('VITE_APP_BASE_URL is not set in .env file. Please configure your environment variables.');
  }

  const backendTarget = env.VITE_APP_BASE_URL;
  // For proxy: if VITE_APP_API_BASE is relative (/ or empty), use backendTarget + /api
  // For direct: if VITE_APP_API_BASE is absolute URL, use it as-is
  const apiTarget = (env.VITE_APP_API_BASE === '/' || !env.VITE_APP_API_BASE)
    ? `${backendTarget}/api`
    : env.VITE_APP_API_BASE;

  return {
  plugins: [react()],
  define: {
    'global': 'globalThis',
    'process.env': {},
  },
  optimizeDeps: {
    // Exclude local packages from pre-bundling to enable HMR for SCSS
    exclude: [
      '@cyoda/ui-lib-react',
      '@cyoda/http-api-react',
      '@cyoda/cyoda-sass-react',
      '@cyoda/tableau-react',
      '@cyoda/statemachine-react',
      '@cyoda/tasks-react',
      '@cyoda/processing-manager-react',
    ],
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
    watch: {
      // Watch files in linked packages for changes
      ignored: ['!**/node_modules/@cyoda/**'],
    },
    proxy: {
      // Proxy all /auth requests to backend API
      '/auth': {
        target: apiTarget,
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/auth/, '/auth'),
        configure: (proxy, options) => {
          proxy.on('error', (err, req, res) => {
            console.log('Proxy error:', err.message);
          });
          proxy.on('proxyReq', (proxyReq, req, res) => {
            console.log('Proxying:', req.method, req.url, '→', options.target + req.url);
          });
          proxy.on('proxyRes', (proxyRes, req, res) => {
            console.log('Response:', proxyRes.statusCode, req.method, req.url);
          });
        },
      },
      // Proxy all /platform-processing requests to real Cyoda backend server
      // This must come BEFORE /api to match more specific paths first
      '/platform-processing': {
        target: apiTarget,
        changeOrigin: true,
        secure: false,
        configure: (proxy, options) => {
          proxy.on('error', (err, req, res) => {
            console.log('Proxy error:', err.message);
          });
          proxy.on('proxyReq', (proxyReq, req, res) => {
            console.log('Proxying:', req.method, req.url, '→', options.target + req.url);
          });
          proxy.on('proxyRes', (proxyRes, req, res) => {
            console.log('Response:', proxyRes.statusCode, req.method, req.url);
          });
        },
      },
      // Proxy all /platform-common requests to real Cyoda backend server
      '/platform-common': {
        target: apiTarget,
        changeOrigin: true,
        secure: false,
        configure: (proxy, options) => {
          proxy.on('error', (err, req, res) => {
            console.log('Proxy error:', err.message);
          });
          proxy.on('proxyReq', (proxyReq, req, res) => {
            console.log('Proxying:', req.method, req.url, '→', options.target + req.url);
          });
          proxy.on('proxyRes', (proxyRes, req, res) => {
            console.log('Response:', proxyRes.statusCode, req.method, req.url);
          });
        },
      },
      // Proxy all /api requests to real Cyoda backend server
      '/api': {
        target: backendTarget,
        changeOrigin: true,
        secure: false,
        configure: (proxy, options) => {
          proxy.on('error', (err, req, res) => {
            console.log('Proxy error:', err.message);
          });
          proxy.on('proxyReq', (proxyReq, req, res) => {
            console.log('Proxying:', req.method, req.url, '→', options.target + req.url);
          });
          proxy.on('proxyRes', (proxyRes, req, res) => {
            console.log('Response:', proxyRes.statusCode, req.method, req.url);
          });
        },
      },
      // Proxy all /platform-api requests to real Cyoda backend server
      '/platform-api': {
        target: backendTarget,
        changeOrigin: true,
        secure: false,
        configure: (proxy, options) => {
          proxy.on('error', (err, req, res) => {
            console.log('Proxy error:', err.message);
          });
          proxy.on('proxyReq', (proxyReq, req, res) => {
            console.log('Proxying:', req.method, req.url, '→', options.target + req.url);
          });
          proxy.on('proxyRes', (proxyRes, req, res) => {
            console.log('Response:', proxyRes.statusCode, req.method, req.url);
          });
        },
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
  };
});


import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'
import HelperVersions from "@cyoda/ui-lib/src/helpers/HelperVersions";
import HelperBuilder from "@cyoda/ui-lib/src/helpers/HelperBuilder";
import svgLoader from 'vite-svg-loader';
import VueDevTools from 'vite-plugin-vue-devtools';

const path = require("path");
const packageName = path.basename(__dirname);
HelperVersions.addVersionsToEnv(__dirname);
HelperBuilder.saveConfigFileToPublicPath(__dirname);

process.env.VITE_APP_PACKAGE_NAME = packageName;

// https://vitejs.dev/config/
export default defineConfig({
  server: {
    port: 3007,
  },
  plugins: [
    VueDevTools(),
    vue(),
    vueJsx(),
    AutoImport({
      resolvers: [ElementPlusResolver()],
    }),
    Components({
      resolvers: [ElementPlusResolver()],
    }),
    svgLoader({
      defaultImport: 'url' // or 'raw'
    }),
  ],
  resolve: {
    extensions: ['.mjs', '.js', '.ts', '.jsx', '.tsx', '.json', '.vue', '.d.ts'],
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  css: {
    preprocessorOptions: {
      scss: {
        silenceDeprecations: ["legacy-js-api"],
      },
    },
  },
})

import './assets/main.scss'
import 'modern-normalize/modern-normalize.css';

import {createApp} from 'vue'
import {createPinia} from 'pinia'

import App from './App.vue'
import router from './router'
import components from "./plugins/components";
import uiLibModuleInstallation from "@cyoda/ui-lib/src/plugins/installation.js";

const installationOptions = {
  routerOptions: {
    router,
    meta: {
      layout: "sidebar",
    },
  },
};

// Plugins
import fontaweome from "./plugins/fontaweome";
import elementUi from "./plugins/element-ui";


const app = createApp(App)

app.use(createPinia())
app.use(uiLibModuleInstallation, installationOptions);
app.use(router)
app.use(elementUi);
app.use(fontaweome);
app.use(components);

app.mount('#app');

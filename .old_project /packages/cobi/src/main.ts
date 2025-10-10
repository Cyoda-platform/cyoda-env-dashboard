import { createApp } from 'vue'
import App from "./App.vue";
import {router, beforeEachRouter} from "./router";
import { createPinia } from 'pinia'
import directives from './plugins/directives.js'

import LayoutDefault from "./layout/CyodaLayoutDefault.vue";
import LayoutSidebar from "./layout/CyodaLayoutSidebar.vue";
import LayoutLogin from "./layout/CyodaLayoutLogin.vue";
import LayoutBaseMenuWrapper from "./layout/CyodaBaseMenuWrapperLayout.vue";
import PortalVue from "portal-vue";

// Plugins
import fontaweome from "./plugins/fontaweome";
import elementUi from "./plugins/element-ui";

// @ts-ignore
import "./plugins/directives.js";
import "./assets/css/main.scss";
import "modern-normalize/modern-normalize.css";

import uiLibModuleInstallation from "@cyoda/ui-lib/src/plugins/installation.js";

import "./assets/style.scss";


const installationOptions = {
  routerOptions: {
    router,
    meta: {
      layout: "sidebar",
    },
  },
};

const configUrl=`${import.meta.env.VITE_APP_PUBLIC_PATH}/config.json?mktime=${Date.now()}`.replaceAll('//','/');
fetch(configUrl).then((response) => {
  response.json().then((config) => {
    // Vue.prototype.$config = config;
    const app = createApp(App)
    app.use(elementUi);
    app.use(directives);
    app.use(fontaweome);
    app.use(PortalVue)
    app.component("default-layout", LayoutDefault);
    app.component("sidebar-layout", LayoutSidebar);
    app.component("login-layout", LayoutLogin);
    app.component("base-menu-wrapper-layout", LayoutBaseMenuWrapper);
    app.use(uiLibModuleInstallation, installationOptions);
    app.use(router);
    app.use(createPinia())
    app.mount("#app");
    beforeEachRouter(app);
  });
});

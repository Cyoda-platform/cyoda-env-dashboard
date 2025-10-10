import {createApp} from 'vue'
import App from "./App.vue";
import router from "./router";
import components from "@/plugins/components";
import filters from "@/plugins/filters";
import fontaweome from "@/plugins/fontaweome";
import "./assets/css/main.scss";
import PortalVue from "portal-vue";

import uiLibModuleInstallation from "@cyoda/ui-lib/src/plugins/installation.js";
// import httpApiInstallation from '@cyoda/http-api/src/plugins/installation.js';

const installationOptions = {
  routerOptions: {
    router,
    meta: {
      layout: "sidebar",
    },
  },
};

import {createPinia} from "pinia";
import elementUi from "@cyoda/cobi/src/plugins/element-ui";
import {beforeEachRouter} from "@cyoda/cobi/src/router";

const app = createApp(App)
app.use(elementUi);
app.use(router);
app.use(fontaweome);
app.use(components);
app.use(filters);
app.use(PortalVue);
app.use(uiLibModuleInstallation, installationOptions);
app.use(createPinia())

app.mount("#app");
beforeEachRouter(app);

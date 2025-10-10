import LayoutSidebar from "@/layout/PmLayoutSidebar.vue";
import LayoutDefault from "@/layout/PmLayoutDefault.vue";
import App from "./App.vue";
import router from "./router";
import "@/assets/css/main.scss";
import CyodaDataTables from "@cyoda/ui-lib/src/components-library/elements/CyodaDataTables/CyodaDataTables.vue";

import uiLibModuleInstallation from "@cyoda/ui-lib/src/plugins/installation.js";
import httpApiInstallation from '@cyoda/http-api/src/plugins/installation.js';
import {createApp} from "vue";
import elementUi from "@/plugins/element-ui";
import fontaweome from "@/plugins/fontaweome";
import {createPinia} from "pinia";
import filters from "@/plugins/filters";
import {beforeEachRouter} from "@cyoda/http-api/src/router";
import Portal from "@/plugins/portal";

const installationOptions = {
  routerOptions: {
    router,
  },
};

fetch(import.meta.env.BASE_URL + "config.json?mktime=" + Date.now()).then(
  (response) => {
    response.json().then((config) => {
      const app = createApp(App);
      app.use(elementUi);
      app.use(router);
      app.use(fontaweome);
      app.use(createPinia())
      app.use(filters);
      app.use(Portal);
      app.component('data-tables',CyodaDataTables);
      app.component("default-layout", LayoutDefault);
      app.component("sidebar-layout", LayoutSidebar);
      app.use(uiLibModuleInstallation, installationOptions);
      app.use(httpApiInstallation, installationOptions);
      app.mount("#app");
      beforeEachRouter(app);
    });
  }
);

import App from "./App.vue";
import {router, beforeEachRouter} from "./router";

import components from "@/plugins/components";
import "@/plugins/jquery";
import elementUi from "@/plugins/element-ui";
import fontaweome from "@/plugins/fontaweome";
import {createPinia} from "pinia";
import {createApp} from "vue";
import filters from "./plugins/filters.ts";
import CyodaDataTables from "@cyoda/ui-lib/src/components-library/elements/CyodaDataTables/CyodaDataTables.vue";
import uiLibModuleInstallation from "@cyoda/ui-lib/src/plugins/installation.js";
import "@/assets/css/main.scss";

fetch(import.meta.env.BASE_URL + "config.json?mktime=" + Date.now()).then(
  (response) => {
    response.json().then((config) => {
      const app = createApp(App);
      app.use(elementUi);
      app.use(router);
      app.use(fontaweome);
      app.use(createPinia())
      app.use(components)
      app.use(filters);
      app.component('data-tables',CyodaDataTables);
      app.use(uiLibModuleInstallation);
      app.mount("#app");
      beforeEachRouter(app);
    });
  }
);

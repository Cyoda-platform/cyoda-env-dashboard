import BaseWrapperLayout from "../layout/BaseWrapperLayout.vue";
import LoginWrapperLayout from "../layout/LoginWrapperLayout.vue";
import CyodaDataTables from "@cyoda/ui-lib/src/components-library/elements/CyodaDataTables/CyodaDataTables.vue";

export default {
  install: (app, options) => {
    if (!app._context.components['base-wrapper-layout']) app.component('base-wrapper-layout', BaseWrapperLayout);
    if (!app._context.components['login-wrapper-layout']) app.component('login-wrapper-layout', LoginWrapperLayout);
    if (!app._context.components['data-tables']) app.component('data-tables', CyodaDataTables);
  }
}

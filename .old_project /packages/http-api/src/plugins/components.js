import Transfer from "../extends/element-plus/components/transfer";

import BaseWrapperLayout from "../layout/BaseWrapperLayout.vue";
import LoginWrapperLayout from "../layout/LoginWrapperLayout.vue";

// @ts-ignore
import PortalVue from "portal-vue";

export default {
  install: (app) => {
    if(!app._context.components.transfer) app.component("transfer", Transfer);

    // Layouts
    if(!app._context.components["base-wrapper-layout"]) app.component("base-wrapper-layout", BaseWrapperLayout);
    if(!app._context.components["login-wrapper-layout"]) app.component("login-wrapper-layout", LoginWrapperLayout);

    if(!app._context.components.PortalTarget) app.use(PortalVue);
  }
};

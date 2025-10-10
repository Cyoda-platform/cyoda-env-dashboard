import BaseWrapperLayout from "../layout/BaseWrapperLayout.vue";
import LoginWrapperLayout from "../layout/LoginWrapperLayout.vue";


export default {
  install: (app) => {
    if (!app._context.components['base-wrapper-layout']) app.component("base-wrapper-layout", BaseWrapperLayout);
    if (!app._context.components['login-wrapper-layout']) app.component("login-wrapper-layout", LoginWrapperLayout);
  }
}

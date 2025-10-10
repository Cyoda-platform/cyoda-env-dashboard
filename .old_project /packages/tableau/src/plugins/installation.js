import router from "../router";
import store from "../store";
import HelperInstall from "@cyoda/ui-lib/src/helpers/HelperInstall";
import "./element-ui";
import "./components";
import "./fontaweome";
import "./filters";
import fontaweome from "./fontaweome";

export default {
  install(Vue, options) {
    if (!app._context.components['font-awesome-icon']) app.use(fontaweome);
    HelperInstall.setupRouters(router, options);
    HelperInstall.setupStores(store, options);
  },
};

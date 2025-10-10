import routes from "../router/routes";
import HelperInstall from "@cyoda/ui-lib/src/helpers/HelperInstall";
import elementUi from "./element-ui";
import fontaweome from "./fontaweome";
import filters from "./filters.ts";
import portal from "./portal";
import "../assets/css/installation/index.scss";

export default {
  install(app, options) {
    app.use(filters);
    if (!app._context.components.ElButton) app.use(elementUi);
    if (!app._context.components['font-awesome-icon']) app.use(fontaweome);
    if (!app._context.components.PortalTarget) app.use(portal);
    HelperInstall.setupRouters(routes, options);
  },
};

import routes from "../router/routes";
import HelperInstall from "@cyoda/ui-lib/src/helpers/HelperInstall";
import elementUi from "./element-ui";
import components from "./components";
import filters from "./filters.ts";
import fontaweome from "./fontaweome";
import "./jquery";

export default {
  install(app, options) {
    app.use(components);
    app.use(filters);
    if (!app._context.components.ElButton) app.use(elementUi);
    if (!app._context.components['font-awesome-icon']) app.use(fontaweome);
    HelperInstall.setupRouters(routes, options);
  },
};

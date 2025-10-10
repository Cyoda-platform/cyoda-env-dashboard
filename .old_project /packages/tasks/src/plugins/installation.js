import routes from "../router/routes";
import HelperInstall from "@cyoda/ui-lib/src/helpers/HelperInstall";
import components from "./components";
import fontaweome from "./fontaweome";
import filters from "./filters";

export default {
  install(app, options) {
    app.use(components);
    app.use(filters);
    if (!app._context.components['font-awesome-icon']) app.use(fontaweome);
    HelperInstall.setupRouters(routes, options);
  },
};

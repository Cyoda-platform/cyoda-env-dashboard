import routes from "../router/routes";
import HelperInstall from "@cyoda/ui-lib/src/helpers/HelperInstall";
import fontaweome from "./fontaweome";
import elementUi from "./element-ui";

// Styles
import "../assets/css/particular/_blockly.scss";
import "../assets/css/particular/_notification.scss";
import "../assets/css/particular/_animations.scss";
import "../assets/css/particular/_data_mapper.scss";

export default {
  install(app, options) {
    if (!app._context.components['font-awesome-icon']) app.use(fontaweome);
    if (!app._context.components.ElButton) app.use(elementUi);
    HelperInstall.setupRouters(routes, options);
  },
};

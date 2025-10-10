import directive from './directive';
import filters from './filters';
import auth0 from "./auth0";
import CyodaDataTables from "../components-library/elements/CyodaDataTables/CyodaDataTables.vue";
import fontaweome from "./fontaweome";
import "../assets/css/main.scss";

export default {
  install(app, options) {
    app.use(directive);
    app.use(filters);
    app.use(auth0);
    if (!app._context.components['font-awesome-icon']) app.use(fontaweome);
    if (!app._context.components['data-tables']) app.component('data-tables',CyodaDataTables);
  }
};

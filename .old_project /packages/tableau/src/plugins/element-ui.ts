
import ElementUI from "element-ui";
import "element-ui/lib/theme-chalk/index.css";
import { DataTables, DataTablesServer } from "vue-data-tables";
// @ts-ignore
import locale from "element-ui/lib/locale/lang/en";

Vue.use(ElementUI, { locale });
Vue.use(DataTables);
Vue.use(DataTablesServer);

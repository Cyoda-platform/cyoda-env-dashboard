
import App from "./App.vue";
import store from "./store";
import router from "./router";
import "@/plugins/element-ui";
import "@/plugins/components";
import "@/plugins/fontaweome";
import LayoutDefault from "@/layout/LayoutDefault.vue";
import LayoutLogin from "@/layout/LayoutLogin.vue";

import "modern-normalize/modern-normalize.css";
import "@/assets/css/main.scss";
import "@cyoda/http-api/src/assets/css/element-ui/_table.scss";
import "@cyoda/http-api/src/assets/css/_default.scss";

Vue.component("default-layout", LayoutDefault);
Vue.component("login-layout", LayoutLogin);

Vue.config.productionTip = false;

new Vue({
  router,
  store,
  render: (h) => h(App),
}).$mount("#app");

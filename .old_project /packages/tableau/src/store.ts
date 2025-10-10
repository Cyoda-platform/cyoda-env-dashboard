
import Vuex from "vuex";

import auth from "@cyoda/ui-lib/src/stores/vuex/auth";
import chartsData from "@cyoda/http-api/src/stores/charts-data";

Vue.use(Vuex);

export default new Vuex.Store({
  modules: {
    auth,
    chartsData,
  },
});

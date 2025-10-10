import HelperFormat from "@cyoda/ui-lib/src/helpers/HelperFormat";
import moment from "moment";

export default {
  install: (app) => {
    app.config.globalProperties.$filters = {
      ...app.config.globalProperties.$filters,
      date(value) {
        return HelperFormat.date(value);
      },
      mktimeToDateTime(value) {
        return moment(value).format("DD.MM.YYYY HH:mm:ss");
      }
    }
  }
}

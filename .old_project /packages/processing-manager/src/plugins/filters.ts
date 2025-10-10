import moment from "moment";

export default {
  install: (app) => {
    app.config.globalProperties.$filters = {
      ...app.config.globalProperties.$filters,
      boolean(value) {
        if (value === null) return "";
        return value ? "Yes" : "No";
      },
      dateTime(value){
        if (!value) return "-";
        return moment(value).format("YYYY-MM-DD HH:mm:ss.SSS");
      },
      countdown(value){
        if (!value) return "-";
        const duration = moment.duration(value, "milliseconds");
        return `${Math.trunc(duration.asSeconds())}s ${duration.milliseconds()}ms`;
      }
    }
  }
}

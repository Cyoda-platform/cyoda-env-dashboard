import moment from "moment";

export default {
    install: (app) => {
        app.config.globalProperties.$filters = {
            ...app.config.globalProperties.$filters,
            mktimeToDateTime(value) {
                return moment(value).format("DD.MM.YYYY HH:mm:ss");
            }
        }
    }
}

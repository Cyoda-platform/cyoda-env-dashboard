/*eslint-disable */
import axios from "axios";
import HelperStorage from "@cyoda/ui-lib/src/helpers/HelperStorage";
import qs from "qs";
import HelperErrors from "@cyoda/ui-lib/src/helpers/HelperErrors";

const helperStorage = new HelperStorage();

const axiosGrafana = axios.create({
  baseURL: `${import.meta.env.VITE_APP_GRAFANA_API_URL}`,
  headers: {
    "Content-Type": "application/json",
  },
  auth: {
    username: import.meta.env.VITE_APP_GRAFANA_USERNAME || "",
    password: import.meta.env.VITE_APP_GRAFANA_PASSWORD || "",
  },
});

const axiosProcessing = axios.create({
  baseURL: import.meta.env.VITE_APP_API_BASE_PROCESSING,
  paramsSerializer: function (params) {
    return qs.stringify(params, {
      indices: false,
      skipNulls: true,
      filter: function (prefix, value) {
        if (typeof value !== 'object') return value;

        Object.keys(value).forEach((key) => {
          if (value[key] === "") {
            value[key] = null;
          }
        });
        return value;
      },
    });
  },
  headers: {
    "Content-Type": "application/json",
  },
});

axiosProcessing.interceptors.request.use((config) => {
  const token = helperStorage.get("auth") && helperStorage.get("auth").token;
  config.headers.Authorization = token ? `Bearer ${token}` : "";
  return config;
});

axiosProcessing.interceptors.response.use(
  response => response,
  error => {
    if (!(error.config && error.config.muteErrors)) HelperErrors.handler(error);
    return Promise.reject(error);
  });

export {axiosGrafana, axiosProcessing};

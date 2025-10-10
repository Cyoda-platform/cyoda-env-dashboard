import axios from "axios";
import HelperStorage from "@cyoda/ui-lib/src/helpers/HelperStorage";

const helperStorage = new HelperStorage();

const instance = axios.create({
  baseURL: import.meta.env.VITE_APP_API_BASE,
  headers: {
    "X-Requested-With": "XMLHttpRequest",
  },
});

instance.interceptors.request.use((config) => {
  const token = helperStorage.get("auth") && helperStorage.get("auth").token;
  config.headers.Authorization = token ? `Bearer ${token}` : "";
  return config;
});

export default instance;

export const axiosPublic = axios.create({
  baseURL: import.meta.env.VITE_APP_API_BASE,
  headers: {
    "X-Requested-With": "XMLHttpRequest",
  },
});

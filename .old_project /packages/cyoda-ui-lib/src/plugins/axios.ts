import axios from 'axios';
import HelperStorage from '../helpers/HelperStorage';
import HelperErrors from "../helpers/HelperErrors";
import {useAuthStore} from "@cyoda/ui-lib/src/stores/auth";
import serializeParams from "../helpers/HelperSerializeParams";

axios.defaults.paramsSerializer = { serialize: serializeParams };

let refreshAccessTokenPromise = null;

const helperStorage = new HelperStorage();
const instance = axios.create({
  // @ts-ignore
  baseURL: import.meta.env.VITE_APP_API_BASE,
  headers: {
    'X-Requested-With': 'XMLHttpRequest',
  },
});

instance.interceptors.request.use((config) => {
  const token = helperStorage.get('auth') && helperStorage.get('auth').token;
  config.headers.Authorization = token ? `Bearer ${token}` : '';
  if (config.url && import.meta.env.VITE_APP_API_BASE_PROCESSING && config.url.indexOf('platform-processing') > -1) {
    config.baseURL = import.meta.env.VITE_APP_API_BASE_PROCESSING ;
  }
  // else if (Vue.prototype.$config && Vue.prototype.$config.VITE_APP_API_BASE) {
  //   config.baseURL = Vue.prototype.$config.VITE_APP_API_BASE;
  // }
  return config;
});


instance.interceptors.response.use(
  response => response,
  error => {
    if (!(error.config && error.config.muteErrors)) HelperErrors.handler(error);
    return Promise.reject(error);
  });

instance.interceptors.response.use(undefined, async error => {
  const response = error.response

  if (response) {
    if (response.status === 401 && error.config && !error.config.__isRetryRequest && ['default', 'auth0', undefined].includes(helperStorage.get("auth").type)) {
      const authStore = useAuthStore();
      try {
        if (!refreshAccessTokenPromise) {
          refreshAccessTokenPromise = authStore.refreshAccessToken();
        }
        await refreshAccessTokenPromise;
        refreshAccessTokenPromise = null;
        error.config.__isRetryRequest = false
      } catch (authError) {
        // refreshing has failed, but report the original error, i.e. 401
        authStore.logout();
        window.location.href="/";
      }

      // retry the original request
      error.config.__isRetryRequest = true
      const token = helperStorage.get("auth") && helperStorage.get("auth").token;
      error.config.headers['Authorization']=`Bearer ${token}`;
      return axios.request(error.config);
    }
  }

  return Promise.reject(error)
})

export default instance;


const axiosPublic = axios.create({
  baseURL: import.meta.env.VITE_APP_API_BASE,
  headers: {
    'X-Requested-With': 'XMLHttpRequest',
  },
});

const axiosProcessing = axios.create({
  baseURL: import.meta.env.VITE_APP_API_BASE_PROCESSING,
  headers: {
    'Content-Type': 'application/json',
  }
});

axiosProcessing.interceptors.response.use(
  response => response,
  error => {
    HelperErrors.handler(error);
    return Promise.reject(error);
  });


// axiosPublic.interceptors.request.use((config) => {
//   if (Vue.prototype.$config && Vue.prototype.$config.VITE_APP_API_BASE) {
//     config.baseURL = Vue.prototype.$config.VITE_APP_API_BASE;
//   }
//   return config;
// });

axiosPublic.interceptors.response.use(
  response => response,
  error => {
    HelperErrors.handler(error);
    return Promise.reject(error);
  });

export {axiosPublic, axiosProcessing};

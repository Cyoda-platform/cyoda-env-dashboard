import HelperStorage from "@cyoda/ui-lib/src/helpers/HelperStorage";
import {getCurrentInstance} from "vue";
import {useAppStore} from "../stores/app";


const helperStorage = new HelperStorage();

export default class HelperUrl {
  // public static getProcessingUrl() {
  //   return `${import.meta.env.VITE_APP_BASE_URL}${import.meta.env.MODE === "production" ? "" : ":8002"}`;
  // }

  public static getLinkToServer(endpoint: string) {
    const appStore = useAppStore();
    const isProxyRequest = helperStorage.get("proxyRequest", true);
    let endpointComputed = endpoint;
    if (isProxyRequest) {
      if (endpointComputed.indexOf("?") > -1) {
        endpointComputed += "&";
      } else {
        endpointComputed += "?";
      }
      endpointComputed += `node=${appStore.node}`;
    } else {
      console.log('appStore.baseUrl',appStore.baseUrl);
      if(appStore.baseUrl) endpointComputed = `${appStore.baseUrl}${endpointComputed}`;
    }

    return endpointComputed;
  }
}

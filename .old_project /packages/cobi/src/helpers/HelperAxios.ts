import axios from "@cyoda/ui-lib/src/plugins/axios";

const staticPromises = {};
export default {
  getStaticData(url) {
    if (staticPromises[url]) {
      return staticPromises[url];
    }
    staticPromises[url] = axios.get(url);
    return staticPromises[url];
  }
}

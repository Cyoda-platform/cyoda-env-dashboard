
import { library } from "@fortawesome/fontawesome-svg-core";
import { faUser, faLock } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";

// @ts-ignore
library.add(faUser, faLock);

export default {
  install: (app) => {
    app.component("font-awesome-icon", FontAwesomeIcon);
  }
}

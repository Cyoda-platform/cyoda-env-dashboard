import { library } from '@fortawesome/fontawesome-svg-core'
import {
  faAngleDoubleLeft,
  faAngleDoubleRight,
  faAngleLeft,
  faAngleRight,
  faCheckCircle,
  faCogs,
  faCopy, faKey,
  faPlay,
  faServer,
  faStop,
  faStopCircle,
  faSync,
  faSyncAlt,
  faTachometerAlt,
  faTerminal,
  faUser,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'

// @ts-ignore
library.add(
  faAngleDoubleLeft,
  faAngleDoubleRight,
  faAngleLeft,
  faAngleRight,
  faCheckCircle,
  faCogs,
  faCopy, faKey,
  faPlay,
  faServer,
  faStop,
  faStopCircle,
  faSync,
  faSyncAlt,
  faTachometerAlt,
  faTerminal,
  faUser,
);

export default {
    install: (app) => {
        app.component("font-awesome-icon", FontAwesomeIcon);
    }
}

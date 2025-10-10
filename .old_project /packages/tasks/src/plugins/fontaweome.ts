import {library} from "@fortawesome/fontawesome-svg-core";
import {
  faTimes,
  faLongArrowAltLeft,
  faSatellite,
  faArrowUp,
  faArrowDown,
  faPencilAlt,
} from "@fortawesome/free-solid-svg-icons";
import {FontAwesomeIcon} from "@fortawesome/vue-fontawesome";

// @ts-ignore
library.add(
  faTimes,
  faLongArrowAltLeft,
  faSatellite,
  faArrowUp,
  faArrowDown,
  faPencilAlt,
);

export default {
  install: (app, options) => {
    app.component("font-awesome-icon", FontAwesomeIcon);
  }
}

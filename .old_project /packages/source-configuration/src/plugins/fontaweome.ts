import { library } from '@fortawesome/fontawesome-svg-core'
import {
  faArrowLeft,
  faArrowRight,
  faClipboard,
  faDownload,
  faFlagCheckered,
  faInfo,
  faInfoCircle,
  faPencilAlt,
  faPlus,
  faSearch,
  faTrash,
  faUpload,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'

// @ts-ignore
library.add(
  faArrowLeft,
  faArrowRight,
  faClipboard,
  faDownload,
  faFlagCheckered,
  faInfo,
  faInfoCircle,
  faPencilAlt,
  faPlus,
  faSearch,
  faTrash,
  faUpload,
);

export default {
    install: (app) => {
        app.component("font-awesome-icon", FontAwesomeIcon);
    }
}

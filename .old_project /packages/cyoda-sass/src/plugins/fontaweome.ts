import {library} from '@fortawesome/fontawesome-svg-core'
import {
  faBars,
  faCodeBranch,
  faHome,
  faPencilAlt,
  faPlus,
  faSignOutAlt,
  faTable,
  faTrash,
  faEye,
  faArrowsRotate,
  faCopy
} from '@fortawesome/free-solid-svg-icons'
import {faLinkedinIn} from "@fortawesome/free-brands-svg-icons";
import {FontAwesomeIcon} from '@fortawesome/vue-fontawesome'

// @ts-ignore
library.add(
  faBars,
  faCodeBranch,
  faHome,
  faPencilAlt,
  faPlus,
  faSignOutAlt,
  faTable,
  faTrash,
  faLinkedinIn,
  faEye,
  faArrowsRotate,
  faCopy
);

export default {
  install: (app) => {
    app.component("font-awesome-icon", FontAwesomeIcon);
  }
}

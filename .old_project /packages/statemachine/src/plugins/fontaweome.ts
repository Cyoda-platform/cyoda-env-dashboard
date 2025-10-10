import { library } from '@fortawesome/fontawesome-svg-core'
import {
  faCopy,
  faDiagramProject,
  faPencilAlt,
  faPlus,
  faRectangleList,
  faTable,
  faTrash,
  faList,
  faCircleExclamation,
  faCheck,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'

// @ts-ignore
library.add(
  faTrash,
  faPlus,
  faPencilAlt,
  faTable,
  faCopy,
  faDiagramProject,
  faRectangleList,
  faList,
  faCircleExclamation,
  faCheck,
);

export default {
    install: (app) => {
        app.component("font-awesome-icon", FontAwesomeIcon);
    }
}

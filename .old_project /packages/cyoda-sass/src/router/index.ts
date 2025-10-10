import { createRouter, createWebHistory } from 'vue-router'
import routes from './routes';
import {checkForPublic} from "@cyoda/ui-lib/src/helpers/HelperRouter";
import {ElMessageBox} from "element-plus";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
});

function beforeEachRouter(app) {
  window.addEventListener("popstate", () => {
    app.config.globalProperties.$popStateDetected = true;
  });

  app.config.globalProperties.$popStateDetected = false;

  router.beforeEach((to, from, next) => {
    const IsItABackButton = app.config.globalProperties.$popStateDetected;
    app.config.globalProperties.$popStateDetected = false;

    if (IsItABackButton && from.meta.isDataWasChangedAndNotSaved) {
      ElMessageBox.confirm("You do not save data. You really want to leave page?", "Warning", {
            confirmButtonText: "OK",
            cancelButtonText: "Cancel",
            type: "warning",
          })
          .then(() => {
            next();
          })
          .catch(() => {
            next(false);
            return;
          });
      return;
    }

    const nearestWithTitle = to.matched
        .slice()
        .reverse()
        .find((r) => r.meta && r.meta.name);
    if (nearestWithTitle) {
      document.title = nearestWithTitle.meta.name;
    }

    checkForPublic(to, next);

  });
}

export {router, beforeEachRouter};

import { createRouter, createWebHistory } from 'vue-router'
import routes from "./routes";
import {checkForPublic} from "@cyoda/ui-lib/src/helpers/HelperRouter";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
});

router.beforeEach((to, from, next) => {
  checkForPublic(to, next);
});

export default router;

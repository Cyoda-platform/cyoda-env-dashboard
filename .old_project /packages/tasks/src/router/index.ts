import {createRouter, createWebHistory} from "vue-router";
import {useAuthStore} from "@cyoda/ui-lib/src/stores/auth";
import routes from "./routes";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
});

router.beforeEach((to, from, next) => {
  const authStore = useAuthStore();
  // Check for Public
  if (to.matched.some((record) => !record.meta.isPublic)) {
    if (!authStore.isLoggedIn) {
      authStore.logout();
      next({
        path: "/tasks/login",
        query: {redirect: to.fullPath},
      });
    } else {
      next();
    }
  } else {
    next();
  }
});

export default router;

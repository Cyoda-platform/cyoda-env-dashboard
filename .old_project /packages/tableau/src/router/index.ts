
import Router, { RouteConfig } from "vue-router";
import store from "../store";
import ReportsView from "@/views/ReportsView.vue";
import HelperStorage from "@cyoda/ui-lib/src/helpers/HelperStorage";

const helperStorage = new HelperStorage();

Vue.use(Router);

const routes: Array<RouteConfig> = [
  { path: "/", redirect: "/tableau/reports" },
  { path: "/login", redirect: "/tableau/login" },
  {
    path: "/tableau/login",
    name: "login",
    meta: {
      layout: "login",
      isPublic: true,
      title: "Login",
    },
    component: () =>
      import(/* webpackChunkName: "login" */ "@/views/LoginView.vue"),
  },
  {
    path: "/tableau/reports",
    name: "Reports",
    meta: {
      title: "Reports",
    },
    component: ReportsView,
  },
];

const router = new Router({
  mode: "history",
  base: import.meta.env.BASE_URL,
  routes,
});

router.beforeEach((to, from, next) => {
  // @ts-ignore
  document.title = `${to.meta.title} | Cyoda`;
  // Check for Public
  if (to.matched.some((record) => !record.meta.isPublic)) {
    if (!store.getters["auth/isLoggedIn"]) {
      store.commit("auth/logout");
      const urlParams = new URLSearchParams(window.location.search);
      const username = urlParams.get("username");
      const password = urlParams.get("password");
      if (username && password) {
        helperStorage.set("authAuto", { username, password });
      }
      next({
        path: "/tableau/login",
        query: { redirect: to.fullPath },
      });
    } else {
      next();
    }
  } else {
    next();
  }
});

export default router;

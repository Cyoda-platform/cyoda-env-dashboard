import {createRouter, createWebHistory} from 'vue-router'
import HomeView from "@/views/HomeView.vue";
import {checkForPublic} from "@cyoda/ui-lib/src/helpers/HelperRouter";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/source-configuration/login",
      name: "login",
      meta: {
        layout: "login",
        name: "Login",
        isPublic: true,
      },
      component: () =>
        import(
          /* webpackChunkName: 'login' */ "@cyoda/ui-lib/src/components-library/elements/Login/Login.vue"
          ),
    },
    {
      path: "/login",
      redirect: "/source-configuration/login",
    },
    {
      path: "/",
      redirect: "/source-configuration",
    },
    {
      path: "/source-configuration",
      name: "Home",
      component: HomeView,
    },
  ]
});

router.beforeEach((to, from, next) => {
  checkForPublic(to, next);
});

export default router;

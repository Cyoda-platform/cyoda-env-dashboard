import TrinoIndex from "../views/Trino/TrinoIndex.vue";
import TrinoEdit from "../views/Trino/TrinoEdit.vue";

export default [
  {
    path: "/cyoda-sass/login",
    name: "login",
    meta: {
      layout: "login",
      name: "Login",
      isPublic: true,
    },
    component: () => import("../views/LoginView.vue"),
  },
  {
    path: "/login",
    redirect: "/cyoda-sass/login",
  },
  {
    path: "/",
    redirect: "/cyoda-sass/trino",
  },
  {
    path: "/cyoda-sass/trino",
    name: "Trino",
    meta: {
      layout: "sidebar",
      name: "Trino",
      isPublic: false,
    },
    component: TrinoIndex,
  },
  {
    path: "/cyoda-sass/trino/schema",
    name: "TrinoEditNew",
    meta: {
      layout: "sidebar",
      name: "Trino Edit",
      isPublic: false,
    },
    component: TrinoEdit,
  },
  {
    path: "/cyoda-sass/trino/schema/:id",
    name: "TrinoEdit",
    meta: {
      layout: "sidebar",
      name: "Trino Edit",
      isPublic: false,
    },
    component: TrinoEdit,
  },
]

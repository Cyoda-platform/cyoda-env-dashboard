import Home from "@cyoda/ui-lib/src/components-library/elements/Home/Home.vue";
import Tasks from "../views/tasks/index/Tasks.vue";
import TasksDetail from "../views/tasks/detail/TasksDetail.vue";

export default [
  {
    path: "/tasks/login",
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
  {path: "/menu", component: Home},
  {path: "/", redirect: "/tasks"},
  {path: "/login", redirect: "/tasks/login"},
  {
    path: "/tasks",
    name: "tasks",
    meta: {
      name: "Tasks",
    },
    component: Tasks,
  },
  {
    path: "/tasks/:id",
    name: "tasks-detail",
    meta: {
      name: "Detail Task",
      baseUrl: "/tasks",
    },
    component: TasksDetail,
  },
];

import Page404 from "../views/Page404.vue";
import Login from "../views/Login.vue";
import Home from "../views/Home.vue";

export default [
  {
    path: "/404",
    name: "404",
    component: Page404,
  },
  {
    path: "/",
    redirect: "/processing-ui",
  },
  {
    path: "/login",
    name: "login",
    meta: {
      name: "Login",
      isPublic: true,
    },
    component: Login,
  },
  {
    path: "/processing-ui",
    name: "home",
    component: Home,
    meta: {
      layout: "sidebar",
      name: "Processing",
      breadcrumbs: [
        {
          name: "Processing",
          link: "",
        },
      ],
    },
  },
  {
    path: "/processing-ui/nodes",
    name: "nodes",
    meta: {
      layout: "sidebar",
      name: "Nodes",
      breadcrumbs: [
        {
          name: "Processing",
          link: "/processing-ui",
        },
        {
          name: "Nodes",
          link: "",
        },
      ],
    },
    component: () => import(/* webpackChunkName: "shards" */ "../views/Nodes.vue"),
  },
  {
    path: "/processing-ui/nodes/:name",
    name: "node-detail",
    meta: {
      layout: "sidebar",
      name: "NodeDetail",
      baseUrl: "/processing-ui/nodes",
      breadcrumbs: [
        {
          name: "Processing",
          link: "/processing-ui",
        },
        {
          name: "Nodes",
          link: "/processing-ui/nodes",
        },
        {
          name: "{name}",
          link: "",
        },
      ],
    },
    component: () => import(/* webpackChunkName: "shards-detail" */ "../views/NodesDetail.vue"),
  },
  {
    path: "/processing-ui/nodes/:name/transaction/:transactionId",
    name: "transition-detail",
    meta: {
      layout: "sidebar",
      name: "TransitionDetail",
      baseUrl: "/processing-ui/nodes",
      breadcrumbs: [
        {
          name: "Processing",
          link: "/processing-ui",
        },
        {
          name: "Nodes",
          link: "/processing-ui/nodes",
        },
        {
          name: "{name}",
          link: "/processing-ui/nodes/{name}",
        },
        {
          name: "{transactionId}",
          link: "",
        },
      ],
    },
    component: () =>
      import(/* webpackChunkName: "shards-detail" */ "../views/TransactionDetail.vue"),
  },
  {
    path: "/processing-ui/nodes/:name/versions",
    name: "transition-versions",
    meta: {
      layout: "sidebar",
      name: "TransitionDetail",
      baseUrl: "/processing-ui/nodes",
      breadcrumbs: [
        {
          name: "Processing",
          link: "/processing-ui",
        },
        {
          name: "Nodes",
          link: "/processing-ui/nodes",
        },
        {
          name: "{name}",
          link: "/processing-ui/nodes/{name}",
        },
        {
          name: "Versions",
          link: "",
        },
      ],
    },
    component: () =>
      import(/* webpackChunkName: "shards-detail" */ "../views/TransitionVersions.vue"),
  },
  {
    path: "/processing-ui/nodes/:name/changes",
    name: "transition-changes",
    meta: {
      layout: "sidebar",
      name: "TransitionDetail",
      baseUrl: "/processing-ui/nodes",
      breadcrumbs: [
        {
          name: "Processing",
          link: "/processing-ui",
        },
        {
          name: "Nodes",
          link: "/processing-ui/nodes",
        },
        {
          name: "{name}",
          link: "/processing-ui/nodes/{name}",
        },
        {
          name: "Changes",
          link: "",
        },
      ],
    },
    component: () =>
      import(/* webpackChunkName: "shards-detail" */ "../views/TransitionChanges.vue"),
  },
  {
    path: "/processing-ui/nodes/:name/entity-state-machine",
    name: "transition-entity-state-machine",
    meta: {
      layout: "sidebar",
      name: "TransitionDetail",
      baseUrl: "/processing-ui/nodes",
      breadcrumbs: [
        {
          name: "Processing",
          link: "/processing-ui",
        },
        {
          name: "Nodes",
          link: "/processing-ui/nodes",
        },
        {
          name: "{name}",
          link: "/processing-ui/nodes/{name}",
        },
        {
          name: "State machine",
          link: "",
        },
      ],
    },
    component: () =>
      import(/* webpackChunkName: "shards-detail" */ "../views/TransitionEntityStateMachine.vue"),
  },
  {
    path: "/processing-ui/nodes/:name/event-view",
    name: "error-event",
    meta: {
      layout: "sidebar",
      name: "ErrorEvent",
      baseUrl: "/processing-ui/nodes",
      breadcrumbs: [
        {
          name: "Processing",
          link: "/processing-ui",
        },
        {
          name: "Nodes",
          link: "/processing-ui/nodes",
        },
        {
          name: "{name}",
          link: "/processing-ui/nodes/{name}",
        },
        {
          name: "Event View",
          link: "",
        },
      ],
    },
    component: () => import(/* webpackChunkName: "shards-detail" */ "../views/EventView.vue"),
  },
  // { path: "*", redirect: "/404" },
];

import Home from "@cyoda/ui-lib/src/components-library/elements/Home/Home.vue";
import Workflows from "../views/Workflows.vue";
import WorkflowNew from "../views/workflow/WorkflowNew.vue";
import WorkflowId from "../views/workflow/WorkflowId.vue";
import Transition from "../views/Transition.vue";
import Process from "../views/Process.vue";
import Criteria from "../views/Criteria.vue";
import Instances from "../views/Instances.vue";
import InstancesDetailView from "../views/InstancesDetailView.vue";
import State from "../views/State.vue";
import Entities from "@/views/Entities.vue";

export default [
  {
    path: "/login",
    name: "login",
    meta: {
      layout: "login",
      name: "Login",
      isPublic: true,
    },
    component: () => import("@cyoda/ui-lib/src/components-library/elements/Login/Login.vue"),
  },
  { path: "/menu", component: Home },
  { path: "/", redirect: "/statemachine/instances" },
  // {
  //   path: "/statemachine/entities",
  //   name: "entities",
  //   component: Entities,
  //   meta: {
  //     name: "Entities",
  //   },
  // },
  {
    path: "/statemachine/workflows",
    name: "workflows",
    component: Workflows,
    meta: {
      name: "Workflows",
    },
  },
  {
    path: "/statemachine/workflow/new",
    name: "workflow-new",
    component: WorkflowNew,
    meta: {
      name: "WorkflowNew",
    },
  },
  {
    path: "/statemachine/workflow/:workflowId",
    name: "workflowId",
    component: WorkflowId,
    meta: {
      name: "WorkflowId",
    },
  },
  {
    path: "/statemachine/transition/:transitionId",
    name: "transition",
    component: Transition,
    meta: {
      name: "Transition",
    },
  },
  {
    path: "/statemachine/process/:processId",
    name: "process",
    component: Process,
    meta: {
      name: "Process",
    },
  },
  {
    path: "/statemachine/criteria/:criteriaId",
    name: "criteria",
    component: Criteria,
    meta: {
      name: "Criteria",
    },
  },
  {
    path: "/statemachine/state/:stateId",
    name: "state",
    component: State,
    meta: {
      name: "State",
    },
  },
  {
    path: "/statemachine/instances",
    name: "instances",
    component: Instances,
    meta: {
      name: "Instances",
    },
  },
  {
    path: "/statemachine/instances/:entityId",
    name: "InstancesDetailView",
    component: InstancesDetailView,
    meta: {
      name: "InstancesDetailView",
    },
  },
];

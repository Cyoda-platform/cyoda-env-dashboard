import CachesListView from "../views/CachesListView.vue";
import NetworkInfoView from "../views/NetworkInfoView.vue";
import ZooKeeperInfoView from "../views/ZooKeeperInfoView.vue";
import ConfigEditor from "../views/ConfigEditor.vue";
import ConfigEditorStreamReports from "../views/ConfigEditorStreamReports.vue";
import ConfigEditorSimple from "../views/ConfigEditorSimple.vue";
import ConfigEditorStream from "../views/ConfigEditorStream.vue";
import Home from "@cyoda/ui-lib/src/components-library/elements/Home/Home.vue";
import CatalogOfAliases from "../views/CatalogOfAliases.vue";
import CompositeIndexes from "../views/CompositeIndexes.vue";
import PageEntityViewer from "../views/PageEntityViewer.vue";

export default [
  {
    path: "/http-api/login",
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
    path: "/",
    redirect: "/http-api",
  },
  {
    path: "/login",
    redirect: "/http-api/login",
  },
  {
    path: "/http-api/",
    name: "home",
    component: Home,
  },
  {
    path: "/http-api/catalog-of-aliases",
    name: "CatalogOfAliases",
    component: CatalogOfAliases,
    meta: {
      name: "Catalogue of Aliases",
    },
  },
  {
    path: "/http-api/composite-indexes",
    name: "CompositeIndexes",
    component: CompositeIndexes,
  },
  {
    path: "/http-api/entity-viewer",
    name: "EntityViewer",
    component: PageEntityViewer,
    meta: {
      name: "Entity Viewer",
    },
  },
  {
    path: "/http-api/config-editor",
    name: "ConfigEditor",
    component: ConfigEditor,
    meta: {
      keepAlive: true,
      name: "Report config editor",
    },
  },
  {
    path: "/http-api/config-editor-stream-reports",
    name: "ConfigEditorStreamReports",
    component: ConfigEditorStreamReports,
    meta: {
      keepAlive: true,
      name: "Stream Reports",
    },
  },
  {
    path: "/http-api/config-editor-simple/:id",
    name: "config-editor-simple",
    component: ConfigEditorSimple,
    meta: {
      name: "Edit Distributed Report",
    },
  },
  {
    path: "/http-api/config-editor-stream/:id",
    name: "config-editor-stream",
    component: ConfigEditorStream,
    meta: {
      name: "Edit Stream Report",
    },
  },
  {
    path: "/http-api/caches-list",
    name: "caches-list",
    component: CachesListView,
  },
  {
    path: "/http-api/network-info",
    name: "network-info",
    component: NetworkInfoView,
  },
  {
    path: "/http-api/zk-info",
    name: "zk-info",
    component: ZooKeeperInfoView,
  },
];

import DataMapperIndex from "../views/DataMapper/DataMapperIndex.vue";
import DataMapperEdit from "../views/DataMapper/DataMapperEdit.vue";
import DataSourceConfigCreationIndex from "../views/DataSourceConfigCreation/DataSourceConfigCreationIndex.vue";
import DataSourceConfigCreationEdit from "../views/DataSourceConfigCreation/DataSourceConfigCreationEdit.vue";
import DataChainingIndex from "../views/DataChaining/DataChainingIndex.vue";
import Home from "@cyoda/ui-lib/src/components-library/elements/Home/Home.vue";
import DataChainingEdit from "../views/DataChaining/DataChainingEdit.vue";
import Page404 from "../views/Page404.vue";
import DataManagementDashboardIndex from "../views/DataManagementDashboard/DataManagementDashboardIndex.vue";
import ToolsIndex from "../views/Tools/ToolsIndex.vue";

export default [
    {
        path: "/404",
        name: "404",
        component: Page404,
    },
    {
        path: "/menu",
        component: Home,
        meta: {
            layout: "base-menu-wrapper",
        },
    },
    {
        path: "/login",
        name: "login",
        meta: {
            layout: "login",
            name: "Login",
            isPublic: true,
        },
        component: () => import("../views/LoginView.vue"),
    },
    {
        path: "/",
        redirect: "/data-mapper",
    },
    {
        path: "/data-mapper",
        name: "DataMapperIndex",
        meta: {
            layout: "sidebar",
            name: "Data mappings",
            isPublic: false,
        },
        component: DataMapperIndex,
    },
    {
        path: "/data-mapper/configuration",
        name: "DataMapperConfiguration",
        meta: {
            layout: "sidebar",
            name: "Data Mapper Configuration",
            isPublic: false,
        },
        component: DataMapperEdit,
    },
    {
        path: "/data-mapper/configuration/:id",
        name: "DataMapperConfigurationEdit",
        meta: {
            layout: "sidebar",
            name: "Data Mapper Configuration Edit",
            isPublic: false,
            isDataWasChangedAndNotSaved: false,
        },
        component: DataMapperEdit,
    },
    {
        path: "/data-mapper/data-source-config-creation",
        name: "DataSourceConfigCreation",
        meta: {
            layout: "sidebar",
            name: "Connectors",
            isPublic: false,
        },
        component: DataSourceConfigCreationIndex,
    },
    {
        path: "/data-mapper/data-source-config-creation/configuration",
        name: "DataSourceConfigCreationEdit",
        meta: {
            layout: "sidebar",
            name: "Data Source Config Creation",
            isPublic: false,
        },
        component: DataSourceConfigCreationEdit,
    },
    {
        path: "/data-mapper/data-source-config-creation/configuration/:id",
        name: "DataSourceConfigCreationEditById",
        meta: {
            layout: "sidebar",
            name: "Data Source Config Creation Edit",
            isPublic: false,
        },
        component: DataSourceConfigCreationEdit,
    },
    {
        path: "/data-mapper/chaining",
        name: "DataChaining",
        meta: {
            layout: "sidebar",
            name: "Chaining",
            isPublic: false,
        },
        component: DataChainingIndex,
    },
    {
        path: "/data-mapper/chaining/configuration",
        name: "DataChainingEdit",
        meta: {
            layout: "sidebar",
            name: "Chaining",
            isPublic: false,
        },
        component: DataChainingEdit,
    },
    {
        path: "/data-mapper/chaining/configuration/:id",
        name: "DataChainingEditById",
        meta: {
            layout: "sidebar",
            name: "Data Chaining Edit By Id",
            isPublic: false,
        },
        component: DataChainingEdit,
    },
    {
        path: "/data-mapper/data-management-dashboard",
        name: "DataManagementDashboard",
        meta: {
            layout: "sidebar",
            name: "Data Management Dashboard",
            isPublic: false,
        },
        component: DataManagementDashboardIndex
    },
    {
        path: "/data-mapper/tools",
        name: "ToolsIndex",
        meta: {
            layout: "sidebar",
            name: "Tools",
            isPublic: false,
        },
        component: ToolsIndex,
    },
    // { path: "*", redirect: "/404" },
];

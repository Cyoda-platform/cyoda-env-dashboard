<template>
  <div class="config-editor-reports">
    <div class="flex-buttons">
      <div>
        <el-tooltip :show-after="500" class="item" effect="dark" content="Creating a new configuration"
                    placement="top">
          <el-button @click="onModalCreateNewVisible" type="warning">
            <font-awesome-icon icon="plus" />
            Create New
          </el-button>
        </el-tooltip>
      </div>
      <ExportImport :dataToExport="dataToExport" type="reports" />
      <el-divider direction="vertical" />
      <el-tooltip :show-after="500" class="item" effect="dark" content="Reset state: filters, table settings, etc."
                  placement="top">
        <el-button class="reset-button" @click="onResetState" type="primary">
          <font-awesome-icon :icon="['fas', 'arrows-rotate']" />
          Reset state
        </el-button>
      </el-tooltip>
    </div>

    <ConfigEditorReportsFilter
      ref="configEditorReportsFilterRef"
      cacheKey="configEditorReports:filterForm"
      v-model="filterForm"
      :usersOptions="usersOptions"
      :entityOptions="entityOptions"
    />
    <el-divider />

    <data-tables
      :key="tableKeyId"
      @headerDragend="onHeaderDragend"
      @sortChange="onSortChange"
      class="ab-style"
      :table-props="{
            border: true
      }"
      v-model:pageSize="form.pageSize"
      v-model:currentPage="form.currentPage"
      :pagination-props="{ pageSizes: [5, 10, 20, 50] }"
      ref="tableReportRef"
      :data="tableData"
      @row-click="rowClick"
      @selection-change="handleSelectionChange" size="small" :row-class-name="tableRowClassName"
      v-loading="tableReportLoading" style="width: 100%">
      <el-table-column type="selection"></el-table-column>
      <el-table-column sortable prop="name" label="Config"></el-table-column>
      <el-table-column sortable prop="description" label="Description"></el-table-column>
      <el-table-column sortable width="200" prop="entityClassNameLabel" label="Type"></el-table-column>
      <el-table-column sortable width="150" prop="username" label="User"></el-table-column>
      <el-table-column sortable width="150" prop="createdHuman" label="Created"></el-table-column>
      <el-table-column fixed="right" width="320" label="Action">
        <template v-slot:default="scope">
          <el-button size="default" @click="onEditReport(scope.row)" type="primary">
            <font-awesome-icon icon="pencil-alt" />
          </el-button>
          <el-button size="default" @click="onModalSaveAs(scope.row)" type="primary">
            <font-awesome-icon icon="copy" />
          </el-button>
          <el-button size="default" :loading="scope.row.loadingReportButton" @click="onRunReport(scope.row)"
                     type="primary">
            <font-awesome-icon icon="play" />
          </el-button>
          <el-button size="default" v-if="scope.row.loadingReportButton && scope.row.reportExecutionTime > 1"
                     @click="onCancelReport(scope.row)" type="danger">
            <font-awesome-icon icon="stop" />
          </el-button>
          <el-button @click="onDelete(scope.row)" size="default" type="danger">
            <font-awesome-icon icon="trash" />
          </el-button>
        </template>
      </el-table-column>
    </data-tables>
    <ConfigEditorSaveAs ref="configEditorSaveAsRef" />
    <ConfigEditorNew title="Create New Report Definition" @create="onCreateNewConfig" ref="configEditorNewRef" />
  </div>
</template>

<script setup lang="ts">
import { useRouter } from "vue-router";
import { ref, computed, watch, onBeforeUnmount, reactive } from "vue";

import * as api from "@cyoda/ui-lib/src/api";
import type { IGetHistoryQueryParams } from "@cyoda/ui-lib/src/api";
import type { IDefinitionContent, ItemHistory, RunningReport, User } from "@cyoda/ui-lib/src/types/types";
import moment from "moment";
import _ from "lodash";
import HelperFormat from "@cyoda/ui-lib/src/helpers/HelperFormat";
import ConfigEditorSaveAs from "./popup/ConfigEditorSaveAs.vue";
import ConfigEditorNew from "./popup/ConfigEditorNew.vue";
import HelperReportDefinition from "../../helpers/HelperReportDefinition";

import ConfigEditorReportsFilter from "./ConfigEditorReportsFilter.vue";
import { ElTableColumn, ElTable, ElNotification, ElMessageBox } from "element-plus";
import type { ConfigEditorNewForm, ConfigEditorReportsTableDataRow } from "./type";
import ExportImport from "@cyoda/ui-lib/src/components-library/elements/ExportImport/ExportImport.vue";
import { useReportsStore } from "../../stores/reports";
import eventBus from "@cyoda/ui-lib/src/plugins/eventBus";
import { useTableSaveStateMixin } from "@cyoda/ui-lib/src/mixins/TableSaveStateMixin";
import HelperStorage from "@cyoda/cobi/src/helpers/HelperStorage";
import HelperFeatureFlags from "@cyoda/ui-lib/src/helpers/HelperFeatureFlags.ts";
import HelperEntities from "@cyoda/ui-lib/src/helpers/HelperEntities.ts";

const storage = new HelperStorage();
const emit = defineEmits(["change", "resetState"]);
const router = useRouter();
const reportsStore = useReportsStore();
const tableKeyId = ref(0);
const entityData = ref([]);

const runningReports = computed(() => {
  return reportsStore.runningReports;
});

const configEditorReportsFilterRef = ref(null);

const form = reactive({
  filter: "",
  currentPage: 1,
  pageSize: 10
});

const tableData = computed(() => {
  let tableDataData = definitions.value.map((report) => {
    const history = runningReports.value.find((el) => el.configName === report.gridConfigFields.id) || ({} as RunningReport);
    let name = report.gridConfigFields.id.split("-").slice(2).join("-");

    let entityClassNameLabel = report.gridConfigFields.type;
    if (HelperFeatureFlags.isUseModelsInfo()) {
      const entityRow = entityData.value.find(el => el.name.includes(report.gridConfigFields.type));
      if(entityRow) entityClassNameLabel += ` (${HelperEntities.entityTypeMapper(entityRow.type)})`;
    }

    return {
      id: report.gridConfigFields.id,
      groupingVersion: history.groupingVersion,
      name,
      entity: report.gridConfigFields.type,
      entityClassNameLabel,
      username: (report.gridConfigFields.user && report.gridConfigFields.user.username) || "",
      description: report.gridConfigFields.description,
      loadingReportButton: history.status === "RUNNING",
      created: report.gridConfigFields.creationDate || "",
      createdHuman: report.gridConfigFields.creationDate ? moment(report.gridConfigFields.creationDate).format("YYYY-MM-DD HH:mm") : "",
      reportId: history && history.reportId,
      reportExecutionTime: history.reportId ? 2 : 0
    };
  });

  tableDataData = HelperReportDefinition.applyFiltersForReportTables(
    tableDataData,
    filterForm.value
  );
  return tableDataData;
});
const usersOptions = computed(() => {
  let users = definitions.value
    .filter((report) => report.gridConfigFields.user)
    .map((report) => {
      return {
        value: report.gridConfigFields.user && report.gridConfigFields.user.username,
        label: report.gridConfigFields.user && report.gridConfigFields.user.username
      };
    });
  return _.uniqBy(users, "value");
});
const entityOptions = computed(() => {
  let aliases = definitions.value.map((report) => {
    return {
      value: report.gridConfigFields.type,
      label: report.gridConfigFields.type
    };
  });
  return _.uniqBy(aliases, "value");
});
const dataToExport = computed(() => {
  return multipleSelection.value.map((el) => el.id);
});

function runReport(id) {
  return reportsStore.runReport(id);
}

function cancelReport(row) {
  return reportsStore.cancelReport(row);
}

const configEditorSaveAsRef = ref(null);

const configEditorNewRef = ref(null);

const tableReportRef = ref(null);

const { onHeaderDragend, onSortChange } = useTableSaveStateMixin("configEditorReports:table", tableReportRef, form);

const filterForm = ref({});
let multipleSelection = ref([]);

let definitions = ref([]);

const definitionId = ref<string>("");
const tableReportLoading = ref<boolean>(false);

function tableRowClassName({ row }: {
  row: ConfigEditorReportsTableDataRow
}) {
  if (row.id === definitionId.value) {
    return "success-row";
  }
  return "";
}

async function loadPreConfigDefinition(definitionId: string) {
  const path: api.IGetDefinitionPathParams = {
    definition: definitionId
  };
  const { data } = await api.getDefinition({ path });
  return data.content;
}

(async () => {
  loadDefinitions();
  loadEntities();
  eventBus.$on("closedImportExport:reports", loadDefinitions);
})();

onBeforeUnmount(() => {
  eventBus.$off("closedImportExport:reports", loadDefinitions);
});

async function rowClick(row: ConfigEditorReportsTableDataRow, column: ElTableColumn) {
  if (column.label !== "Action") {
    tableReportRef.value.elTableRef.setCurrentRow(row);
    definitionId.value = row.id;
    const definition = await loadPreConfigDefinition(row.id);
    emit("change", definition);
  }
}

async function loadEntities() {
  const { data } = await api.getReportingFetchTypes(true);
  entityData.value = data;
}

async function loadDefinitions() {
  const params: api.IGetDefinitionsQueryParams = {
    fields: ["id", "description", "type", "userId", "creationDate"],
    size: 999
  };

  const { data } = await api.getDefinitions({ params });

  if (data) {
    definitions.value = (data._embedded && data._embedded.gridConfigFieldsViews) || [];

    const userIds = definitions.value.map((el) => el.gridConfigFields.userId);
    const { data: dataUsers } = await api.usersList(_.uniq(userIds));
    definitions.value = definitions.value.map((el) => {
      el.gridConfigFields.user = dataUsers.find((dataUser: User) => dataUser.userId === el.gridConfigFields.userId);
      return el;
    });
  }
}

async function getAvgReportsTime(definitionId: string) {
  const reportHistoryFieldsViews: ItemHistory[] = await getLatestSuccessReportByDefinition(definitionId);

  const times: number[] = [];
  await Promise.all(
    reportHistoryFieldsViews.map(async (el) => {
      const { data } = await api.getStats(el.reportHistoryFields.id, el.reportHistoryFields.groupingVersion);
      const createTime = moment(data.createTime);
      const finishTime = moment(data.finishTime);
      const duration = moment.duration(finishTime.diff(createTime));
      times.push(duration.asMilliseconds());
    })
  );
  const mean = _.mean(times);
  const d = moment.duration(Math.ceil(mean), "milliseconds");
  return HelperFormat.getTimeFromMomentDuration(d);
}

async function onRunReport(row: ConfigEditorReportsTableDataRow) {
  row.loadingReportButton = true;
  const result = await runReport(row.id);
  row.loadingReportButton = result;
}

async function onCancelReport(row: ConfigEditorReportsTableDataRow) {
  cancelReport(row);
}

function onEditReport(row: ConfigEditorReportsTableDataRow) {
  router.push(`/http-api/config-editor-simple/${encodeURIComponent(row.id)}`);
}

async function onModalSaveAs(row: ConfigEditorReportsTableDataRow) {
  configEditorSaveAsRef.value.definitionId = row.id;
  configEditorSaveAsRef.value.dialogVisible = true;
}

function onModalCreateNewVisible() {
  configEditorNewRef.value.dialogVisible = true;
  configEditorNewRef.value.active = 0;
}

function onResetState() {
  configEditorReportsFilterRef.value.resetForm();
  storage.deleteByKey("tableSaveState:configEditorReports:table");
  tableKeyId.value += 1;
  emit("resetState");
}

async function onCreateNewConfig(form: ConfigEditorNewForm) {
  configEditorNewRef.value.loading = true;
  let configDefinition: IDefinitionContent = HelperReportDefinition.reportDefinition();
  configDefinition.description = form.description;
  configDefinition.requestClass = form.requestClass;
  configDefinition["@bean"] = "com.cyoda.service.api.beans.ReportDefinition";
  configDefinition.condition = {
    "@bean": "com.cyoda.core.conditions.GroupCondition",
    operator: "OR",
    conditions: []
  };
  try {
    const { data } = await api.createDefinitions(form.name, configDefinition);
    configEditorNewRef.value.dialogVisible = false;
    ElNotification({
      title: "Success",
      message: "New Report Was Created",
      type: "success"
    });

    eventBus.$emit("updateDefinitions");
    loadDefinitions();
    router.push(`/http-api/config-editor-simple/${data.content}?isNew=true`);
  } finally {
    configEditorNewRef.value.loading = false;
  }
}

async function getLatestSuccessReportByDefinition(configName: string) {
  const params: IGetHistoryQueryParams = {
    report_name: configName,

    fields: ["id", "configName", "reportFailed", "createTime", "type", "description", "userId"],

    success: "on"
  };

  const { data } = await api.getReportHistory({ params });

  if (data && data._embedded && data._embedded.reportHistoryFieldsViews.length > 0) {
    const { reportHistoryFieldsViews } = data._embedded;
    return reportHistoryFieldsViews;
  }
  return [];
}

function onDelete(row) {
  ElMessageBox.confirm(`Do you really want to delete this record?`, "Confirm", {
    callback: async (action) => {
      if (action === "confirm") {
        try {
          await api.deleteProcessingReport(row.id);
          loadDefinitions();
        } catch (e) {
          if (e.message.indexOf("Cannot delete config")) {
            showConfirmWithExistReports(`${e.response.data.detail} Do you want delete with reports?`, row);
            return;
          }
        }
      }
    }
  });
}

function showConfirmWithExistReports(message, row) {
  ElMessageBox.confirm(message, "Warning", {
    confirmButtonText: "Yes",
    type: "warning",
    callback: async (action) => {
      if (action === "confirm") {
        await api.deleteProcessingReport(row.id, "cascade");
        loadDefinitions();
      }
    }
  });
}

function handleSelectionChange(val: ConfigEditorReportsTableDataRow[]) {
  multipleSelection.value = val;
}

watch(definitionId, (val: string) => {
  const row = tableData.value.find((el) => el.id === val);
  tableReportRef.value.elTableRef.setCurrentRow(row);
});

defineExpose({ tableRowClassName, loadPreConfigDefinition });
</script>

<style lang="scss">
.config-editor-reports {
  .el-table .success-row {
    background: #f0f9eb;
  }

  .search {
    width: 100%;
    margin-bottom: 15px;
  }

  .flex-buttons {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    flex-wrap: nowrap;
    margin-bottom: 15px;
  }

  .flex {
    display: flex;
    margin-bottom: 15px;

    .search-toolbar {
      width: 300px;
      margin-right: 15px;
    }
  }

  h1.label {
    font-size: 22px;
    margin-left: 0;
    padding-left: 0;
  }
}
</style>

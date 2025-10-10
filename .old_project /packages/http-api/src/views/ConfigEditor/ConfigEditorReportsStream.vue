<template>
  <div class="config-editor-reports">
    <div class="flex-buttons">
      <el-button @click="onModalCreateNewVisible" type="warning">
        <font-awesome-icon icon="plus" />
        Create New
      </el-button>
      <ExportImport :dataToExport="dataToExport" type="reportsStream" />
      <el-divider direction="vertical" />
      <el-button class="reset-button" @click="onResetState" type="primary">
        <font-awesome-icon :icon="['fas', 'arrows-rotate']" />
        Reset state
      </el-button>
    </div>

    <ConfigEditorReportsFilter
      ref="configEditorReportsFilterRef"
      v-model="filterForm"
      cacheKey="configEditorReportsStream:filterForm"
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
      size="small"
      :row-class-name="tableRowClassName" v-loading="tableReportLoading" style="width: 100%"
      @selection-change="handleSelectionChange">
      <el-table-column type="selection"></el-table-column>
      <el-table-column sortable prop="name" label="Config"></el-table-column>
      <el-table-column sortable prop="description" label="Description"></el-table-column>
      <el-table-column sortable prop="entityClassNameLabel" label="Type"></el-table-column>
      <el-table-column sortable width="150" prop="username" label="User"></el-table-column>
      <el-table-column sortable width="150" prop="createdHuman" label="Created"></el-table-column>
      <el-table-column fixed="right" width="250" label="Action">
        <template v-slot:default="scope">
          <el-button size="default" @click="onEditReport(scope.row)" type="primary">
            <font-awesome-icon icon="pencil-alt" />
          </el-button>
          <el-button size="default" :loading="scope.row.loadingReportButton" @click="onRunReport(scope.row)"
                     type="primary">
            <font-awesome-icon icon="play" />
          </el-button>
          <el-button size="default" :loading="scope.row.deleteLoading" @click="onRemoveReport(scope.row)"
                     type="danger">
            <font-awesome-icon icon="trash" />
          </el-button>
          <el-button size="default" v-if="scope.row.loadingReportButton && scope.row.reportExecutionTime > 1"
                     @click="onCancelReport(scope.row)" type="danger">
            <font-awesome-icon icon="stop" />
          </el-button>
        </template>
      </el-table-column>
    </data-tables>
    <ConfigEditorNew title="Create New Stream Data Report Definition" :hideFields="hideFields"
                     @create="onCreateNewConfig" ref="configEditorNewRef" />
    <ConfigEditorReportsStreamGrid ref="configEditorReportsStreamGridRef" :isDeleteAvailable="true" />
  </div>
</template>

<script setup lang="ts">
import { useRouter } from "vue-router";
import { ref, computed, onBeforeUnmount, watch , reactive } from "vue";

import ConfigEditorNew from "./popup/ConfigEditorNew.vue";
import HelperReportDefinition from "../../helpers/HelperReportDefinition";
import * as api from "@cyoda/ui-lib/src/api";
import ConfigEditorReportsStreamGrid
  from "@cyoda/ui-lib/src/components-library/patterns/ConfigEditor/ConfigEditorReportsStreamGrid.vue";
import moment from "moment";
import ConfigEditorReportsFilter from "./ConfigEditorReportsFilter.vue";
import _ from "lodash";
import { ElMessageBox, ElNotification, ElTable, ElTableColumn } from "element-plus";
import type { IDefinitionStream } from "@cyoda/ui-lib/src/types/types";
import type { ConfigEditorReportsStreamTableDataRow, ConfigEditorNewForm } from "./type";
import ExportImport from "@cyoda/ui-lib/src/components-library/elements/ExportImport/ExportImport.vue";
import eventBus from "@cyoda/ui-lib/src/plugins/eventBus";
import { useTableSaveStateMixin } from "@cyoda/ui-lib/src/mixins/TableSaveStateMixin";
import HelperStorage from "@cyoda/cobi/src/helpers/HelperStorage";
import HelperFeatureFlags from "@cyoda/ui-lib/src/helpers/HelperFeatureFlags.ts";
import HelperEntities from "@cyoda/ui-lib/src/helpers/HelperEntities.ts";

const form = reactive({
  filter: "",
  currentPage: 1,
  pageSize: 10
});
const storage = new HelperStorage();
const emit = defineEmits(["change"]);
const router = useRouter();
const entityData = ref([]);

const tableData = computed(() => {
  let tableData = definitions.value
    .map((report) => {

      const entity = HelperEntities.getShortNameOfEntity(report.streamDataDef.requestClass);
      let entityClassNameLabel = entity;
      if (HelperFeatureFlags.isUseModelsInfo()) {
        const entityRow = entityData.value.find(el => el.name === report.streamDataDef.requestClass);
        if (entityRow) entityClassNameLabel += ` (${HelperEntities.entityTypeMapper(entityRow.type)})`;
      }

      return {
        id: report.id,
        name: report.name,
        username: report.owner,
        deleteLoading: false,
        loadingReportButton: false,
        description: report.description || "",
        createdHuman: moment(report.createDate).format("YYYY-MM-DD HH:mm"),
        created: report.createDate,
        entity,
        entityClassNameLabel,
      };
    })
    .reverse();

  tableData = HelperReportDefinition.applyFiltersForReportTables(tableData, filterForm.value);

  return tableData;
});
const usersOptions = computed(() => {
  let users = definitions.value.map((report) => {
    return {
      value: report.owner,
      label: report.owner
    };
  });
  return _.uniqBy(users, "value");
});
const entityOptions = computed(() => {
  let aliases = definitions.value.map((report) => {
    const entity = HelperEntities.getShortNameOfEntity(report.streamDataDef.requestClass);
    return {
      value: entity,
      label: entity
    };
  });
  return _.uniqBy(aliases, "value");
});
const dataToExport = computed(() => {
  return multipleSelection.value.map((el) => el.id);
});

const configEditorNewRef = ref(null);
const tableReportRef = ref(null);
const { onHeaderDragend, onSortChange } = useTableSaveStateMixin("configEditorReportsStream:table", tableReportRef, form);

const configEditorReportsStreamGridRef = ref(null);
const tableKeyId = ref(0);
const configEditorReportsFilterRef = ref(null);

let hideFields = ref({
  description: true,
  valuationPointTime: false
});

const tableReportLoading = ref<boolean>(false);
const definitionId = ref<string>("");
let definitions = ref([]);
const defaultFilterForm = {
  status: [],
  authors: [],
  times: [],
  entities: [],
  time_custom: "",
  search: ""
};
const filterForm = ref({});

let multipleSelection = ref([]);

function onModalCreateNewVisible() {
  configEditorNewRef.value.dialogVisible = true;
  configEditorNewRef.value.active = 0;
}

function onResetState() {
  configEditorReportsFilterRef.value.resetForm();
  storage.deleteByKey("tableSaveState:configEditorReportsStream:table");
  tableKeyId.value += 1;
}

(async function() {
  loadData();
  loadEntities();
  eventBus.$on("closedImportExport:reportsStream", loadData);
})();

onBeforeUnmount(() => {
  eventBus.$off("closedImportExport:reportsStream", loadData);
});

function handleSelectionChange(val: ConfigEditorReportsStreamTableDataRow[]) {
  multipleSelection.value = val;
}

async function loadData() {
  try {
    tableReportLoading.value = true;
    const { data } = await api.getStreamDefinitions();
    definitions.value = data;
  } finally {
    tableReportLoading.value = false;
  }
}

async function rowClick(row: ConfigEditorReportsStreamTableDataRow, column: ElTableColumn) {
  if (column.label !== "Action") {
    tableReportRef.value.elTableRef.setCurrentRow(row);
    definitionId.value = row.id;
    const definition = definitions.value.find((el) => el.id === row.id);
    emit("change", definition);
  }
}

function tableRowClassName({ row }: {
  row: ConfigEditorReportsStreamTableDataRow
}) {
  if (row.id === definitionId.value) {
    return "success-row";
  }
  return "";
}

async function onCreateNewConfig(form: ConfigEditorNewForm) {
  configEditorNewRef.value.loading = true;
  let configDefinition: IDefinitionStream = {
    name: form.name,
    description: form.description,
    streamDataDef: {
      ...HelperReportDefinition.reportSteamDefinition().streamDataDef,
      requestClass: form.requestClass,
      condition: {
        "@bean": "com.cyoda.core.conditions.GroupCondition",
        operator: "OR",
        conditions: []
      },
      rangeCondition: {
        "@bean": "com.cyoda.core.conditions.queryable.GreaterThan",
        fieldName: "creationDate",
        operation: "GREATER_THAN",
        value: {
          "@type": "java.util.Date",
          value: moment().format("YYYY-MM-DD[T]00:00:00.SSSZ")
        }
      }
    }
  };
  try {
    const { data } = await api.createStreamDefinitions(configDefinition);
    if (data) {
      configEditorNewRef.value.dialogVisible = false;
      ElNotification({
        title: "Success",
        message: "New Report Was Created",
        type: "success"
      });
      router.push(`/http-api/config-editor-stream/${data}?isNew=true`);
    }
  } finally {
    configEditorNewRef.value.loading = false;
  }
}

function onEditReport(row: ConfigEditorReportsStreamTableDataRow) {
  router.push(`/http-api/config-editor-stream/${row.id}`);
}

function onRemoveReport(row: ConfigEditorReportsStreamTableDataRow) {
  ElMessageBox.confirm("Do you really want to remove?", "Confirm!", {
    callback: async (action) => {
      if (action === "confirm") {
        try {
          row.deleteLoading = true;
          await api.deleteStreamDefinitions(row.id);
          loadData();
        } finally {
          row.deleteLoading = false;
        }
      }
    }
  });
}

async function onRunReport(row: ConfigEditorReportsStreamTableDataRow) {
  try {
    row.loadingReportButton = true;
    configEditorReportsStreamGridRef.value.definitionId = row.id;
    configEditorReportsStreamGridRef.value.dialogVisible = true;
  } finally {
    row.loadingReportButton = false;
  }
}

async function loadEntities() {
  const { data } = await api.getReportingFetchTypes(true);
  entityData.value = data;
}

watch(filterForm, () => {
  storage.set("configEditorReportsStream:filterForm", filterForm.value);
}, { deep: true });
</script>

<style lang="scss">
.config-editor-reports {
  h1 {
    margin-bottom: 15px;
  }
}
</style>

<template>
  <div class="config-editor">
    <h2 class="heading h1">{{ pageTitle }}</h2>

    <ConfigEditorAlertAliasSameName :configDefinition="configDefinition" />

    <el-tabs v-loading="updateReportLoading" type="border-card">
      <el-tab-pane label="Model">
        <ConfigEditorReportsTabModelling :configDefinition="configDefinition" />
      </el-tab-pane>
      <el-tab-pane label="Columns">
        <ConfigEditorReportsTabColumn :cols="cols" :configDefinition="configDefinition" />
      </el-tab-pane>
      <el-tab-pane>
        <template #label>
          <span :class="{ 'has-error': showErrors }">FilterBuilder</span>
        </template>
        <ConfigEditorReportsTabFilterBuilder :showErrors="showErrors" :cols="cols" :configDefinition="configDefinition" />
      </el-tab-pane>
      <el-tab-pane label="Sorting">
        <ConfigEditorReportsTabSorting :cols="cols" :configDefinition="configDefinition" />
      </el-tab-pane>
      <el-tab-pane label="Grouping">
        <ConfigEditorReportsTabGrouping :cols="cols" :configDefinition="configDefinition" />
      </el-tab-pane>
      <el-tab-pane label="Summary">
        <ConfigEditorReportsTabSummary :cols="cols" :configDefinition="configDefinition" />
      </el-tab-pane>
      <el-tab-pane label="JSON">
        <ConfigEditorReportsTabJson v-model:configDefinition="configDefinition" />
      </el-tab-pane>
    </el-tabs>

    <div class="actions">
      <el-button type="primary" @click="onBack">
        <font-awesome-icon icon="long-arrow-alt-left" />
        Back
      </el-button>

      <el-button v-if="!configDefinition.singletonReport" @click="updateReport" type="success" :loading="updateReportLoading">
        <font-awesome-icon icon="save" />
        Update
      </el-button>

      <el-button v-else :loading="!!runningReport" @click="updateRunReport" type="warning">
        <font-awesome-icon icon="play" />
        Update and Run
      </el-button>

      <el-button v-if="runningReport && runningReport.reportExecutionTime > 1" @click="stopReport" type="danger">
        <font-awesome-icon icon="stop" />
        Stop
      </el-button>

      <FilterBuilderQueryPlan :configDefinition="configDefinition" />
      <ConfigEditorDialogExistReports ref="configEditorDialogExistReportsRef" :configDefinition="configDefinition" :definitionId="definitionId" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ElNotification } from "element-plus";
import { useRouter, useRoute } from "vue-router";
import {ref, computed, watch, onBeforeUnmount, toRaw, nextTick} from "vue";

import ConfigEditorTransfer from "./ConfigEditor/ConfigEditorTransfer.vue";
import * as api from "@cyoda/ui-lib/src/api";
import ConfigEditorReportsTabColumn from "./ConfigEditor/tabs/ConfigEditorReportsTabColumn.vue";
import ConfigEditorReportsTabSorting from "./ConfigEditor/tabs/ConfigEditorReportsTabSorting.vue";
import ConfigEditorReportsTabSummary from "./ConfigEditor/tabs/ConfigEditorReportsTabSummary.vue";
import ConfigEditorReportsTabJson from "./ConfigEditor/tabs/ConfigEditorReportsTabJson.vue";
import ConfigEditorReportsTabGrouping from "./ConfigEditor/tabs/ConfigEditorReportsTabGrouping.vue";
import ConfigEditorReportsTabFilterBuilder from "./ConfigEditor/tabs/ConfigEditorReportsTabFilterBuilder.vue";
import HelperReportDefinition from "../helpers/HelperReportDefinition";
import ConfigEditorReportsTabModelling from "./ConfigEditor/tabs/ConfigEditorReportsTabModelling.vue";
import HelperConstants from "../helpers/HelperConstants";

import FilterBuilderQueryPlan from "@cyoda/ui-lib/src/components-library/patterns/FilterBuilder/QueryPlan/FilterBuilderQueryPlan.vue";
import ConfigEditorDialogExistReports from "./ConfigEditor/ConfigEditorDialogExistReports.vue";
import ConfigEditorAlertAliasSameName from "./ConfigEditorAlertAliasSameName.vue";
import HelperErrors from "../helpers/HelperErrors";
import {useReportsStore} from "../stores/reports";
import eventBus from "@cyoda/ui-lib/src/plugins/eventBus";

const route = useRoute();
const router = useRouter();
const reportsStore = useReportsStore();
const runningReports = computed(() => {
  return reportsStore.runningReports;
});
const cols = computed(() => {
  return HelperReportDefinition.buildCols(configDefinition.value);
});
const runningReport = computed(() => {
  return runningReports.value.find((el) => el.configName === definitionId.value)!;
});
const pageTitle = computed(() => {
  return `Edit Distributed Report: ${definitionId.value.split("-").slice(2).join("-")}`;
});
function runReport(definitionId) {
  return reportsStore.runReport(definitionId);
}

function cancelReport(runningReport) {
  return reportsStore.cancelReport(runningReport);
}

const configEditorDialogExistReportsRef = ref(null);

const definitionId = ref<string>("");
const selectedReportPreConfig = ref<string>("");

const updateReportLoading = ref<boolean>(false);
const saveAsReportLoading = ref<boolean>(false);
const showErrors = ref<boolean>(false);

let configDefinition = ref(HelperReportDefinition.reportDefinition());

loadPreConfigDefinition(route.params.id);

eventBus.$on("validate", onValidate);

onBeforeUnmount(() => {
  eventBus.$off("validate", onValidate);
});

function onValidate() {
  const validate = HelperReportDefinition.validateConfigDefinition(configDefinition.value.condition.conditions || []);
  showErrors.value = !validate;
}

async function loadPreConfigDefinition(definitionIdValue: string) {
  definitionId.value = definitionIdValue;
  const path: api.IGetDefinitionPathParams = {
    definition: definitionIdValue
  };
  const { data } = await api.getDefinition({ path });

  let copyConfigDefinition = JSON.stringify(data.content);
  const reSimple = new RegExp(`"${HelperConstants.SIMPLE_COLUMN_SHORT}"`, "g");
  const reAlias = new RegExp(`"${HelperConstants.ALIAS_COLUMN_SHORT}"`, "g");
  copyConfigDefinition = copyConfigDefinition.replace(reSimple, `"${HelperConstants.SIMPLE_COLUMN}"`);
  copyConfigDefinition = copyConfigDefinition.replace(reAlias, `"${HelperConstants.ALIAS_COLUMN}"`);

  configDefinition.value = {...configDefinition.value, ...JSON.parse(copyConfigDefinition)};
}

async function updateReport() {
  showErrors.value = false;
  const copyConfigDefinition = JSON.parse(JSON.stringify(configDefinition.value));
  const validate = HelperReportDefinition.validateConfigDefinition(copyConfigDefinition.condition.conditions);

  if (validate) {
    updateReportLoading.value = true;
    try {
      const { data } = await api.updateDefinitions(definitionId.value, copyConfigDefinition, {
        muteErrors: true
      });
      if (data) {
        ElNotification({
          title: "Success",
          message: `Report was Updated`,
          type: "success"
        });
        return true;
      } else {
        ElNotification({ type: "error", title: "Error", message: "Error during update" });
      }
    } catch (e: any) {
      if (e.response.status === 422) {
        configEditorDialogExistReportsRef.value.dialogVisible = true;
        return false;
      } else {
        HelperErrors.handler(e);
        return false;
      }
    } finally {
      showErrors.value = false;
      updateReportLoading.value = false;
    }
  } else {
    ElNotification({
      title: "Error",
      message: `Report contain errors. Please check forms`,
      type: "error"
    });
    showErrors.value = true;
  }
}

async function updateRunReport() {
  const result = await updateReport();
  if (result) {
    runReport(definitionId.value);
  }
}

function stopReport() {
  cancelReport(runningReport.value);
}

watch(definitionId, (val: string) => {
  loadPreConfigDefinition(val);
});

function onBack() {
  router.push("/http-api/config-editor");
}

defineExpose({updateReport});
</script>

<style lang="scss">
.config-editor {
  margin-top: 20px;

  h2 {
    margin-bottom: 15px;
  }

  .container--2cols {
    display: grid;
    grid-template-columns: 1fr 1fr;
  }

  .actions {
    margin-top: 20px;

    button {
      margin-right: 10px;
    }
  }

  .el-tabs .el-tabs__item .has-error {
    color: #f56c6c;
  }
}
</style>

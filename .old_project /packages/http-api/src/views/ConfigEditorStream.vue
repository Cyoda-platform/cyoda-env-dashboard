<template>
  <div class="config-editor-stream">
    <div class="flex-heading">
      <h2 class="heading h1">
        {{ pageTitle }}
      </h2>
      <el-tooltip placement="top" :content="indexSpeed.description">
        <span class="speed-exec">
          Execution
          <i
            :class="{
              warning: indexSpeed.speed === 'warning',
              success: indexSpeed.speed === 'success',
              default: indexSpeed.speed === 'default'
            }"
          ></i>
        </span>
      </el-tooltip>
    </div>

    <ConfigEditorAlertAliasSameName :configDefinition="configDefinition" />

    <el-tabs v-loading="updateReportLoading" type="border-card">
      <el-tab-pane label="Model">
        <CyodaModellingRangeDefs :configDefinitionColRanges="configDefinitionColRanges" @changeConfigDefinitionColRanges="onChangeConfigDefinitionColRanges" :configDefinition="configDefinition" />
        <hr />
        <ConfigEditorReportsTabModelling :configDefinition="configDefinition" />
      </el-tab-pane>
      <el-tab-pane label="Columns">
        <ConfigEditorReportsTabColumn :cols="cols" :configDefinition="configDefinition" />
      </el-tab-pane>
      <el-tab-pane>
        <template #label>
        <span :class="{ 'has-error': showErrors || showErrorsRange }">FilterBuilder</span>
        </template>
        <h2>Settings</h2>
        <FilterBuilderGroup :showErrors="showErrors" :level="0" :cols="cols" :condition="configDefinition.condition" />

        <el-divider></el-divider>

        <h2>Range Settings</h2>
        <el-form :inline="true">
          <el-form-item label="Range Order">
            <el-select v-model="configDefinition.rangeOrder" placeholder="Range Order">
              <el-option key="ASC" label="ASC" value="ASC" />
              <el-option key="DESC" label="DESC" value="DESC" />
            </el-select>
          </el-form-item>
        </el-form>
        <div class="filter-builder-condition" v-if="Object.keys(configDefinition.rangeCondition).length > 0">
          <FilterBuilderCondition :disableRemove="true" :conditionTypesKeysAvailable="conditionTypesKeysAvailable" :condition="configDefinition.rangeCondition" builderId="RangeCondition" :disableColumn="true" :showErrors="showErrorsRange" :cols="colsRange" />
        </div>
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

      <el-button @click="updateReport" type="success" :loading="updateReportLoading">
        <font-awesome-icon icon="save" />
        Update
      </el-button>

      <el-button @click="updateRunReport" type="warning">
        <font-awesome-icon icon="play" />
        Update and Run
      </el-button>
      <FilterBuilderQueryPlan :configDefinition="configDefinition" />
    </div>
    <ConfigEditorReportsStreamGrid ref="configEditorReportsStreamGridRef" :isDeleteAvailable="true" />
  </div>
</template>

<script setup lang="ts">
import { ElNotification } from "element-plus";
import { useRouter, useRoute } from "vue-router";
import {ref, computed, watch, onBeforeUnmount, provide} from "vue";

import ConfigEditorTransfer from "./ConfigEditor/ConfigEditorTransfer.vue";
import ConfigEditorReportsTabColumn from "./ConfigEditor/tabs/ConfigEditorReportsTabColumn.vue";
import ConfigEditorReportsTabSorting from "./ConfigEditor/tabs/ConfigEditorReportsTabSorting.vue";
import ConfigEditorReportsTabSummary from "./ConfigEditor/tabs/ConfigEditorReportsTabSummary.vue";
import ConfigEditorReportsTabJson from "./ConfigEditor/tabs/ConfigEditorReportsTabJson.vue";
import ConfigEditorReportsTabGrouping from "./ConfigEditor/tabs/ConfigEditorReportsTabGrouping.vue";
import ConfigEditorReportsTabFilterBuilder from "./ConfigEditor/tabs/ConfigEditorReportsTabFilterBuilder.vue";
import type { ColDef } from "@cyoda/ui-lib/src/types/types";
import HelperReportDefinition from "../helpers/HelperReportDefinition";
import ConfigEditorReportsTabModelling from "./ConfigEditor/tabs/ConfigEditorReportsTabModelling.vue";
import FilterBuilderGroup from "@cyoda/ui-lib/src/components-library/patterns/FilterBuilder/FilterBuilderGroup.vue";
import FilterBuilderCondition from "@cyoda/ui-lib/src/components-library/patterns/FilterBuilder/FilterBuilderCondition.vue";
import FilterBuilderQueryPlan from "@cyoda/ui-lib/src/components-library/patterns/FilterBuilder/QueryPlan/FilterBuilderQueryPlan.vue";

import HelperFilter from "@cyoda/ui-lib/src/components-library/patterns/FilterBuilder/HelperFilter";
import ConfigEditorReportsStreamGrid from "@cyoda/ui-lib/src/components-library/patterns/ConfigEditor/ConfigEditorReportsStreamGrid.vue";
import * as api from "@cyoda/ui-lib/src/api";
import CyodaModellingRangeDefs from "./ConfigEditor/tabs/CyodaModelling/CyodaModellingRangeDefs.vue";
import _ from "lodash";
import ConfigEditorAlertAliasSameName from "./ConfigEditorAlertAliasSameName.vue";
import eventBus from "@cyoda/ui-lib/src/plugins/eventBus";

provide('isDeleteAvailable', true);
const route = useRoute();
const router = useRouter();
const cols = computed(() => {
  return HelperReportDefinition.buildCols(configDefinition.value);
});
const colsRange = computed(() => {
  return configDefinitionColRanges.value.map((el) => {
    return {
      colType: "colDef",
      alias: el.fullPath,
      typeShort: el.colType.split(".").pop() || "",
      type: el.colType,
      "@bean": "com.cyoda.core.reports.columns.ReportSimpleColumn"
    };
  });
});
const indexSpeed = computed(() => {
  const allRangeFields = indexList.value.map((el) => el.rangeField.columnPath);
  const allSelectedCols = configDefinition.value.condition.conditions && configDefinition.value.condition.conditions.length > 0 && configDefinition.value.condition.conditions.map((el) => "fieldName" in el && el.fieldName).filter((el) => el);
  if (allRangeFields.includes(configDefinition.value.rangeCondition.fieldName) && allSelectedCols && allSelectedCols.length === 0) {
    return {
      speed: "success",
      description: `You select range index "${configDefinition.value.rangeCondition.fieldName}" and condition is empty. Query will be fast`
    };
  }

  if (configDefinition.value.rangeCondition.fieldName && configDefinition.value.condition && configDefinition.value.condition.conditions && configDefinition.value.condition.conditions.length > 0) {
    const indexField = indexList.value.find((el) => el.rangeField.columnPath === configDefinition.value.rangeCondition.fieldName);
    if (indexField) {
      const allNoneRangeFieldsIndex = indexField.noneRangeFields.map((el) => el.columnPath);
      const allSelectedColumns = (configDefinition.value.condition && configDefinition.value.condition.conditions?.map((el) => "fieldName" in el && el.fieldName)) || [];
      const diff = _.difference(allNoneRangeFieldsIndex, allSelectedColumns);
      const diffReverse = _.difference(allSelectedColumns, allNoneRangeFieldsIndex);
      if (diff.length > 0) {
        return {
          speed: "warning",
          description: `You need add ${diff.join(", ")} to condition for quick query`
        };
      } else if (diffReverse.length > 0) {
        return {
          speed: "warning",
          description: `You selected a lot of condition: ${diffReverse.join(", ")}. Query may be slow`
        };
      } else {
        return {
          speed: "success",
          description: `For range condition "${configDefinition.value.rangeCondition.fieldName}" you selected all required non range fields: ${allNoneRangeFieldsIndex.join(", ")}. Query will be fast`
        };
      }
    } else {
      return {
        speed: "default",
        description: `${configDefinition.value.rangeCondition.fieldName} not contains in list of indexes and request can be slow`
      };
    }
  }

  return {
    speed: "default",
    description: "Please select any range condition and condition"
  };
});
const pageTitle = computed(() => {
  return `Edit Stream Report: ${copyConfigDefinition.value.name || ""}`;
});

const configEditorReportsStreamGridRef = ref(null);

const definitionId = ref<string>("");
const updateReportLoading = ref<boolean>(false);
const showErrors = ref<boolean>(false);
const showErrorsRange = ref<boolean>(false);
let copyConfigDefinition = ref({});
let indexList = ref([]);

let conditionTypesKeysAvailable = HelperReportDefinition.rangeConditionTypes;

let configDefinition = ref(HelperReportDefinition.reportSteamDefinition().streamDataDef);

let configDefinitionColRanges = ref([]);

(async function () {
  await loadPreConfigDefinition(route.params.id);
  checkIndex();
  eventBus.$on("validate", onValidate);
  eventBus.$on("validateRangeCondition", onValidateRange);
})();

onBeforeUnmount(() => {
  eventBus.$off("validate", onValidate);
  eventBus.$off("validateRangeCondition", onValidateRange);
});

function onValidate() {
  const validate = HelperReportDefinition.validateConfigDefinition(configDefinition.value.condition.conditions || []);
  showErrors.value = !validate;
}

function onValidateRange() {
  const validate = HelperReportDefinition.validateConfigDefinition(configDefinition.value.condition.conditions || []);
  showErrorsRange.value = !validate;
}

async function checkIndex() {
  const { data } = await api.getStreamDefinitionsIndex(configDefinition.value.requestClass);
  indexList.value = data;
}

async function loadPreConfigDefinition(definitionIdValue: string) {
  definitionId.value = definitionIdValue;
  const { data } = await api.getStreamDefinition(definitionIdValue);
  configDefinition.value = Object.assign({}, configDefinition.value, data.streamDataDef);
  copyConfigDefinition.value = data;
  if (configDefinition.value.rangeCondition) {
    configDefinitionColRanges.value = [
      {
        fullPath: configDefinition.value.rangeCondition.fieldName,
        colType: (typeof configDefinition.value.rangeCondition.value === "object" && configDefinition.value.rangeCondition.value["@type"]) || ""
      }
    ];
  } else {
    configDefinition.value["rangeCondition"] = HelperFilter.getCondition();
  }
}

async function updateReport() {
  if (configDefinition.value.columns.length === 0) {
    ElNotification({
      title: "Warning",
      message: "Please select minimum one column",
      type: "warning"
    });
    return false;
  }
  showErrors.value = false;
  showErrorsRange.value = false;
  const configDefinitionLocal = JSON.parse(JSON.stringify(configDefinition.value));
  const validate = HelperReportDefinition.validateConfigDefinition(configDefinitionLocal.condition.conditions);

  const validateRange = !!configDefinitionLocal.rangeCondition["@bean"];

  if (validate && validateRange) {
    const saveData = JSON.parse(JSON.stringify(copyConfigDefinition.value));
    saveData.streamDataDef = configDefinition.value;
    updateReportLoading.value = true;
    try {
      await api.updateStreamDefinitions(definitionId.value, saveData);
      ElNotification({
        title: "Success",
        message: `Report was Updated`,
        type: "success"
      });
      return true;
    } finally {
      showErrors.value = false;
      showErrorsRange.value = false;
      updateReportLoading.value = false;
    }
  } else {
    ElNotification({
      title: "Error",
      message: `Report contain errors. Please check forms`,
      type: "error"
    });
    showErrors.value = !validate;
    showErrorsRange.value = !validateRange;
  }
}

function onBack() {
  router.push("/http-api/config-editor-stream-reports");
}

async function updateRunReport() {
  const result = await updateReport();
  if (result) {
    configEditorReportsStreamGridRef.value.definitionId = definitionId.value;
    configEditorReportsStreamGridRef.value.dialogVisible = true;
  }
}

function onChangeConfigDefinitionColRanges(data: ColDef[]) {
  configDefinitionColRanges.value = data;
  if (data && data.length > 0) {
    configDefinition.value.rangeCondition.fieldName = data[0].fullPath;
  } else {
    configDefinition.value["rangeCondition"] = HelperFilter.getCondition();
  }
}

watch(
  configDefinition.condition,
  () => {
    if ((!configDefinition.value.condition || configDefinition.value.condition.conditions?.length === 0) && route.query.isNew) {
      configDefinition.value.condition = HelperFilter.getGroup();
    }
  },
  { immediate: true }
);
</script>

<style lang="scss">
.config-editor-stream {
  margin-top: 20px;

  .el-form-item__content{
    width: 220px;
  }

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

  .filter-builder-condition {
    .builder-condition-row {
      &:before,
      &:after {
        display: none;
      }
    }

    .el-select {
      width: 100% !important;
    }
  }

  .flex-heading {
    display: flex;
    justify-content: space-between;
  }

  .speed-exec {
    font-size: 16px;
    font-weight: normal;

    i {
      width: 20px;
      height: 20px;
      border-radius: 20px;
      display: inline-block;
      vertical-align: middle;
      position: relative;
      top: -2px;

      &.success {
        background-color: green;
      }

      &.warning {
        background-color: orange;
      }

      &.default {
        background-color: #ddd;
      }
    }
  }
}
</style>

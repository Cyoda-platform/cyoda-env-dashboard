<template>
  <div class="filter-builder-query-plan">
    <el-button class="run-button" :disabled="isValid" @click="onRunExecutionPlan" type="info">
      Query Plan
      <font-awesome-icon icon="tasks" />
    </el-button>
    <el-dialog :close-on-click-modal="false" title="Query Plan" v-model="dialogVisible" width="90%">
      <template v-if="queryPlan && queryPlan.optimized">
        <template v-if="isReportSpeedSlow">
          <el-alert title="Will be done full table scan (Very slow)" type="error" effect="dark" :closable="false"> </el-alert>
        </template>
        <template v-else>
          <el-alert title="Report will use indexes and execute quickly" type="success" :closable="false"> </el-alert>
        </template>
      </template>
      <div class="wrap-buttons">
        <el-radio-group v-model="viewType">
          <el-radio-button label="optimized">Optimized</el-radio-button>
          <el-radio-button label="original">Original</el-radio-button>
        </el-radio-group>
      </div>

      <template v-if="viewType === 'optimized'">
        <FilterBuilderQueryPlanDetail v-if="queryPlan.optimized" :queryPlan="queryPlan.optimized" title="Optimized" description="Some conditions Cyoda platform can optimize and this condition will be execute" />
      </template>

      <template v-if="viewType === 'original'">
        <FilterBuilderQueryPlanDetail v-if="queryPlan.original" :queryPlan="queryPlan.original" title="Original" description="This condition shown as it is and before optimization" />
      </template>
      <template #footer>
      <span class="dialog-footer">
        <el-button @click="dialogVisible = false">Close</el-button>
      </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";

import * as api from "../../../../api";
import { IDefinitionContent } from "@/types/types";
import FilterBuilderQueryPlanDetail from "./FilterBuilderQueryPlanDetail.vue";
import HelperReportDefinition from "@cyoda/http-api/src/helpers/HelperReportDefinition";

const props = defineProps({
  configDefinition: {
    default: () => {
      return {};
    }
  }
});
const isReportSpeedSlow = computed(() => {
  if (queryPlan.value.optimized) {
    return JSON.stringify(queryPlan.value.optimized).indexOf('"ALL"') > -1;
  }
  return false;
});
const isValid = computed(() => {
  return !HelperReportDefinition.validateConfigDefinition(props.configDefinition.condition.conditions);
});

const dialogVisible = ref<boolean>(false);
const isLoading = ref<boolean>(false);
let queryPlan = ref({
  optimized: {},
  original: {}
});

const viewType = ref<string>("optimized");

async function onRunExecutionPlan() {
  try {
    dialogVisible.value = true;
    isLoading.value = true;

    const { data } = await api.queryPlan(props.configDefinition.condition, props.configDefinition.requestClass, props.configDefinition.aliasDefs);
    queryPlan.value = data;
  } finally {
    isLoading.value = false;
  }
}
</script>

<style lang="scss">
.filter-builder-query-plan {
  display: inline-block;

  .run-button {
    margin-left: 10px;
  }

  .el-dialog__body {
    padding-top: 0;
    padding-bottom: 0;
  }

  .wrap-buttons {
    margin-top: 10px;
    margin-bottom: 20px;
  }
}
</style>

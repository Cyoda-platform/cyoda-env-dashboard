<template>
  <div class="instances-detail-view">
    <h1 class="title">
      Instances
      <template v-if="workflow?.name">
        / {{ workflow?.name }}
      </template>
      <br/>
      <span>ID: {{ selectedRow?.id }} | Model: {{ requestClass.split('.').pop() }}</span>
    </h1>
    <el-tabs v-model="selectedTab" v-loading="loading">
      <el-tab-pane label="Details" name="details">
        <template v-if="isShowDetailJson">
          <DetailJson
              v-if="selectedRow && selectedRow.id"
              :key="keys.details"
              :id="selectedRow.id"
              :requestClass="requestClass"
          />
        </template>
        <template v-else>
          <Detail
              v-if="selectedRow && selectedRow.id"
              :isShowDetailTransitions="false"
              :key="keys.details"
              :id="selectedRow.id"
              :requestClass="requestClass"
              :entity="entity"/>
        </template>
      </el-tab-pane>
      <el-tab-pane v-if="currentWorkflowId" label="Workflow" name="workflow">
        <Workflow
            :key="keys.workflow"
            :workflowId="currentWorkflowId"
            :entityClassName="requestClass"
            :id="selectedRow.id"
            :persistedType="persistedType"
            :entity="entity"
        />
      </el-tab-pane>
      <el-tab-pane label="Audit" name="dataAudit" v-if="selectedRow && selectedRow.id">
        <TransitionChangesTable :key="keys.dataAudit" :disableLink="true" :type="requestClass"
                                :entityId="selectedRow.id"/>
      </el-tab-pane>
      <el-tab-pane label="Data lineage" name="dataLineage">
        <template v-if="selectedRow && selectedRow.id">
          <DataLineage :key="keys.dataLineage" :requestClass="requestClass" :id="selectedRow.id"/>
        </template>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script setup lang="ts">
import TransitionChangesTable
  from "@cyoda/ui-lib/src/components-library/patterns/PmTransitionChanges/TransitionChangesTable.vue";
import Detail from "@cyoda/ui-lib/src/components-library/patterns/AdaptableBlotter/AdaptableBlotterEntity/Detail.vue";
import Workflow
  from "@cyoda/ui-lib/src/components-library/patterns/AdaptableBlotter/AdaptableBlotterEntity/Workflow.vue";
import DataLineage from "@cyoda/ui-lib/src/components-library/patterns/DataLineage/DataLineage.vue";
import {computed, onMounted, ref, watch} from "vue";
import {useRoute} from "vue-router";
import * as api from "@cyoda/ui-lib/src/api";
import HelperDetailEntity from "@cyoda/ui-lib/src/helpers/HelperDetailEntity";
import {useStatemachineStore} from "../stores/statemachine";
import HelperFeatureFlags from "@cyoda/ui-lib/src/helpers/HelperFeatureFlags.ts";
import DetailJson
  from "@cyoda/ui-lib/src/components-library/patterns/AdaptableBlotter/AdaptableBlotterEntity/DetailJson.vue";

const loading = ref<boolean>(false);
const route = useRoute();
const selectedTab = ref<string>("details");
const workflowEnabledTypes = ref([])
let selectedRow = ref({});
let entity = ref([]);
let workflow = ref({});
selectedRow.value = {id: route.params.entityId};

const requestClass = route.query.entityClassName;
const currentWorkflowId = route.query.currentWorkflowId;
const persistedType = route.query.persistedType;
const statemachineStore = useStatemachineStore();

const isShowDetailJson = computed(() => {
  if (!HelperFeatureFlags.isUseModelsInfo() || !HelperFeatureFlags.isEntityViewerUseJson()) return false;
  const entityRow = workflowEnabledTypes.value.find(item => item.name === requestClass);
  if (!entityRow) return false;
  return entityRow.type === 'BUSINESS';
})

let keys = ref({
  details: 0,
  dataLineage: 0,
  dataAudit: 0,
  workflow: 0,
});

async function loadData() {
  const id = route.params.entityId;
  if (!requestClass || !id) return;
  loading.value = true;
  try {
    const {data} = await api.getEntityLoad(id!, requestClass);
    entity.value = HelperDetailEntity.filterData(data);
  } finally {
    loading.value = false;
  }
}

async function loadWorkflowsData() {
  const {data} = await statemachineStore.getWorkflowEnabledTypes()
  workflowEnabledTypes.value = data
}

async function loadWorkflow() {
  if (!persistedType || !currentWorkflowId) return;
  const {data} = await statemachineStore.getWorkflow(persistedType, currentWorkflowId);
  workflow.value = data;
}

onMounted(() => {
  loadData();
  loadWorkflow();
  loadWorkflowsData();
})

watch(selectedTab, (key) => {
  keys.value[key] += 1;
});
</script>

<style scoped lang="scss">
.instances-detail-view {
  .title {
    font-size: 32px;
    color: #148751;

    span {
      font-size: 25px;
      color: #909399;
    }
  }
}
</style>

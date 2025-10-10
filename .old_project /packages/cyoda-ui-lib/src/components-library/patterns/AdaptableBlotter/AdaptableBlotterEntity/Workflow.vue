<template>
  <div v-loading="isLoading" class="workflow">
    <DetailTransitions :entity="entity" :id="id" :entityClass="entityClassName" />
    <hr />
    <GSMap
      ref="gsMapRef"
      :workflowId="workflowId"
      :positionsMap="positionsMap"
      :transitionsList="transitionsList"
      :criteriaList="criteriaList"
      :processesList="processesList"
      :isReadonly="true"
      :currentState="getValueFromColumn('state')"
      minHeight="500px"
    >
      <template #map-controls="slotProps">
        <GSMapControls :isAvailbaleAddButton="false" @fitGraph="slotProps.fitGraph" @zoomIn="slotProps.zoomIn"
                       @zoomOut="slotProps.zoomOut"
                       @panLeft="slotProps.panLeft" @panRight="slotProps.panRight" @panTop="slotProps.panTop"
                       @panBottom="slotProps.panBottom" @toggleFullscreen="slotProps.toggleFullscreen"
                       @createTransition="slotProps.createTransition" :isFullscreen="slotProps.isFullscreen" />
      </template>
    </GSMap>
  </div>
</template>

<script setup lang="ts">
import GSMap from "../../GraphicalStatemachineMap/GraphicalStatemachineMap.vue";
import { computed, nextTick, onMounted, ref, useTemplateRef } from "vue";
import { useGraphicalStatemachineStore } from "@cyoda/statemachine/src/stores/graphicalStatemachine";
import { useStatemachineStore } from "@cyoda/statemachine/src/stores/statemachine";
import DetailTransitions from "./DetailTransitions.vue";
import GSMapControls from "../../GraphicalStatemachineMapControls/GraphicalStatemachineMapControls.vue";

const props = defineProps({
  workflowId: { type: String, default: "" },
  entityClassName: { type: String, default: "" },
  persistedType: { type: String, default: "" },
  id: { type: String, default: "" },
  entity: {
    default: () => {
      return [];
    }
  }
});

const isLoading = ref(false);
const graphicalStatemachineStore = useGraphicalStatemachineStore();
const statemachineStore = useStatemachineStore();

const processesList = ref([]);
const gsMapRef = useTemplateRef("gsMapRef");
const criteriaList = ref([]);
const transitionsList = ref([]);
const positionsMap = computed(() => {
  return graphicalStatemachineStore.positionsMap;
});

async function loadProcessesList() {
  const { data } = await statemachineStore.getProcessesList(props.entityClassName);
  processesList.value = data;
}

async function loadCriteriaList() {
  const { data } = await statemachineStore.getCriteriaList(props.entityClassName);
  criteriaList.value = data;
}

async function loadTransitionsList() {
  const { data } = await statemachineStore.getTransitionsList(props.persistedType, props.workflowId);
  transitionsList.value = data.Data;
}

function getPositionsMap(arg: object) {
  return graphicalStatemachineStore.getPositionsMap(arg);
}

async function init() {
  await getPositionsMap({ workflowId: props.workflowId });
  await Promise.all([loadProcessesList(), loadCriteriaList(), loadTransitionsList()]);
}

function getValueFromColumn(name: string) {
  const column = props.entity.find((el) => {
    return el.columnInfo.columnName === name;
  });
  if (column && column.value) {
    return column.value;
  } else {
    return "-";
  }
}

onMounted(async () => {
  isLoading.value = true;
  await init();
  isLoading.value = false;
  nextTick(() => {
    gsMapRef!.value.toggleEdgesTitles(false);
  });
});
</script>

<style lang="scss" scoped>
</style>

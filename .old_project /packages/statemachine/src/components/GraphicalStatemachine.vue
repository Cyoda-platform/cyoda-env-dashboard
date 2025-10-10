<template>
  <GS
    :workflowId="workflowId"
    :positionsMap="positionsMap"
    :transitionsList="transitionsList"
    :criteriaList="criteriaList"
    :processesList="processesList"
    :persistedType="persistedType"
    :entityClassName="entityClassName"
    @updatePositionsMap="updatePositionsMap"/>
</template>

<script setup lang="ts">
import {ref, computed, onMounted, onBeforeUnmount} from "vue";

import GS from "@cyoda/ui-lib/src/components-library/patterns/GraphicalStatemachine/GraphicalStatemachine.vue";
import {useStatemachineStore} from "../stores/statemachine";
import {useGraphicalStatemachineStore} from "../stores/graphicalStatemachine";
import eventBus from "@cyoda/ui-lib/src/plugins/eventBus";

const namespace: string = "statemachine";

const props = defineProps({
  workflowId: {
    default: null,
  },
  persistedType: {
    default: "",
  },
  entityClassName: {
    default: "",
  }
})

const statemachineStore = useStatemachineStore();
const graphicalStatemachineStore = useGraphicalStatemachineStore();
const processesList = ref([]);
const criteriaList = ref([]);
const transitionsList = ref([]);

const positionsMap = computed(() => {
  return graphicalStatemachineStore.positionsMap;
});

// const transitionsListFilteredByShowHide = computed(() => {
//   return graphicalStatemachineStore.transitionsListFilteredByShowHide;
// });

async function loadProcessesList() {
  const {data} = await statemachineStore.getProcessesList(props.entityClassName);
  processesList.value = data;
}

async function loadCriteriaList() {
  const {data} = await statemachineStore.getCriteriaList(props.entityClassName);
  criteriaList.value = data;
}

async function loadTransitionsList() {
  const {data} = await statemachineStore.getTransitionsList(props.persistedType, props.workflowId);
  transitionsList.value = data.Data;
}

onMounted(() => {
  init();
  eventBus.$on("graphicalStatemachine:reset", init);
})

onBeforeUnmount(() => {
  eventBus.$off("graphicalStatemachine:reset", init);
})

async function init() {
  await getPositionsMap({workflowId: props.workflowId});
  loadProcessesList();
  loadCriteriaList();
  loadTransitionsList();
}

function getPositionsMap(arg: object) {
  return graphicalStatemachineStore.getPositionsMap(arg);
}

function updatePositionsMap(arg: object) {
  return graphicalStatemachineStore.updatePositionsMap(arg);
}

const cy = ref(null);

function selectedLinkHref(selected: {
  id: string;
  type: string
}) {
  if (!selected || !selected.type) {
    return "";
  }

  return {
    name: selected.type,
    params: {[`${selected.type}Id`]: selected.id}
  };
}

defineExpose({cy});
</script>

<style lang="scss" scoped>
.info {
  text-align: center;

  &:not(:empty) {
    padding: 16px;
  }
}
</style>

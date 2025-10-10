<template>
  <div>
    <CyodaDataTablesDraggable @drop="onDropRow" :animate="300" handle=".handle">
      <el-table v-loading="isLoadingTable" size="small" :data="tableData" @header-dragend="onHeaderDragend"
                style="width: 100%" row-key="id" class="graphical-statemachine-transitions-list" border
                default-expand-all>
        <el-table-column label="" align="center" width="50">
          <template v-slot:default="scope">
            <font-awesome-icon class="handle" icon="align-justify"/>
          </template>
          <template #header>
            <font-awesome-icon class="refresh-order" @click="onClickRefreshOrder" icon="sync-alt"/>
          </template>
        </el-table-column>
        <el-table-column prop="transitionNameText" label="Transition" show-overflow-tooltip sortable width="115">
          <template v-slot:default="scope">
            <el-button :loading="scope.row.transitionNameLoading" type="primary" link
                       @click.prevent="onClickEditTransition(scope.row)">
              {{ scope.row.transitionNameText }}
            </el-button>
          </template>
        </el-table-column>
        <el-table-column prop="transitionStartStateText" label="Start state" show-overflow-tooltip sortable width="115">
          <template v-slot:default="scope">
            <template v-if="scope.row.persisted && scope.row.startStateLink">
              <el-button :loading="scope.row.startStateLoading" type="primary" link
                         @click.prevent="onClickEditState(scope.row, 'startStateId', 'startStateLoading')">
                {{ scope.row.startStateText }}
              </el-button>
            </template>
            <template v-else>
              {{ scope.row.startStateText }}
            </template>
          </template>
        </el-table-column>
        <el-table-column prop="transitionEndStateText" label="End state" show-overflow-tooltip sortable width="115">
          <template v-slot:default="scope">
            <template v-if="scope.row.persisted && scope.row.endStateLink">
              <el-button :loading="scope.row.endStateLoading" type="primary" link
                         @click.prevent="onClickEditState(scope.row, 'endStateId', 'endStateLoading')">
                {{ scope.row.endStateText }}
              </el-button>
            </template>
            <template v-else>
              {{ scope.row.endStateText }}
            </template>
          </template>
        </el-table-column>
        <el-table-column prop="transitionViewText" label="View" width="70">
          <template v-slot:default="scope">
            <el-button class="action toggle-button"
                       circle
                       size="default"
                       @mouseover="iconOver(scope.row)" @mouseleave="iconLeave(scope.row)"
                       @click="onToggleVisiable(scope.row)">
              <font-awesome-icon :icon="scope.row.showIcon"/>
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </CyodaDataTablesDraggable>

    <!--    Transition Form-->
    <el-dialog :close-on-click-modal="false" append-to-body v-if="dialogVisibleTransition"
               v-model="dialogVisibleTransition" width="90%" class="graphical-statemachine-transitions-list">
      <TransitionForm
        @submitted="onSubmittedTransition"
        @canceled="onCanceledTransition"
        :workflowId="props.workflowId"
        :persistedType="selectedPersistedType"
        :transitionId="selectedTransitionId"
        :entityClassName="props.entityClassName"
      />
    </el-dialog>

    <!--    State Form-->
    <el-dialog :close-on-click-modal="false" append-to-body v-if="dialogVisibleState" v-model="dialogVisibleState"
               width="90%" class="graphical-statemachine-transitions-list">
      <StateForm
        @submitted="onSubmittedState"
        :workflowId="props.workflowId"
        :stateId="selectedStateId"
        :persistedType="selectedPersistedType"
        :entityClassName="props.entityClassName"
      />
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import {useRoute} from "vue-router";
import {ref, computed, onBeforeUnmount, onMounted} from "vue";

import HelperStorage from "@cyoda/ui-lib/src/helpers/HelperStorage";
import TransitionForm from "@cyoda/ui-lib/src/components-library/patterns/TransitionForm/TransitionForm.vue";
import StateForm from "@cyoda/ui-lib/src/components-library/patterns/StateForm/StateForm.vue";
import eventBus from "../../../plugins/eventBus";
import {useStatemachineStore} from "@cyoda/statemachine/src/stores/statemachine";
import CyodaDataTablesDraggable from "../../elements/CyodaDataTables/CyodaDataTablesDraggable.vue";
import {getPersistedType} from "@cyoda/statemachine/src/helpers/HelperData";
import {useGraphicalStatemachineStore} from "@cyoda/statemachine/src/stores/graphicalStatemachine";

const helperStorage = new HelperStorage();

const props = defineProps({
  readOnly: {type: Boolean, default: false},
  workflowId: {type: String, default: ""},
  entityClassName: {type: String, default: ""},
  persistedType: {
    type: String,
    default: "",
  },
});
const route = useRoute();
const statemachineStore = useStatemachineStore();
const graphicalStatemachineStore = useGraphicalStatemachineStore();
const transitions = ref([]);

onMounted(() => {
  loadTransitionsList();
})

async function loadTransitionsList() {
  const {data} = await statemachineStore.getTransitionsList(props.persistedType, props.workflowId);
  transitions.value = data.Data;
}

const transitionsShowHideList = computed(() => {
  return graphicalStatemachineStore.transitionsShowHideList;
})

const tableData = computed(() => {
  const baseUrl = `/${route.params.workflowType}/${route.params.workflowTypePersisted}/workflows/${route.params.workflowId}`;

  let dataAll = transitions.value.map((transition) => {
    return {
      id: transition.id,
      persisted: transition.persisted,
      transitionNameText: transition.name,
      transitionNameLoading: false,
      transitionNameLink: `${baseUrl}/transitions/${transition.id}`,
      startStateText: transition.startStateName,
      startStateLink: transition.startStateName === "None" ? "" : `${baseUrl}/states/${transition.startStateId}`,
      startStateLoading: false,
      startStateId: transition.startStateId,
      endStateText: transition.endStateName,
      endStateLink: `${baseUrl}/states/${transition.endStateId}`,
      endStateLoading: false,
      endStateId: transition.endStateId,
      showIcon: transitionsShowHideList.value.includes(transition.id) ? 'eye-slash' : 'eye',
    };
  });

  if (orderTransitionsList.value.length > 0) {
    dataAll = dataAll.sort((a, b) => {
      return orderTransitionsList.value.indexOf(a.id) - orderTransitionsList.value.indexOf(b.id);
    });
  }
  return dataAll;
})

const addTransitionsShowHideList = (id) => {
  return graphicalStatemachineStore.addTransitionsShowHideList(id);
};

const removeTransitionsShowHideList = (id) => {
  return graphicalStatemachineStore.removeTransitionsShowHideList(id);
};

const clearTransitionsShowHideList = () => {
  return graphicalStatemachineStore.clearTransitionsShowHideList();
};

let orderTransitionsList = ref(helperStorage.get("orderTransitionsList", []));

const dialogVisibleTransition = ref<boolean>(false);
const selectedTransitionId = ref<string>("");
const transitionTitle = ref<string>("");
const isLoadingTable = ref<boolean>(false);

const dialogVisibleState = ref<boolean>(false);
const selectedStateId = ref<string>("");
const selectedPersistedType = ref<string>("");
eventBus.$on("transition:create", transitionCreate);
eventBus.$on("transition:update", transitionUpdate);
eventBus.$on("transition:delete", transitionDelete);
eventBus.$on("state:update", stateUpdate);


onBeforeUnmount(() => {
  clearTransitionsShowHideList();
  eventBus.$off("transition:create", transitionCreate);
  eventBus.$off("transition:update", transitionUpdate);
  eventBus.$off("transition:delete", transitionDelete);
  eventBus.$off("state:update", stateUpdate);
});


function onToggleVisiable({id}: {
  id: string
}) {
  if (transitionsShowHideList.value.includes(id)) {
    removeTransitionsShowHideList(id);
    eventBus.$emit("graphicalStatemachine:show-node", id);
  } else {
    addTransitionsShowHideList(id);
    eventBus.$emit("graphicalStatemachine:hide-node", id);
  }
}

function onHeaderDragend() {
  eventBus.$emit("graphicalStatemachine:resize");
}

function iconOver(row) {
  eventBus.$emit("graphicalStatemachine:over-node", row.id);
}

function iconLeave(row) {
  eventBus.$emit("graphicalStatemachine:leave-node", row.id);
}

function onDropRow(val) {
  const listOfIds = val.list.map((el) => el.id);
  helperStorage.set("orderTransitionsList", listOfIds);
}

function onClickRefreshOrder() {
  helperStorage.set("orderTransitionsList", []);
  orderTransitionsList.value = [];
}

function transitionCreate() {
  selectedTransitionId.value = "";
  selectedPersistedType.value = "persisted";
  dialogVisibleTransition.value = true;
}

function transitionUpdate(params) {
  onClickEditTransition(params);
}

async function transitionDelete(params) {
  await statemachineStore.deleteTransition(getPersistedType(params.persisted), props.workflowId, params.id)
  eventBus.$emit("graphicalStatemachine:reset");
  eventBus.$emit("graphicalStatemachine:resize");
}

async function onClickEditTransition(row) {
  selectedTransitionId.value = row.id;
  selectedPersistedType.value = getPersistedType(row.persisted);
  dialogVisibleTransition.value = true;
}

async function onSubmittedTransition(params) {
  if (params && params.url) {
    dialogVisibleTransition.value = false;
  }
  if (params.refreshChart) {
    eventBus.$emit("graphicalStatemachine:reset");
    eventBus.$emit("graphicalStatemachine:resize");
  }
  refreshData();
}

function onCanceledTransition() {
  dialogVisibleTransition.value = false;
}

async function refreshData() {
  isLoadingTable.value = true;
  try {
    await Promise.all([loadTransitionsList()])
    eventBus.$emit("graphicalStatemachine:reset");
    eventBus.$emit("graphicalStatemachine:resize");
  } finally {
    isLoadingTable.value = false;
  }
}

async function stateUpdate(params) {
  selectedStateId.value = params.id;
  selectedPersistedType.value = getPersistedType(params.persisted);
  dialogVisibleState.value = true;
}

async function onClickEditState(row: any, fieldId: string, fieldLoading: string) {
  try {
    row[fieldLoading] = true;
    selectedStateId.value = row[fieldId];
    selectedPersistedType.value = getPersistedType(row.persisted);
    dialogVisibleState.value = true;
  } finally {
    row[fieldLoading] = false;
  }
}

function onSubmittedState() {
  dialogVisibleState.value = false;
  refreshData();
}
</script>

<style lang="scss">
.graphical-statemachine-transitions-list .handle {
  cursor: pointer;
  transition: all 0.5s;

  &:hover {
    opacity: 0.5;
  }
}

.graphical-statemachine-transitions-list .refresh-order {
  cursor: pointer;
  transition: all 0.5s;

  &:hover {
    color: #000;
  }
}

.graphical-statemachine-transitions-list {
  .el-dialog__body {
    padding-top: 0;
  }

  .el-button.is-loading:before {
    background-color: transparent !important;
  }
}
</style>

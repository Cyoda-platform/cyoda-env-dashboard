<template>
  <div id="transitions-list" class="transitions-list">
    <div class="title">
      <h2>Transitions</h2>
      <div class="buttons">
        <el-button v-if="!isRuntime" @click="onAddNew" type="primary">
          <font-awesome-icon :icon="['fas', 'plus']"/>
          Create new transition
        </el-button>
        <el-button v-if="!isRuntime" @click="onShowState" type="primary">
          <font-awesome-icon :icon="['fas', 'rectangle-list']"/>
          List of states
        </el-button>
      </div>
    </div>

    <el-table v-loading="isLoading" :data="tableData" border style="width: 100%">
      <el-table-column prop="index" label="№" width="50">
        <template #default="{row}">
          <RouterLink :to="transitionLink(row)">
            <el-link type="primary">{{ row.index }}</el-link>
          </RouterLink>
        </template>
      </el-table-column>
      <el-table-column sortable prop="active" label="Active" width="150">
        <template v-slot:default="{ row }">
          <StateComponent :state="row.active"/>
        </template>
      </el-table-column>
      <el-table-column sortable prop="persisted" label="Persisted" width="150">
        <template v-slot:default="{ row }">
          <StateComponent :state="row.persisted"/>
        </template>
      </el-table-column>
      <el-table-column sortable prop="automated" label="Automated" width="150">
        <template v-slot:default="{ row }">
          <StateAutomatedComponent :state="row.automated"/>
        </template>
      </el-table-column>
      <el-table-column sortable prop="name" label="Transition">
        <template v-slot:default="{ row }">
          <RouterLink :to="transitionLink(row)">
            <el-link type="primary">{{ row.name }}</el-link>
          </RouterLink>
        </template>
      </el-table-column>
      <el-table-column sortable prop="startStateName" label="Start state">
        <template v-slot:default="{ row }">
          <template v-if="row.startStateName.toLowerCase()==='none' || !row.persisted">
            {{ row.startStateName }}
          </template>
          <RouterLink v-else :to="stateLink(row, 'startStateId')">
            <el-link type="primary">{{ row.startStateName }}</el-link>
          </RouterLink>
        </template>
      </el-table-column>
      <el-table-column sortable prop="endStateName" label="End state">
        <template v-slot:default="{ row }">
          <template v-if="row.persisted">
            <RouterLink :to="stateLink(row, 'endStateId')">
              <el-link type="primary">{{ row.endStateName }}</el-link>
            </RouterLink>
          </template>
          <template v-else>
            {{ row.endStateName }}
          </template>
        </template>
      </el-table-column>
      <el-table-column v-if="!isRuntime" label="Transition Actions" width="180">
        <template v-slot:default="{ row }">
          <el-button @click="onClickCopy(row)" type="primary" size="default">
            <font-awesome-icon :icon="['fas', 'copy']"/>
          </el-button>
          <el-button @click="onClickDelete(row)" type="danger" size="default">
            <font-awesome-icon :icon="['fas', 'trash']"/>
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <StatesListPopUp v-if="!isRuntime" ref="statesListPopUpRef" :persistedType="persistedType"
                     :workflowId="workflowId"/>
  </div>
</template>

<script setup lang="ts">
import {useStatemachineStore} from "../stores/statemachine";
import {computed, ref, onMounted, onBeforeUnmount} from "vue";
import StateComponent from "../components/States/StateComponent.vue";
import StateAutomatedComponent from "../components/States/StateAutomatedComponent.vue";
import {useRouter} from "vue-router";
import {ElMessageBox} from "element-plus";
import {getPersistedType} from "../helpers/HelperData";
import StatesListPopUp from "./StatesListPopUp.vue";
import eventBus from "@cyoda/ui-lib/src/plugins/eventBus";

const statemachineStore = useStatemachineStore();
const isLoading = ref(null);
const statesListPopUpRef = ref(null);

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

const transitionsList = ref([]);
const router = useRouter();

onMounted(() => {
  loadTransitionsList();
  eventBus.$on('transitions:reload', loadTransitionsList);
})

onBeforeUnmount(() => {
  eventBus.$off('transitions:reload', loadTransitionsList);
})

async function loadTransitionsList() {
  isLoading.value = true;
  try {
    const {data} = await statemachineStore.getTransitionsList(props.persistedType, props.workflowId);
    transitionsList.value = data.Data;
  } finally {
    isLoading.value = false;
  }
}

const tableData = computed(() => {
  return transitionsList.value.map((el, index) => {
    return {
      index: index + 1,
      ...el
    }
  })
});

function onAddNew() {
  router.push(`/statemachine/transition/new?workflowId=${props.workflowId}&persistedType=${props.persistedType}&entityClassName=${props.entityClassName}`);
}

function transitionLink(row) {
  const workflowId = row.workflowId || props.workflowId;
  return `/statemachine/transition/${row.id}?workflowId=${workflowId}&persistedType=${getPersistedType(row.persisted)}&entityClassName=${props.entityClassName}`;
}

function stateLink(row, stateField) {
  const workflowId = row.workflowId || props.workflowId;
  return `/statemachine/state/${row[stateField]}?workflowId=${workflowId}&persistedType=${getPersistedType(row.persisted)}&entityClassName=${props.entityClassName}`;
}

function onShowState() {
  statesListPopUpRef.value.dialogVisible = true;
}

async function onClickCopy(row) {
  try {
    isLoading.value = true;
    const {data} = await statemachineStore.getTransition(props.persistedType, props.workflowId, row.id);
    const dataForm = data.Data;
    delete dataForm.id;
    dataForm.name = `[ DUPLICATE ] ${dataForm.name}`;
    await statemachineStore.postTransition(props.persistedType, props.workflowId, dataForm);
    await loadTransitionsList();
  } finally {
    isLoading.value = false;
  }
}

function onClickDelete(row) {
  ElMessageBox.confirm("Are you sure you want to delete transition?", "Delete confirmation", {
    callback: async (action) => {
      if (action === "confirm") {
        try {
          isLoading.value = true;
          await statemachineStore.deleteTransition(props.persistedType, props.workflowId, row.id);
          await loadTransitionsList();
          eventBus.$emit('workflow:reload');
        } finally {
          isLoading.value = false;
        }
      }
    }
  });
}

const isRuntime = computed(() => {
  return props.persistedType === 'runtime';
});
</script>

<style scoped lang="scss">
.transitions-list {
  .title {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
}
</style>

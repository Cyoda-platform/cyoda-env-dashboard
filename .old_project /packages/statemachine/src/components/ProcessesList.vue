<template>
  <div id="processes-list" class="processes-list">
    <div class="title">
      <h2>Processes</h2>
      <div class="buttons">
        <el-button @click="onAddNew" type="primary">
          <font-awesome-icon :icon="['fas', 'plus']"/>
          Create new process
        </el-button>
      </div>
    </div>

    <el-table v-loading="isLoading" :data="tableData" border style="width: 100%">
      <el-table-column sortable prop="name" label="Name" width="300">
        <template v-slot:default="{ row }">
          <RouterLink :to="processLink(row)">
            <el-link type="primary">
              {{ row.name }}
            </el-link>
          </RouterLink>
        </template>
      </el-table-column>
      <el-table-column sortable prop="persisted" label="Persisted" width="150">
        <template v-slot:default="{ row }">
          <StateComponent :state="row.persisted"/>
        </template>
      </el-table-column>
      <el-table-column sortable prop="isTemplate" label="Template" width="150">
        <template v-slot:default="{ row }">
          <StateComponent :state="row.isTemplate"/>
        </template>
      </el-table-column>

      <el-table-column sortable prop="description" label="Description"/>

      <el-table-column label="Actions" width="180">
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
  </div>
</template>

<script setup lang="ts">
import {useStatemachineStore} from "../stores/statemachine";
import {computed, ref, onMounted} from "vue";
import StateComponent from "../components/States/StateComponent.vue";
import StateAutomatedComponent from "../components/States/StateAutomatedComponent.vue";
import {useRoute, useRouter} from "vue-router";
import {ElMessageBox} from "element-plus";
import axios from "@cyoda/ui-lib/src/plugins/axios";
import {getPersistedType} from "../helpers/HelperData";
import HelperProcesses from "@cyoda/ui-lib/src/helpers/HelperProcesses.ts";

const statemachineStore = useStatemachineStore();
const isLoading = ref(null);

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

const processesList = ref([]);
const router = useRouter();
const route = useRoute();

onMounted(async () => {
  loadProcessesList();
})

async function loadProcessesList() {
  const {data} = await statemachineStore.getProcessesList(props.entityClassName);
  processesList.value = data;
}

const tableData = computed(() => {
  return processesList.value;
});

function onAddNew() {
  router.push(`/statemachine/process/new?workflowId=${props.workflowId}&persistedType=persisted&entityClassName=${props.entityClassName}&workflowPersistedType=${props.persistedType}`);
}

function processLink(row) {
  return `/statemachine/process/${row.id.persistedId || row.id.runtimeId}?persistedType=${getPersistedType(row.persisted)}&entityClassName=${route.query.entityClassName}&workflowId=${props.workflowId}&workflowPersistedType=${props.persistedType}`;
}

async function onClickCopy(row) {
  try {
    isLoading.value = true;
    const {data} = await statemachineStore.getProcesses(getPersistedType(row.persisted), row.id.persistedId);
    const dataForm = HelperProcesses.format(data);
    delete dataForm.id;
    dataForm.name = `[ DUPLICATE ] ${dataForm.name}`;
    await statemachineStore.postProcesses(getPersistedType(row.persisted), dataForm);
    await loadProcessesList();
  } finally {
    isLoading.value = false;
  }
}

function onClickDelete(row) {
  ElMessageBox.confirm(`Are you sure you want to delete process "${row.name}"?`, "Delete confirmation", {
    callback: async (action) => {
      if (action === "confirm") {
        try {
          isLoading.value = true;
          await statemachineStore.deleteProcesses(getPersistedType(row.persisted), row.id.persistedId);
          await loadProcessesList();
        } finally {
          isLoading.value = false;
        }
      }
    }
  });
}
</script>

<style scoped lang="scss">
.processes-list {
  .title {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
}
</style>

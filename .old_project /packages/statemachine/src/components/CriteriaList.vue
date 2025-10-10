<template>
  <div id="criteria-list" class="criteria-list">
    <div class="title">
      <h2>Custom criteria</h2>
      <div class="buttons">
        <el-button @click="onAddNew" type="primary">
          <font-awesome-icon :icon="['fas', 'plus']"/>
          Create new criterion
        </el-button>
      </div>
    </div>

    <el-table v-loading="isLoading" :data="tableData" border style="width: 100%">
      <el-table-column sortable prop="name" label="Name" width="300">
        <template v-slot:default="{ row }">
          <RouterLink :to="criteriaLink(row)">
            <el-link type="primary">
              {{ row.name || row.id }}
            </el-link>
          </RouterLink>
        </template>
      </el-table-column>
      <el-table-column sortable prop="persisted" label="Persisted" width="150">
        <template v-slot:default="{ row }">
          <StateComponent :state="row.persisted"/>
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

const statemachineStore = useStatemachineStore();
const isLoading = ref(null);

const props = defineProps({
  persistedType: {
    default: "",
  },
  entityClassName: {
    default: "",
  },
  workflowId: {
    default: "",
  }
})

const criteriaList = ref([]);
const router = useRouter();
const route = useRoute();

onMounted(async () => {
  loadCriteriaList();
})

async function loadCriteriaList() {
  const {data} = await statemachineStore.getCriteriaList(props.entityClassName);
  criteriaList.value = data;
}

const tableData = computed(() => {
  return criteriaList.value;
});

function onAddNew() {
  router.push(`/statemachine/criteria/new?persistedType=persisted&entityClassName=${route.query.entityClassName}&workflowPersistedType=${props.persistedType}&workflowId=${props.workflowId}`);
}

function criteriaLink(row) {
  return `/statemachine/criteria/${row.id}?persistedType=${getPersistedType(row.persisted)}&entityClassName=${route.query.entityClassName}&workflowPersistedType=${props.persistedType}&workflowId=${props.workflowId}`;
}

async function onClickCopy(row) {
  try {
    isLoading.value = true;
    const {data} = await statemachineStore.getCriteria(getPersistedType(row.persisted), row.id);
    const dataForm = data;
    delete dataForm.id;
    dataForm.name = `[ DUPLICATE ] ${dataForm.name}`;
    await statemachineStore.postCriteria(getPersistedType(row.persisted), dataForm);
    await loadCriteriaList();
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
          await statemachineStore.deleteCriteria(getPersistedType(row.persisted), row.id);
          await loadCriteriaList();
        } finally {
          isLoading.value = false;
        }
      }
    }
  });
}
</script>

<style scoped lang="scss">
.criteria-list {
  .title {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
}
</style>

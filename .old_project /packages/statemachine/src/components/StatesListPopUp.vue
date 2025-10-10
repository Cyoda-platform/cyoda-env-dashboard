<template>
  <el-dialog
    v-model="dialogVisible"
    title="List of states"
    :close-on-click-modal="false"
  >
    <el-form :model="form" label-width="auto" style="max-width: 400px; margin-right: 15px">
      <el-form-item label="">
        <el-input v-model="form.filter" placeholder="Filter" clearable/>
      </el-form-item>
    </el-form>

    <el-table size="small" border :data="statesListComputed" stripe style="width: 100%"
              :default-sort="{ prop: 'creationDate', order: 'descending' }">
      <el-table-column prop="name" label="Name" sortable/>
      <el-table-column sortable prop="persisted" label="Persisted" width="150">
        <template v-slot:default="{ row }">
          <StateComponent :state="row.persisted"/>
        </template>
      </el-table-column>
      <el-table-column prop="creationDate" label="Creation Date" sortable>
        <template v-slot:default="{ row }">
          {{ $filters.mktimeToDateTime(row.creationDate) }}
        </template>
      </el-table-column>

      <el-table-column label="Actions" width="150">
        <template v-slot:default="{ row }">
          <el-button @click="onClickEdit(row)" type="primary" size="default">
            <font-awesome-icon :icon="['fas', 'pencil']"/>
          </el-button>
          <el-button v-if="!['None'].includes(row.name)" @click="onClickDelete(row)" type="danger" size="default">
            <font-awesome-icon :icon="['fas', 'trash']"/>
          </el-button>
        </template>
      </el-table-column>
    </el-table>
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="dialogVisible = false">Close</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import {computed, onMounted, reactive, ref, watch} from "vue";
import {useStatemachineStore} from "@cyoda/statemachine/src/stores/statemachine";
import {ElMessageBox} from "element-plus";
import {getPersistedType} from "../helpers/HelperData";
import StateComponent from "../components/States/StateComponent.vue";
import {useRoute, useRouter} from "vue-router";
import HelperStorage from "@cyoda/cobi/src/helpers/HelperStorage";
import eventBus from "@cyoda/ui-lib/src/plugins/eventBus";

const dialogVisible = ref(false);
const statesList = ref([]);
const statemachineStore = useStatemachineStore();
const router = useRouter();
const route = useRoute();
const storage = new HelperStorage();

const form = reactive(storage.get(`statemachine:state-list:form`, {
  filter: "",
  popUp: false,
}));

const props = defineProps({
  workflowId: {
    default: null,
  },
  persistedType: {
    default: "",
  },
})

async function loadStates() {
  const {data} = await statemachineStore.getStatesList(props.persistedType, props.workflowId);
  statesList.value = data.Data;
}

const statesListComputed = computed(() => {
  return statesList.value.filter((el) => {
    return !form.filter || el.name.toLowerCase().includes(form.filter);
  })
});

onMounted(() => {
  loadStates();
  if (form.popUp) {
    dialogVisible.value = true;
  }
})

function onClickEdit(row) {
  const link = `/statemachine/state/${row.id}?workflowId=${props.workflowId}&persistedType=${getPersistedType(row.persisted)}&entityClassName=${row.entityClassName}`;
  form.popUp = true;
  router.push(link);
}

function onClickDelete(row) {
  ElMessageBox.confirm("Are you sure you want to delete state? Before deleting, please make sure that this state is not used in any of the transitions.", "Delete confirmation", {
    callback: async (action) => {
      if (action === "confirm") {
        await statemachineStore.deleteState(getPersistedType(row.persisted), props.workflowId, row.id);
        loadStates();
        eventBus.$emit('workflow:reload');
      }
    }
  });
}

watch(dialogVisible, (value) => {
  if (value) return;
  form.popUp = false;
})

watch(form, () => {
  storage.set(`statemachine:state-list:form`, form);
}, {deep: true})

defineExpose({dialogVisible});
</script>

<style scoped lang="scss">

</style>

<template>
  <div class="card">
    <div class="card-header">Filter</div>
    <div class="card-body">
      <el-form class="events-filter" label-position="top">
        <el-row class="wrap-row" :gutter="20">
          <el-col :span="12">
            <el-form-item label="Queue">
              <el-select clearable filterable v-model="form.queue">
                <el-option v-for="queue in queueOptions" :key="queue" :label="queue" :value="queue"> </el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="Entity class">
              <el-select clearable filterable v-model="form.entityClass">
                <el-option v-for="entityClass in entityClassOptions" :key="entityClass.value" :label="entityClass.label" :value="entityClass.value"> </el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="Transaction Status">
              <el-select filterable clearable v-model="form.status">
                <el-option v-for="transactionStatus in transactionStatusData" :key="transactionStatus.label" :label="transactionStatus.label" :value="transactionStatus.value"></el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="Has error">
              <el-select v-model="form.hasErrors" placeholder="Please select">
                <el-option label="True" :value="true" />
                <el-option label="False" :value="false" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="Sort">
              <el-select v-model="form.sort" placeholder="Sort">
                <el-option label="Asc" value="ASC" />
                <el-option label="Desc" value="DESC" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col class="action-item" :span="6">
            <el-button @click="onSubmit" :loading="isLoading" type="primary">Load</el-button>
          </el-col>
        </el-row>
      </el-form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import {useProcessingStore} from "../../../stores/processing";

interface DictionaryItem {
  label: string;
  value: string;
}

const emit = defineEmits(["change"]);
const props = defineProps({ isLoading: { default: false } });
const processingStore = useProcessingStore();
function entitiesListPossible() {
  return processingStore.entitiesListPossible();
}

function loadTransactionsStatuses() {
  return processingStore.loadTransactionsStatuses();
}

function processingQueues() {
  return processingStore.processingQueues();
}

function loadTransactionEventStatusesList() {
  return processingStore.loadTransactionEventStatusesList();
}

let actionTypeOptions = ref(["ALL", "READ", "UPDATE", "REMOVE"]);

let entityClassOptions = ref([]);

let transactionStatusData = ref([]);

let queueOptions = ref([]);
loadEntityClass();
loadStatuses();
loadProcessingQueues();

async function loadProcessingQueues() {
  const { data } = await processingQueues();
  queueOptions.value = data;
}

async function loadEntityClass() {
  const { data } = await entitiesListPossible();

  entityClassOptions.value = data.map((el: string) => ({
    label: el,
    value: el
  }));
}

async function loadStatuses(): Promise<void> {
  const { data } = await loadTransactionEventStatusesList();
  transactionStatusData.value = data.map((el: any) => ({
    label: el,
    value: el
  }));
}

let form = ref({
  queue: "",
  status: "",
  entityClass: "",
  hasErrors: false,
  sort: "ASC"
});

function onSubmit() {
  emit("change", form.value);
}

defineExpose({ form });
</script>

<style lang="scss">
.events-filter {
  .el-form-item__label {
    margin-bottom: 0 !important;
    padding-bottom: 0 !important;
  }

  .wrap-row {
    position: relative;

    .action-item {
      position: relative;
      left: 0;
      top: 22px;
    }
  }
}
</style>

<template>
  <div class="shards-detail-tab-pm-components-cyoda-runnable-components">
    <data-tables
      :pagination-props="{ pageSizes: [5, 10, 15, 20, 50] }"
      :table-props="{
        border: true
      }"
      :data="tableData"
      border
      style="width: 100%"
    >
      <el-table-column prop="name" label="Name" sortable>
        <template v-slot:default="scope">
          <template v-if="scope.row.running">
            <font-awesome-icon size="lg" class="icon-running" icon="check-circle" />
          </template>
          <template v-else>
            <font-awesome-icon size="lg" class="icon-stop" icon="stop-circle" />
          </template>
          {{ scope.row.name }}
        </template>
      </el-table-column>
      <el-table-column label="Operations" width="200">
        <template v-slot:default="scope">
          <el-button :loading="isLoadingStart" @click="onStart(scope.row)" :disabled="scope.row.running" type="success" size="default" circle>
            <font-awesome-icon v-if="!isLoadingStart" icon="play" />
          </el-button>
          <el-button :loading="isLoadingStop" @click="onStop(scope.row)" :disabled="!scope.row.running" type="danger" size="default" circle>
            <font-awesome-icon v-if="!isLoadingStop" icon="stop" />
          </el-button>
          <el-button :loading="isLoadingReload" @click="onReload(scope.row)" :disabled="!scope.row.running" type="warning" size="default" circle>
            <font-awesome-icon v-if="!isLoadingReload" icon="sync-alt" />
          </el-button>
        </template>
      </el-table-column>
    </data-tables>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import {useProcessingStore} from "../../../stores/processing";

const processingStore = useProcessingStore();
function loadRunnableComponents() {
  return processingStore.loadRunnableComponents();
}

function stopRunnableComponent(value) {
  return processingStore.stopRunnableComponent(value);
}

function startRunnableComponent(value) {
  return processingStore.startRunnableComponent(value);
}

let tableData = ref([]);
loadData();

const isLoadingStart = ref<boolean>(false);

const isLoadingStop = ref<boolean>(false);

const isLoadingReload = ref<boolean>(false);

async function loadData() {
  const { data } = await loadRunnableComponents();
  tableData.value = data;
}

function requestStart(id: string) {
  return startRunnableComponent({ id });
}

function requestStop(id: string) {
  return stopRunnableComponent({ id });
}

async function onStart(row: any) {
  try {
    isLoadingStart.value = true;
    await requestStart(row.id);
    await loadData();
  } finally {
    isLoadingStart.value = false;
  }
}

async function onStop(row: any) {
  try {
    isLoadingStop.value = true;
    await requestStop(row.id);
    await loadData();
  } finally {
    isLoadingStop.value = false;
  }
}

async function onReload(row: any) {
  try {
    isLoadingReload.value = true;
    await requestStop(row.id);
    await requestStart(row.id);
    await loadData();
  } finally {
    isLoadingReload.value = false;
  }
}
</script>

<style lang="scss">
.shards-detail-tab-pm-components-cyoda-runnable-components {
  .icon-running {
    color: #81ae33;
  }

  .icon-stop {
    color: #737373;
  }

  .el-button.is-circle {
    min-width: 30px;
    min-height: 30px;
  }

  .el-button.is-loading span{
    display: none !important;
  }
}
</style>

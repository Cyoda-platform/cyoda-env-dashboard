<template>
  <div>
    <data-tables
      :pagination-props="{ pageSizes: [5, 10, 15, 20, 50] }"
      :table-props="{
        border: true
      }"
      :data="timeStatsTable"
      border
      style="width: 100%"
    >
      <el-table-column prop="key" label="Key" width="500" fixed sortable> </el-table-column>
      <el-table-column prop="numCalls" label="Num Calls" width="130" sortable> </el-table-column>
      <el-table-column prop="min" label="Min" width="130" sortable> </el-table-column>
      <el-table-column prop="avg" label="Avg" width="130" sortable> </el-table-column>
      <el-table-column prop="max" label="Max" width="130" sortable> </el-table-column>
      <el-table-column prop="last" label="Last" width="130" sortable> </el-table-column>
      <el-table-column prop="total" label="Total" width="130" sortable> </el-table-column>
    </data-tables>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import {useProcessingStore} from "../../../stores/processing";

const processingStore = useProcessingStore();
function loadStatsCount() {
  return processingStore.loadStatsCount();
}

let timeStatsTable = ref([]);

loadData();
async function loadData() {
  const { data } = await loadStatsCount();
  timeStatsTable.value = data;
}
</script>

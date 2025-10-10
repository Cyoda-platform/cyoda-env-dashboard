<template>
  <div>
    <data-tables
      :pagination-props="{ pageSizes: [5, 10, 15, 20, 50] }"
      :table-props="{
        border: true
      }"
      :data="tableData"
      border
      style="width: 100%"
    >
      <el-table-column prop="executorName" label="Executor Name" width="200" fixed sortable> </el-table-column>
      <el-table-column prop="index" label="Index" sortable> </el-table-column>
      <el-table-column prop="queueSize" label="Queue size" sortable> </el-table-column>
      <el-table-column prop="details" label="Details" sortable> </el-table-column>
    </data-tables>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";

const tableData = computed(() => {
  return [];
});
</script>

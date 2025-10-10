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
      <el-table-column prop="index" label="№" width="200" fixed sortable> </el-table-column>
      <el-table-column prop="name" label="Name" width="200" sortable> </el-table-column>
      <el-table-column prop="entityId" label="EntityId" width="200" sortable> </el-table-column>
      <el-table-column prop="entityClass" label="Entity Class" width="200" sortable> </el-table-column>
      <el-table-column prop="expectedThreadsCount" label="ExpectedThreadsCount" width="250" sortable> </el-table-column>
      <el-table-column prop="lastAccessTime" label="LastAccessTime" width="200" sortable> </el-table-column>
      <el-table-column prop="processFinished" label="processFinished" width="200" sortable> </el-table-column>
      <el-table-column prop="processingThreadsCount" label="ProcessingThreadsCount" width="250" sortable> </el-table-column>
      <el-table-column prop="finishedThreadsCount" label="FinishedThreadsCount" width="220" sortable> </el-table-column>
    </data-tables>
  </div>
</template>

<script setup lang="ts">
const props = defineProps({ tableData: { default: () => [] } });
</script>

<template>
  <div class="card">
    <div class="card-header">Actual shards</div>
    <div class="card-body">
      <data-tables
        :pagination-props="{ pageSizes: [5, 10, 15, 20, 50] }"
        :table-props="{
          border: true
        }"
        :data="actualShardsTable"
        border
        style="width: 100%"
      >
        <el-table-column prop="shardId" label="Shard" sortable></el-table-column>
        <el-table-column prop="state" label="Status" sortable></el-table-column>
        <el-table-column prop="processesCount" label="Running Processes" sortable> </el-table-column>
      </data-tables>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps({ actualShardsTable: { default: () => [] } });
</script>

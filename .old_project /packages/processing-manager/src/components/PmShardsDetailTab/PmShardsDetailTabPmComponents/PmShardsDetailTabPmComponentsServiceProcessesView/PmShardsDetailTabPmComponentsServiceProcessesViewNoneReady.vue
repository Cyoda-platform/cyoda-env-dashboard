<template>
  <div class="pm-shards-detail-tab-pm-components-service-processes-view-bone-ready">
    <h4>None ready(none working) processes</h4>
    <data-tables
      :pagination-props="{ pageSizes: [5, 10, 15, 20, 50] }"
      :table-props="{
        border: true
      }"
      :data="tableData"
      border
      style="width: 100%"
    >
      <el-table-column prop="name" label="Name" fixed sortable></el-table-column>
      <el-table-column prop="shard" label="Shard" width="200" sortable></el-table-column>
    </data-tables>
  </div>
</template>

<script setup lang="ts">
const props = defineProps({
  tableData: {
    default: () => []
  }
});
</script>

<style>
.pm-shards-detail-tab-pm-components-service-processes-view-bone-ready h4 {
  margin-bottom: 16px;
}
</style>

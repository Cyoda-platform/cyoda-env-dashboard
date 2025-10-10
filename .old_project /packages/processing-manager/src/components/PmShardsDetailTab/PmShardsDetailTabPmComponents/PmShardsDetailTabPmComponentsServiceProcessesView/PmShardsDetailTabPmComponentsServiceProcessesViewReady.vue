<template>
  <div class="pm-shards-detail-tab-pm-components-service-processes-view-ready">
    <h4>Ready(working) processes</h4>
    <data-tables
      :pagination-props="{ pageSizes: [5, 10, 15, 20, 50] }"
      :table-props="{
        border: true
      }"
      :data="tableData"
      border
      style="width: 100%"
    >
      <el-table-column prop="name" label="Name" width="450" fixed sortable> </el-table-column>
      <el-table-column prop="shard" label="Shard" width="100" sortable> </el-table-column>
      <el-table-column prop="lastStartTime" label="Last Start Time" width="250" sortable> </el-table-column>
      <el-table-column prop="lastFinishTime" label="Last Finish Time" width="250" sortable> </el-table-column>
      <el-table-column prop="lastDurationMillis" label="Last Duration Millis" width="200" sortable> </el-table-column>
      <el-table-column prop="nextStartTime" label="Next Start Time" width="200" sortable> </el-table-column>
      <el-table-column prop="processing" label="Is processing" width="150" sortable>
        <template v-slot:default="scope">
          {{ scope.row.processing ? "Yes" : "No" }}
        </template>
      </el-table-column>
      <el-table-column prop="queued" label="Is queued" width="150" sortable>
        <template v-slot:default="scope">
          {{ scope.row.queued ? "Yes" : "No" }}
        </template>
      </el-table-column>
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
.pm-shards-detail-tab-pm-components-service-processes-view-ready h4{
  margin-bottom: 16px;
}
</style>

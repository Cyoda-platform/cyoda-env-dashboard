<template>
  <div class="card">
    <div class="card-header">Transaction Events</div>
    <div class="card-body" v-loading="isLoading">
      <el-table border :data="tableData" style="width: 100%">
        <el-table-column prop="createTime" label="Create Time" width="170"> </el-table-column>
        <el-table-column prop="doneTime" label="Done Time" width="170"> </el-table-column>
        <el-table-column prop="errorTime" label="Error Time" width="170"> </el-table-column>
        <el-table-column prop="totalTimeMillis" label="Total Time(ms)" width="170" />
        <el-table-column prop="queueName" label="Queue" width="400" />
        <el-table-column prop="shardId" label="Shard" width="100" />
        <el-table-column prop="status" label="Status" width="200" />
        <el-table-column prop="timeUUID" label="Time UUID" width="330">
          <template v-slot="scope">
            <router-link :to="onEventView(scope)" type="text" size="small">{{ scope.row.timeUUID }}</router-link>
          </template>
        </el-table-column>
        <el-table-column prop="entityClassName" label="Entity Class" width="350" />
        <el-table-column prop="entityId" label="Entity ID" width="330" />
        <el-table-column prop="entityHasErrors" label="Has Errors" width="150">
          <template v-slot:default="{ row }">
            {{ $filters.boolean(row) }}
          </template>
        </el-table-column>
        <el-table-column prop="errorEventTimeUUID" label="Error Event Time UUID" width="330" />
        <el-table-column prop="coreDataClassName" label="Core Event Data Class" width="350" />
        <el-table-column prop="versionCheckResult" label="Client Event Data Class" width="350" />
      </el-table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRoute } from "vue-router";

import moment from "moment";

const props = defineProps({ isLoading: { default: false }, tableData: { default: () => [] } });
const route = useRoute();

function convertTime(mkTime: number) {
  return moment(mkTime).format("YYYY-MM-DD HH:mm:ss.SSS");
}

function onEventView({ row }: { row: any }) {
  return `/processing-ui/nodes/${route.params.name}/event-view?queue=${row.queueName}&shard=${row.shardId}&timeUUID=${row.timeUUID}`;
}
</script>

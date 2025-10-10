<template>
  <data-tables
    :pagination-props="{ pageSizes: [5, 10, 15, 20, 50] }"
    :table-props="{
      border: true
    }"
    :data="tableData"
    border
    style="width: 100%"
  >
    <el-table-column prop="queueName" label="Queue" width="400" fixed sortable> </el-table-column>
    <el-table-column prop="createTime" label="Create Time" width="200" fixed sortable> </el-table-column>
    <el-table-column prop="doneTime" label="Done Time" width="200" sortable> </el-table-column>
    <el-table-column prop="errorTime" label="Error Time" width="200" sortable> </el-table-column>
    <el-table-column prop="shardId" label="Shard" width="100" sortable> </el-table-column>
    <el-table-column prop="status" label="Status" width="200" sortable> </el-table-column>
    <el-table-column prop="timeUUID" label="Time-UUID" width="200" sortable>
      <template v-slot:default="props">
        <router-link :to="onClickErrorEvent(props.row)">{{ props.row.timeUUID }}</router-link>
      </template>
    </el-table-column>
    <el-table-column prop="queueName" label="Entity-Class" width="200" sortable> </el-table-column>
    <el-table-column prop="entityId" label="Entity-ID" width="200" sortable> </el-table-column>
    <el-table-column prop="hasErrors" label="Has Errors" width="150" sortable>
      <template v-slot:default="props">
        {{ $filters.boolean(props.row.entityHasErrors) }}
      </template>
    </el-table-column>
    <el-table-column prop="errorEventTimeUUID" label="Error Event Time-UUID" width="250" sortable> </el-table-column>
    <el-table-column prop="coreDataClassName" label="Core-Event-Data-Class" width="250" sortable> </el-table-column>
    <el-table-column prop="clientDataClassName" label="Client-Event-Data-Class" width="250" sortable> </el-table-column>
  </data-tables>
</template>

<script setup lang="ts">
import { useRoute } from "vue-router";

const props = defineProps({ tableData: { default: () => [] } });
const route = useRoute();

function onClickErrorEvent(row: any) {
  return `/processing-ui/nodes/${route.params.name}/event-view?queue=${row.queueName}&shard=${row.shardId}&timeUUID=${row.timeUUID}`;
}
</script>

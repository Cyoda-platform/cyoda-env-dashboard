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
    <el-table-column prop="entityClass" label="Entity class" fixed sortable> </el-table-column>
    <el-table-column prop="entityId" label="Entity ID" width="200" sortable> </el-table-column>
    <el-table-column prop="shardId" label="Entity Shard (not event shard)" width="300" sortable> </el-table-column>
    <el-table-column prop="actions" label="Actions" width="350" class-name="actions-buttons" sortable>
      <template v-slot:default="scope">
        <router-link :to="onVersions(scope)">Versions</router-link>
        <router-link :to="onChanges(scope)" type="text" size="small">Changes</router-link>
        <router-link :to="onStateMachine(scope)" type="text" size="small">State Machine </router-link>
        <router-link :to="onErrorEvent(scope)" type="text" size="small">Error Event</router-link>
      </template>
    </el-table-column>
  </data-tables>
</template>

<script setup lang="ts">
import { useRoute } from "vue-router";

const props = defineProps({ tableData: { default: () => [] } });
const route = useRoute();

function onVersions({ row }: { row: any }) {
  const { params } = route;
  return `/processing-ui/nodes/${params.name}/versions?entityId=${row.entityId}&type=${row.entityClass}`;
}

function onChanges({ row }: { row: any }) {
  const { params } = route;
  return `/processing-ui/nodes/${params.name}/changes?entityId=${row.entityId}&type=${row.entityClass}`;
}

function onStateMachine({ row }: { row: any }) {
  const { params } = route;
  return `/processing-ui/nodes/${params.name}/entity-state-machine?entityId=${row.entityId}&type=${row.entityClass}`;
}

function onErrorEvent({ row }: { row: any }) {
  return `/processing-ui/nodes/${route.params.name}/event-view?queue=${row.entityClass}&shard=${row.shardId}&timeUUID=${row.eventUUID}`;
}
</script>

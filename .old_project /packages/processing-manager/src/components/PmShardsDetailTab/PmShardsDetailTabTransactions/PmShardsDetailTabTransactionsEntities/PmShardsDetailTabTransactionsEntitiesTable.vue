<template>
  <div v-loading="isLoading">
    <data-tables
      :pagination-props="{ pageSizes: [5, 10, 15, 20, 50] }"
      :table-props="{
        border: true
      }"
      :data="tableData"
      border
      style="width: 100%"
    >
      <el-table-column prop="cretionDate" label="Create Date" width="200" fixed sortable> </el-table-column>
      <el-table-column prop="entityId" label="Entity ID" sortable> </el-table-column>
      <el-table-column prop="shardId" label="Shard" sortable> </el-table-column>
      <el-table-column prop="actions" label="Actions" class-name="actions-buttons" sortable>
        <template v-slot:default="scope">
          <router-link :to="onVersions(scope)" type="text" size="small">Versions</router-link>
          <router-link :to="onChanges(scope)" type="text" size="small">Changes</router-link>
          <router-link :to="onStateMachine(scope)" type="text" size="small">State Machine </router-link>
        </template>
      </el-table-column>
    </data-tables>
  </div>
</template>

<script setup lang="ts">
import {useRoute} from "vue-router";

const props = defineProps({ tableData: { default: () => [] }, isLoading: { default: false } });
const route = useRoute();

function onVersions({ row }: { row: any }) {
  const { params } = route;
  const path = createLink("versions", row.actions);
  return `/processing-ui/nodes/${params.name}/versions?${path}`;
}

function onChanges({ row }: { row: any }) {
  const { params } = route;
  const path = createLink("changes", row.actions);
  return `/processing-ui/nodes/${params.name}/changes?${path}`;
}

function onStateMachine({ row }: { row: any }) {
  const { params } = route;
  const path = createLink("state-machine", row.actions);
  return `/processing-ui/nodes/${params.name}/entity-state-machine?${path}`;
}

function createLink(name: string, actions: string[]) {
  const action = actions.find((el) => el.indexOf(`entity-${name}`) !== -1);
  if (action) {
    const paths = action.split("?");
    return paths[1].replace("id=", "entityId=");
  }
}
</script>

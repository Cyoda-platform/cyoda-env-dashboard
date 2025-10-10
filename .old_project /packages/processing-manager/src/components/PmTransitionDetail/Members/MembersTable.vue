<template>
  <div class="card">
    <div class="card-header">Transaction members with version check results</div>
    <div class="card-body" v-loading="isLoading">
      <el-table border :data="tableData" style="width: 100%">
        <el-table-column prop="entityType" label="Entity Type" width="330" fixed> </el-table-column>
        <el-table-column prop="entityId" label="Entity Id" width="330"> </el-table-column>
        <el-table-column prop="actionType" label="Action Type" width="130"> </el-table-column>
        <el-table-column prop="versionCheckTimeMillis" label="Version Check Time" width="200">
          <template v-slot:default="{ row }">
            {{ convertTime(row.versionCheckTimeMillis) }}
          </template>
        </el-table-column>
        <el-table-column prop="versionCheckResult" label="Version Check Result" width="200">
          <template v-slot:default="{ row }">
            {{ $filters.boolean(row.versionCheckResult) }}
          </template>
        </el-table-column>
        <el-table-column fixed="right" label="Operations" class-name="actions-buttons" width="300">
          <template v-slot:default="scope">
            <router-link :to="onVersions(scope)" type="text" size="small">Versions</router-link>
            <router-link :to="onChanges(scope)" type="text" size="small">Changes</router-link>
            <router-link :to="onStateMachine(scope)" type="text" size="small">State Machine </router-link>
          </template>
        </el-table-column>
      </el-table>
    </div>
  </div>
</template>

<script setup lang="ts">
import moment from "moment";
import {useRoute} from "vue-router";

const props = defineProps({ isLoading: { default: false }, tableData: { default: () => [] } });
const route = useRoute();

function convertTime(mkTime: number) {
  return moment(mkTime).format("YYYY-MM-DD HH:mm:ss.SSS");
}

function onVersions({ row }: { row: any }) {
  const { params } = route;
  return `/processing-ui/nodes/${params.name}/versions?entityId=${row.entityId}&type=${row.entityType}`;
}

function onChanges({ row }: { row: any }) {
  const { params } = route;
  return `/processing-ui/nodes/${params.name}/changes?entityId=${row.entityId}&type=${row.entityType}`;
}

function onStateMachine({ row }: { row: any }) {
  const { params } = route;
  return `/processing-ui/nodes/${params.name}/entity-state-machine?entityId=${row.entityId}&type=${row.entityType}`;
}
</script>

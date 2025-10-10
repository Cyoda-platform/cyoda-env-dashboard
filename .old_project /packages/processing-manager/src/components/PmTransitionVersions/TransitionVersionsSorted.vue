<template>
  <div class="card">
    <div class="card-header">Sorted by column's time view</div>
    <div class="card-body">
      <el-table :data="tableData" style="width: 100%">
        <el-table-column label="Version(time based)" width="320px" prop="version"/>
        <el-table-column label="Transaction Id" width="320px" prop="transactionId">
          <template v-slot:default="scope">
            <router-link
              :to="`/processing-ui/nodes/${route.params.name}/transaction/${scope.row.transactionId}`">
              {{ scope.row.transactionId }}
            </router-link>
          </template>
        </el-table-column>
        <el-table-column label="Action Type" prop="actionType"></el-table-column>
        <el-table-column prop="colType" label="Column type"/>
        <el-table-column prop="colTimeMillis" label="Column time">
          <template v-slot:default="scopeCol">
            {{ $filters.dateTime(scopeCol.row.colTimeMillis) }}
          </template>
        </el-table-column>
      </el-table>
    </div>
  </div>
</template>

<script setup lang="ts">
import {useRoute} from "vue-router";
import {computed} from "vue";

const route = useRoute();
const props = defineProps({rows: {default: () => []}});
const tableData = computed(() => {
  return props.rows;
});
</script>

<style scoped lang="scss">
.card-body ul {
  list-style: none;
  margin: 0;
  padding: 0;

  li.name {
    font-weight: bold;
    margin-top: 10px;
  }
}
</style>

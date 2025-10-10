<template>
  <div class="card">
    <div class="card-header">Aggregated by transaction view</div>
    <div class="card-body">
      <el-table :data="tableData" style="width: 100%">
        <el-table-column type="expand">
          <template v-slot:default="props">
            <el-table :data="props.row.subTable" style="width: 100%">
              <el-table-column prop="colType" label="Column type"/>
              <el-table-column prop="colTimeMillis" label="Column time">
                <template v-slot:default="scopeCol">
                  {{ $filters.dateTime(scopeCol.row.colTimeMillis) }}
                </template>
              </el-table-column>
            </el-table>
          </template>
        </el-table-column>
        <el-table-column label="Version(time based)" width="320px" prop="version"/>
        <el-table-column label="Transaction Id" prop="transactionId">
          <template v-slot:default="scope">
            <router-link
              :to="`/processing-ui/nodes/${route.params.name}/transaction/${scope.row.transactionId}`">
              {{ scope.row.transactionId }}
            </router-link>
          </template>
        </el-table-column>
        <el-table-column label="Action Type" prop="actionType"></el-table-column>
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
  const data: any[] = [];
  props.rows.forEach((el) => {
    let existRow = data.find((elExist) => elExist.transactionId === el.transactionId);
    if (!existRow) {
      existRow = {
        actionType: el.actionType,
        transactionId: el.transactionId,
        version: el.version,
        subTable: []
      };
      data.push(existRow);
    }

    existRow.subTable.push({
      colTimeMillis: el.colTimeMillis,
      colType: el.colType
    });
  });
  return data;
});
</script>

<template>
  <div class="card">
    <div class="card-body">
      <data-tables :data="tableData" style="width: 100%">
        <el-table-column type="expand">
          <template v-slot:default="props">
            <el-table :data="props.row.changedFieldValues" style="width: 100%">
              <el-table-column prop="columnPathComputed" label="Path">
                <template v-slot:default="scope">
                  {{ scope.row.columnPath || "-" }}
                </template>
              </el-table-column>
              <el-table-column prop="prevValue" label="Old value"/>
              <el-table-column prop="currValue" label="New value"/>
            </el-table>
          </template>
        </el-table-column>
        <el-table-column label="Transaction Id" width="320px" prop="transactionId">
          <template v-slot:default="scope">
            <template v-if="disableLink">
              {{ scope.row.transactionId }}
            </template>
            <template v-else>
              <router-link :to="`/processing-ui/nodes/${route.params.name}/transaction/${scope.row.transactionId}`">
                {{ scope.row.transactionId }}
              </router-link>
            </template>
          </template>
        </el-table-column>
        <el-table-column label="Time(uuid/date)" prop="timeUid">
          <template v-slot:default="{row}"> {{ row.timeUUID }} / {{ row.creationDate }}</template>
        </el-table-column>
        <el-table-column label="State from">
          <template v-slot:default="{row}"> {{ getChangedFieldValuesByKey(row, 'state', 'prevValue') }}</template>
        </el-table-column>
        <el-table-column label="State to">
          <template v-slot:default="{row}">{{ getChangedFieldValuesByKey(row, 'state', 'currValue') }}</template>
        </el-table-column>
        <el-table-column label="User" prop="user"/>
        <el-table-column label="Change Type" prop="operation"/>
      </data-tables>
    </div>
  </div>
</template>

<script setup lang="ts">
import {useRoute} from "vue-router";
import {ref} from "vue";
import {useHttpApiProcessingStore} from "@cyoda/http-api/src/stores/httpApiProcessing";

const route = useRoute();
const props = defineProps({type: {default: ""}, entityId: {default: ""}, disableLink: {default: false}});
const httpApiProcessingStore = useHttpApiProcessingStore();

function transactionsViewEntityChanges(value) {
  return httpApiProcessingStore.transactionsViewEntityChanges(value);
}

let tableData = ref([]);

loadData();

async function loadData() {
  const {data} = await transactionsViewEntityChanges({
    type: props.type,
    id: props.entityId
  });
  tableData.value = data;
}

function getChangedFieldValuesByKey(scope, columnPath, field) {
  console.log(scope);
  const row = scope.changedFieldValues.find(elem => elem.columnPath === columnPath);
  if (!row) return;
  return row[field];
}
</script>

<template>
  <div class="network-clients">
    <div>
      <h1 class="label">Clients</h1>
    </div>
    <el-table class="ab-style" border ref="tableReport" :data="tableData" size="small" style="width: 100%">
      <el-table-column prop="id" label="Id"></el-table-column>
      <el-table-column prop="clientType" label="Client Type"></el-table-column>
      <el-table-column prop="nodeType" label="Node Type"></el-table-column>
      <el-table-column prop="host" label="Host"></el-table-column>
      <el-table-column prop="port" label="Port"></el-table-column>
      <el-table-column align="center" label="Transport">
        <el-table-column prop="transport.type" label="Type"></el-table-column>
        <el-table-column prop="transport.running" label="Running">
          <template v-slot:default="{ row }">
            {{ $filters.boolean(row.transport.running) }}
          </template>
        </el-table-column>
        <el-table-column prop="transport.connected" label="Connected">
          <template v-slot:default="{ row }">
            {{ $filters.boolean(row.transport.connected) }}
          </template>
        </el-table-column>
      </el-table-column>
    </el-table>
  </div>
</template>

<script setup lang="ts">
import {ref} from "vue";

import * as api from "@cyoda/ui-lib/src/api";

let tableData = ref([]);
const props = defineProps({
  getNetInfoClientsRequestFn: {
    default: null
  }
})

function getNetInfoClientsRequest() {
  if (props.getNetInfoClientsRequestFn) return props.getNetInfoClientsRequestFn();
  return api.getNetInfoClients();
}

loadData();

async function loadData() {
  const {data} = await getNetInfoClientsRequest();
  tableData.value = data;
}

defineExpose({getNetInfoClientsRequest});
</script>

<style lang="scss">
.network-clients {
  .title {
    margin-bottom: 10px;
  }

  h1.label {
    font-size: 22px;
    margin-bottom: 10px;
    padding-left: 0;
  }

  .row-flex {
    display: flex;
    justify-content: space-between;

    span {
      display: inline-block;
      width: 100px;
    }

    div {
      width: 50%;
    }
  }
}
</style>

<template>
  <div class="pm-shards-detail-tab-transactions-view-table" v-loading="isLoading">
    <el-table border :row-class-name="tableRowClassName" :data="tableData" style="width: 100%">
      <el-table-column prop="id" label="Transaction ID" width="300" fixed sortable>
        <template v-slot:default="scope">
          <router-link :to="onClickDetail(scope)" type="text" size="small">{{ scope.row.id }}</router-link>
        </template>
      </el-table-column>
      <el-table-column prop="userName" label="User Name" width="200" sortable> </el-table-column>
      <el-table-column prop="status" label="Transaction Status" width="200" sortable> </el-table-column>
      <el-table-column prop="createTime" label="Create Time" width="200" sortable> </el-table-column>
      <el-table-column prop="submitTime" label="Submit time" width="200" sortable> </el-table-column>
      <el-table-column prop="finishTime" label="Finish time" width="200" sortable> </el-table-column>
      <el-table-column prop="prepareTimeMillis" label="Prepare duration" width="200" sortable> </el-table-column>
      <el-table-column prop="processTimeMillis" label="Process duration" width="200" sortable> </el-table-column>
      <el-table-column prop="transactionSubmitNodeId" label="Transaction Submit Node Id" width="300" sortable> </el-table-column>
    </el-table>
  </div>
</template>

<script setup lang="ts">
import { useRoute } from "vue-router";

import moment from "moment";

const props = defineProps({ tableData: { default: () => [] }, isLoading: { default: false } });
const route = useRoute();

function onClickDetail(scope: any) {
  return `/processing-ui/nodes/${route.params.name}/transaction/${scope.row.id}`;
}

function tableRowClassName({ row }: { row: any; rowIndex: number }) {
  const diff = moment(row.finishTime.replace("(", ".").replace(")", "")).diff(row.createTime.replace("(", ".").replace(")", ""));
  if (diff < 1000) {
    return "row-white";
  }
  if (diff < 3 * 1000) {
    return "row-palegoldenrod";
  }
  if (diff < 10 * 1000) {
    return "row-yellow";
  }
  if (diff < 60 * 1000) {
    return "row-orange";
  }
  return "row-red";
}
</script>

<style lang="scss">
.pm-shards-detail-tab-transactions-view-table {
  .el-table {
    .row-palegoldenrod {
      background: #fefcf2;
    }

    .row-yellow {
      background: #ffffb2;
    }

    .row-orange {
      background: #ffe4b2;
    }

    .row-red {
      background: #fef0f0;
    }
  }
}
</style>

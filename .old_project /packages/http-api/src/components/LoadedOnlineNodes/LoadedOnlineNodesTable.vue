<template>
  <div class="loaded-online-nodes-table">
    <div>
      <h1 class="label">{{ title }}</h1>
    </div>
    <el-table class="ab-style" border ref="tableReport" :data="tableData" size="small" style="width: 100%">
      <el-table-column prop="id" label="Id"> </el-table-column>
      <el-table-column prop="type" label="Type"> </el-table-column>
      <el-table-column prop="baseUrl" label="BaseUrl"> </el-table-column>
      <el-table-column prop="host" label="Host"> </el-table-column>
      <el-table-column prop="notificationsPort" label="NotificationsPort"> </el-table-column>
      <el-table-column prop="processingNode" label="Processing Node"> </el-table-column>
      <el-table-column label="Action">
        <template #default="{ row }">
          <el-popover v-if="getDifferents(row)" placement="top-start" title="Cluster state value" width="250" trigger="hover">
            <span v-if="getDifferentsType(row) === 'string'">
              {{ getDifferents(row) }}
            </span>
            <span v-else-if="getDifferents(row).length">
              <span v-for="rowStr in getDifferents(row)"> {{ rowStr }}<br /> </span>
            </span>
            <template #reference>
            <font-awesome-icon class="warning" icon="exclamation-circle" />
            </template>
          </el-popover>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script setup lang="ts">
import type { NodeInfo } from "@cyoda/ui-lib/src/types/types";

const props = defineProps({
  tableData: {
    default: () => {
      return [];
    }
  },
  title: {
    default: ""
  },
  clusterStateClientNodes: {
    default: () => {
      return [];
    }
  }
});

function getDifferents(row: NodeInfo) {
  const rowClusterStateClientNodes = props.clusterStateClientNodes.find((el) => el.id === row.id);
  if (rowClusterStateClientNodes) {
    const data = Object.keys(row)
      .map((key) => {
        if (rowClusterStateClientNodes[key] !== row[key]) {
          return `${key}: ${rowClusterStateClientNodes[key]}`;
        }
      })
      .filter((el) => el != null);
    if (data.length > 0) {
      return data;
    } else {
      return false;
    }
  } else {
    return "Error. This row was not found!";
  }
}

function getDifferentsType(row: NodeInfo) {
  return typeof getDifferents(row);
}
</script>

<style lang="scss">
.loaded-online-nodes-table {
  margin-bottom: 16px;

  .warning {
    font-size: 16px;
    color: #ff6f6f;
    cursor: pointer;
  }
}
</style>

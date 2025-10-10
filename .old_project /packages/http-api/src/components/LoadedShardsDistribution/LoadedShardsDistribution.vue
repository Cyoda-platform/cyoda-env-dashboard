<template>
  <div class="loaded-shards-distribution">
    <div>
      <h1 class="label">Loaded Shards Distribution</h1>
      <div class="wrap-box">
        <div class="row-flex">
          <div>
            <strong>Id:</strong><br/>
            {{ shardsDistribution.id || "-" }}
            <LoadedShardsDistributionCheckState :shardsDistribution="shardsDistribution"
                                                :clusterStateCurrentNode="clusterStateShardsDistr" field="id"/>
          </div>
          <div>
            <strong>Dispatcher Node Id:</strong><br/>
            {{ shardsDistribution.dispatcherNodeId || "-" }}
            <LoadedShardsDistributionCheckState :shardsDistribution="shardsDistribution"
                                                :clusterStateCurrentNode="clusterStateShardsDistr"
                                                field="dispatcherNodeId"/>
          </div>
        </div>
      </div>
      <el-table class="ab-style" border ref="tableReport" :data="tableData" size="small" style="width: 100%">
        <el-table-column prop="id" label="Nodes Id"></el-table-column>
        <el-table-column prop="shardsByNodes" label="ShardsByNodes"></el-table-column>
        <el-table-column label="Action">
          <template v-slot:default="{ row }">
            <el-popover v-if="!!getDifferents(row)" placement="top-start" title="Cluster state value" width="250"
                        trigger="hover">
              <template>
                <span v-for="rowStr in getDifferents(row)"> {{ rowStr }}<br/> </span>
              </template>
              <template #reference>
              <font-awesome-icon class="warning" icon="exclamation-circle"/>
              </template>
            </el-popover>
          </template>
        </el-table-column>
      </el-table>
    </div>
  </div>
</template>

<script setup lang="ts">
import {ref, computed} from "vue";

import * as api from "@cyoda/ui-lib/src/api";
import LoadedShardsDistributionCheckState from "./LoadedShardsDistributionCheckState.vue";

interface TableDataRow {
  id: string;
  shardsByNodes: string;
}

const props = defineProps({
  clusterState: {
    default: () => {
      return {};
    }
  },
  clusterStateShardsDistr: {
    default: () => {
      return {};
    }
  },
  getZkInfoLoadedShardsDistributionRequestFn: {
    default: null
  }
});
const tableData = computed(() => {
  return (
    (shardsDistribution.value.nodesIds &&
      shardsDistribution.value.nodesIds.map((id) => {
        return {
          id,
          shardsByNodes: shardsDistribution.value.shardsByNodes[id].join(", ")
        };
      })) ||
    []
  );
});

let shardsDistribution = ref({});

function getZkInfoLoadedShardsDistributionRequest() {
  if (props.getZkInfoLoadedShardsDistributionRequestFn) return props.getZkInfoLoadedShardsDistributionRequestFn();
  return api.getZkInfoLoadedShardsDistribution();
}

loadData();

async function loadData() {
  const {data} = await getZkInfoLoadedShardsDistributionRequest();
  shardsDistribution.value = data;
}

function getDifferents(row: TableDataRow) {
  if (props.clusterStateShardsDistr.shardsByNodes && props.clusterStateShardsDistr.shardsByNodes[row.id]) {
    if (props.clusterStateShardsDistr.shardsByNodes[row.id].join("") !== shardsDistribution.value.shardsByNodes[row.id].join("")) {
      return `Shards is different! ${props.clusterStateShardsDistr.shardsByNodes[row.id].join(", ")}`;
    }
  } else {
    return "Error! Row was not found.";
  }
}

defineExpose({getZkInfoLoadedShardsDistributionRequest});
</script>

<style lang="scss">
.loaded-shards-distribution {
  .warning {
    font-size: 16px;
    color: #ff6f6f;
    cursor: pointer;
  }

  .row-flex {
    display: flex;
    margin-bottom: 16px;

    div {
      width: 50%;
    }
  }

  h1.label {
    font-size: 22px;
    margin-bottom: 10px;
    padding-left: 0;
  }
}
</style>

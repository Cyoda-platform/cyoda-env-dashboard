<template>
  <div class="loaded-online-nodes">
    <div>
      <h1 class="label main">Loaded Online Nodes</h1>
    </div>
    <LoadedOnlineNodesTable title="Default" :tableData="tableData.DEFAULT"
                            :clusterStateClientNodes="clusterStateClientNodes.DEFAULT"/>
    <LoadedOnlineNodesTable title="Processing" :tableData="tableData.PROCESSING"
                            :clusterStateClientNodes="clusterStateClientNodes.PROCESSING"/>
    <LoadedOnlineNodesTable title="Toolbox" :tableData="tableData.TOOLBOX"
                            :clusterStateClientNodes="clusterStateClientNodes.TOOLBOX"/>
  </div>
</template>

<script setup lang="ts">
import {ref} from "vue";

import * as api from "@cyoda/ui-lib/src/api";
import LoadedOnlineNodesTable from "./LoadedOnlineNodesTable.vue";

const props = defineProps({
  clusterStateClientNodes: {
    default: () => {
      return {};
    }
  },
  getZkInfoLoadedOnlineNodesRequestFn: {
    default: null
  }
});

let tableData = ref([]);

function getZkInfoLoadedOnlineNodesRequest() {
  if (props.getZkInfoLoadedOnlineNodesRequestFn) return props.getZkInfoLoadedOnlineNodesRequestFn();
  return api.getZkInfoLoadedOnlineNodes();
}

loadData();

async function loadData() {
  const {data} = await getZkInfoLoadedOnlineNodesRequest();
  tableData.value = data;
}

defineExpose({getZkInfoLoadedOnlineNodesRequest});
</script>

<style lang="scss">
.loaded-online-nodes {
  h1.label.main {
    font-size: 22px;
    margin-bottom: 10px;
    padding-left: 0;
  }
}
</style>

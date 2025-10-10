<template>
  <div class="zoo-keeper-info-view">
    <slot v-if="hasDefaultSlot" :clusterState="clusterState"/>
    <div v-else>
      <h1 class="heading h1">ZooKeeper info</h1>
      <CurrNodeInfo :clusterStateCurrentNode="clusterState.currentNode"/>
      <hr/>
      <LoadedOnlineNodes :clusterStateClientNodes="clusterState.clientNodes"/>
      <hr/>
      <LoadedShardsDistribution :clusterStateShardsDistr="clusterState.shardsDistrState" :clusterState="clusterState"/>
    </div>
  </div>
</template>

<script setup lang="ts">
import {ref, computed, useSlots} from "vue";

import CurrNodeInfo from "../components/CurrNodeInfo/CurrNodeInfo.vue";
import LoadedOnlineNodes from "../components/LoadedOnlineNodes/LoadedOnlineNodes.vue";
import LoadedShardsDistribution from "../components/LoadedShardsDistribution/LoadedShardsDistribution.vue";
import * as api from "@cyoda/ui-lib/src/api";

let clusterState = ref({});
const props = defineProps({
  getZkInfoClusterStateRequestFn: {
    default: null
  }
})

function getZkInfoClusterStateRequest() {
  if (props.getZkInfoClusterStateRequestFn) return props.getZkInfoClusterStateRequestFn();
  return api.getZkInfoClusterState();
}

loadData();

async function loadData() {
  const {data} = await getZkInfoClusterStateRequest();
  clusterState.value = data;
}

const slots = useSlots();
const hasDefaultSlot = computed(() => {
  return !!slots['default'];
})

function clusterStateFakeData(data: any) {
  if (data === null || data === undefined) {
    return data;
  } else if (Array.isArray(data)) {
    data = data.map((el) => clusterStateFakeData(el));
  } else if (typeof data === "object") {
    Object.keys(data).forEach((key) => {
      data[key] = clusterStateFakeData(data[key]);
    });
  } else if (typeof data === "string" || typeof data === "number") {
    data += "1";
  } else if (typeof data === "boolean") {
    data = data.toString() + "1";
  }
  return data;
}

defineExpose({getZkInfoClusterStateRequest});
</script>

<style lang="scss">
.zoo-keeper-info-view {
  .h1 {
    font-size: 24px;
    margin-top: 16px;
    margin-bottom: 16px;
    padding-left: 0;
  }

  .network-info-server {
    width: 50%;
  }

  .network-clients {
    width: 50%;
  }

  hr {
    height: 2px;
    background-color: #f6ac2e;
    border: none;
    margin-bottom: 32px;
  }
}
</style>

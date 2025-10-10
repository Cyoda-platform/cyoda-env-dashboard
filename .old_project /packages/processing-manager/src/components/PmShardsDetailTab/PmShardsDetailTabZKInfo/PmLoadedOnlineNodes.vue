<template>
  <div>
    <LoadedOnlineNodes :getZkInfoLoadedOnlineNodesRequestFn="getZkInfoLoadedOnlineNodesRequest" :clusterStateClientNodes="clusterStateClientNodes"/>
  </div>
</template>
<script setup lang="ts">
import LoadedOnlineNodes
  from "@cyoda/http-api/src/components/LoadedOnlineNodes/LoadedOnlineNodes.vue";
import {useCommonStore} from "../../../stores/common";

const commonStore = useCommonStore();

defineProps({
  clusterStateClientNodes: {
    default: () => {
      return {};
    }
  },
});

function getZkInfoLoadedOnlineNodesRequest() {
  return commonStore.platformCommonZkInfoLoadedOnlineNodes();
}
</script>

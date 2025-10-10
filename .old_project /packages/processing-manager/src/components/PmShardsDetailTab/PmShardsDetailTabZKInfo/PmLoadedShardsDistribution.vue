<template>
  <div>
    <LoadedShardsDistribution
      :clusterState="clusterState"
      :clusterStateShardsDistr="clusterStateShardsDistr"
      :getZkInfoLoadedShardsDistributionRequestFn="getZkInfoLoadedShardsDistributionRequest"
    />
  </div>
</template>

<script setup lang="ts">
import LoadedShardsDistribution
  from "@cyoda/http-api/src/components/LoadedShardsDistribution/LoadedShardsDistribution.vue";
import {useCommonStore} from "../../../stores/common";

const commonStore = useCommonStore();

defineProps({
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
});

function getZkInfoLoadedShardsDistributionRequest() {
  return commonStore.platformCommonZkInfoLoadedShardsDistribution();
}
</script>

<template>
  <div>
    <CurrNodeInfo :getZkInfoCurrNodeInfoRequestFn="getZkInfoCurrNodeInfoRequest" :clusterStateCurrentNode="clusterStateCurrentNode"/>
  </div>
</template>
<script setup lang="ts">
import CurrNodeInfo from "@cyoda/http-api/src/components/CurrNodeInfo/CurrNodeInfo.vue";
import {useCommonStore} from "../../../stores/common";

defineProps({
  clusterStateCurrentNode: {
    default: () => {
      return {};
    }
  },
});

const commonStore = useCommonStore();

function getZkInfoCurrNodeInfoRequest() {
  return commonStore.platformCommonZkInfoCurrNodeInfo();
}
</script>

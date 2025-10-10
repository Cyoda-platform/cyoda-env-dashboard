<template>
  <div>
    <NetworkInfoServer
      :getNetInfoServerRequestFn="getNetInfoServerRequest"
    />
  </div>
</template>

<script setup lang="ts">
import NetworkInfoServer
  from "@cyoda/http-api/src/components/NetworkInfoServer/NetworkInfoServer.vue";
import {useCommonStore} from "../../../stores/common";

const commonStore = useCommonStore();

function getNetInfoServerRequest() {
  return commonStore.platformCommonNetInfoServer();
}
</script>

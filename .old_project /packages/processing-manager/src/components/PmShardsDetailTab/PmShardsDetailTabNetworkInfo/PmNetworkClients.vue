<template>
  <div>
    <NetworkClients
    :getNetInfoClientsRequestFn="getNetInfoClientsRequest"
    />
  </div>
</template>

<script setup lang="ts">
import NetworkClients
  from "@cyoda/http-api/src/components/NetworkClients/NetworkClients.vue";
import {useCommonStore} from "../../../stores/common";

const commonStore = useCommonStore();

function getNetInfoClientsRequest() {
  return commonStore.platformCommonNetInfoClients();
}
</script>

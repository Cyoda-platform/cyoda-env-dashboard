<template>
  <div class="card">
    <div class="card-header">Network Info</div>
    <div class="card-body">
      <PmNetworkInfoServer />
      <hr />
      <PmNetworkClients />
    </div>
  </div>
</template>

<script setup lang="ts">
import PmNetworkInfoServer from "./PmShardsDetailTabNetworkInfo/PmNetworkInfoServer.vue";
import PmNetworkClients from "./PmShardsDetailTabNetworkInfo/PmNetworkClients.vue";
</script>

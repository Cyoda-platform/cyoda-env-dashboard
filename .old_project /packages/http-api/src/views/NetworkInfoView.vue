<template>
  <div class="network-info-view">
    <h1 class="heading h1">Network info</h1>
    <NetworkInfoServer />
    <hr />
    <NetworkClients />
  </div>
</template>

<script setup lang="ts">
import NetworkInfoServer from "../components/NetworkInfoServer/NetworkInfoServer.vue";
import NetworkClients from "../components/NetworkClients/NetworkClients.vue";
</script>

<style lang="scss">
.network-info-view {
  .h1 {
    font-size: 24px;
    margin-top: 16px;
    margin-bottom: 16px;
    padding-left: 0;
  }
  hr {
    height: 2px;
    background-color: #f6ac2e;
    border: none;
    margin-bottom: 32px;
  }
}
</style>

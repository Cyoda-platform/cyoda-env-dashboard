<template>
  <div class="dialog-endpoint-workflow">
    <DialogEndpointFieldOperation :endpointDto="endpointDto" />
  </div>
</template>

<script setup lang="ts">
import DialogEndpointFieldOperation from "./Fields/DialogEndpointFieldOperation.vue";

const props = defineProps({
  endpointDto: {
    default: () => {
      return {};
    }
  }
});
</script>

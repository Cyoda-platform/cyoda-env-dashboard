<template>
  <div class="actions">
    <el-button :loading="isLoading" @click.prevent="onClickReset" type="primary">
      <font-awesome-icon icon="sync" />
      Reset
    </el-button>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import eventBus from "@cyoda/ui-lib/src/plugins/eventBus";

const isLoading = ref<boolean>(false);

function onClickReset() {
  eventBus.$emit("grafana:chart:reset");
  isLoading.value = true;
  setTimeout(() => {
    isLoading.value = false;
  }, 2000);
}
</script>

<style scoped>
.actions {
  text-align: right;
  margin-bottom: 15px;
}
</style>

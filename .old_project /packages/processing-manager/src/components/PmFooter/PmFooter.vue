<template>
  <footer class="c-footer">
    <div class="left-column">
      <a href="https://cyoda.com/">Cyoda</a> &copy; {{ year }}
      <CyodaVersion />
    </div>
    <div class="ml-auto">Powered by&nbsp;<a href="https://cyoda.com/">Cyoda</a></div>
  </footer>
</template>

<script setup lang="ts">
import { computed } from "vue";

import CyodaVersion from "@cyoda/ui-lib/src/components-library/patterns/CyodaVersion/CyodaVersion.vue";

const year = computed(() => {
  return new Date().getFullYear();
});
</script>

<style lang="scss" scoped>
.left-column {
  display: inline-flex;
  align-items: center;

  div {
    margin-left: 15px;
  }
}
</style>

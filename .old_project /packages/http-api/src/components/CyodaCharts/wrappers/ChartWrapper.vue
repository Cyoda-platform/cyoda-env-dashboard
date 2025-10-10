<template>
  <div>
    <template v-if="settings.dataSource === 'group'">
      <ChartWrapperGroup :tableLinkGroup="tableLinkGroup" :settings="settings" />
    </template>
    <template v-if="settings.dataSource === 'row'">
      <ChartWrapperRow :tableLinkGroup="tableLinkGroup" :settings="settings" />
    </template>
  </div>
</template>

<script setup lang="ts">
import ChartWrapperGroup from "./ChartWrapperGroup.vue";
import ChartWrapperRow from "./ChartWrapperRow.vue";

const props = defineProps({
  tableLinkGroup: { default: "" },
  settings: {
    default() {
      return {};
    }
  }
});
</script>

<style lang="scss">
.action {
  text-align: right;
}
</style>

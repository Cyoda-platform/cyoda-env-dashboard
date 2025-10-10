<template>
  <div>
    <CyodaModellingColDefs :readOnly="readOnly" :configDefinition="configDefinition" />
    <template v-if="showAliases">
      <hr />
      <CyodaModellingAliases :readOnly="readOnly" :configDefinition="configDefinition" />
    </template>
  </div>
</template>

<script setup lang="ts">
import CyodaModellingColDefs from "./CyodaModelling/CyodaModellingColDefs.vue";
import CyodaModellingAliases from "./CyodaModelling/CyodaModellingAliases.vue";

const props = defineProps({
  configDefinition: {
    default: () => {
      return {};
    }
  },
  readOnly: { default: false },
  showAliases: { default: true }
});
</script>

<style lang="scss" scoped>
hr {
  margin-top: 40px;
  margin-bottom: 20px;
}
</style>

<template>
  <transfer filterable :titles="['Possible columns values', 'Selected columns values']" :data="optionsData" fieldKey="name" fieldLabel="name" :strLengthRight="40" v-model="configDefinition.columns"> </transfer>
</template>

<script setup lang="ts">
import { computed } from "vue";

const props = defineProps({
  cols: { default: () => [] },
  configDefinition: {
    default: () => {
      return {};
    }
  }
});
const optionsData = computed(() => {
  return props.cols.map((el) => {
    return {
      "@bean": el["@bean"],
      name: el.alias,
    };
  });
});
</script>

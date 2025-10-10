<template>
  <CyodaEditor :modelValue="data" :editable="false" :is-object="true" language="json" />
</template>

<script setup lang="ts">
import CyodaEditor from "@cyoda/ui-lib/src/components-library/elements/CyodaEditor/CyodaEditor.vue";

const props = defineProps({
  data: {
    default: () => {
      return {};
    }
  }
});
</script>

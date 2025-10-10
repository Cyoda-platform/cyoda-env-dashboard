<template>
  <CyodaEditor v-model="jsonObj" :is-object="true" language="json" />
</template>

<script setup lang="ts">
import { ref, watch } from "vue";

import type { CatalogItem } from "@cyoda/ui-lib/src/types/types";
import CyodaEditor from "@cyoda/ui-lib/src/components-library/elements/CyodaEditor/CyodaEditor.vue";

const emit = defineEmits(["update:alias"]);
const props = defineProps({
  alias: {
    default() {
      return {};
    }
  }
});

let jsonObj = ref({});

watch(
  () => props.alias,
  (val: CatalogItem) => {
    if (JSON.stringify(jsonObj.value) !== JSON.stringify(val)) {
      jsonObj.value = val;
    }
  },
  { immediate: true, deep: true }
);

watch(
  jsonObj,
  (val: CatalogItem) => {
    if (JSON.stringify(props.alias) !== JSON.stringify(val)) {
      emit("update:alias", val);
    }
  },
  { immediate: true, deep: true }
);
</script>

<style lang="scss">
.cyoda-modelling-alias-settings-json {
  margin-top: 10px;
}
</style>

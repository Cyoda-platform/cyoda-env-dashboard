<template>
  <CyodaEditor v-model="jsonObj" :is-object="true" language="json" />
</template>

<script setup lang="ts">
import { ref, watch } from "vue";

import ConfigEditorTransfer from "../ConfigEditorTransfer.vue";
import type { IDefinitionContent } from "@cyoda/ui-lib/src/types/types";
import CyodaEditor from "@cyoda/ui-lib/src/components-library/elements/CyodaEditor/CyodaEditor.vue";

const emit = defineEmits(["update:configDefinition"]);
const props = defineProps({
  configDefinition: {
    default: () => {
      return {};
    }
  }
});

let jsonObj = ref({});

watch(
  () => props.configDefinition,
  (val: IDefinitionContent) => {
    if (JSON.stringify(jsonObj.value) !== JSON.stringify(val)) {
      jsonObj.value = val;
    }
  },
  { immediate: true, deep: true }
);

watch(
  jsonObj,
  (val: IDefinitionContent) => {
    if (JSON.stringify(props.configDefinition) !== JSON.stringify(val)) {
      emit("update:configDefinition", val);
    }
  },
  { immediate: true, deep: true }
);
</script>

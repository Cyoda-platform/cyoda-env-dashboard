<template>
  <transfer filterable :titles="['Possible sorting values', 'Selected sorting values']" :data="optionsData" fieldKey="column.name" fieldLabel="column.name" :strLengthRight="25" v-model="configDefinition.sorting">
    <template #custom-field="{item, updateFn}">
      Reverse
      <el-switch v-model="item.reverse" @change="updateFn"> </el-switch>
    </template>
  </transfer>
</template>

<script setup lang="ts">
import { computed } from "vue";

import type { IDefinitionContent, IDefinitionContentSorting, UIColumns } from "@cyoda/ui-lib/src/types/types";

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
      column: {
        "@bean": el["@bean"],
        name: el.alias
      },
      reverse: false
    };
  });
});

function onChangeReverse(item: IDefinitionContentSorting) {
  item.reverse = !item.reverse;
}
</script>

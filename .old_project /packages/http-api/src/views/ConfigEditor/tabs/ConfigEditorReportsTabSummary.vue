<template>
  <transfer filterable :titles="['Possible summary values', 'Selected summary values']" :data="optionsData" fieldKey="[0].name" fieldLabel="[0].name" :strLengthRight="20" v-model="configDefinition.summary">
    <template #custom-field="{ item }">
      <el-select class="select-type-summory" size="small" v-model="item[1][0]" placeholder="Select">
        <el-option v-for="option in getOptions(item[0])" :key="option" :label="option" :value="option"> </el-option>
      </el-select>
    </template>
  </transfer>
</template>

<script setup lang="ts">
import { computed } from "vue";

import HelperTypes from "@cyoda/ui-lib/src/helpers/HelperTypes";
import type { ReportColumn } from "@cyoda/ui-lib/src/types/types";

type Option = [ReportColumn, string[]];

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
    return [
      {
        "@bean": el["@bean"],
        name: el.alias
      },
      ["COUNT"]
    ];
  });
});

function getOptions(item: ReportColumn) {
  const col = props.cols.find((el) => el.alias === item.name);
  const type = col.typeShort;
  let result: string[] = [];
  if (HelperTypes.numbersTypes.indexOf(type) !== -1) {
    result = ["MAX", "MIN", "COUNT", "COUNT_UNIQUE", "SUM", "AVG"];
  } else {
    result = ["MAX", "MIN", "COUNT", "COUNT_UNIQUE"];
  }
  return result;
}
</script>

<style lang="scss">
.select-type-summory {
  min-width: 150px;
}
</style>

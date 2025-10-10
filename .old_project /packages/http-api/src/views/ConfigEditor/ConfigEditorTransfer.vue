<template>
  <div style="height: 400px">
    <transfer @change="onChange" filterable :filter-method="filterMethod" filter-placeholder="Search" :titles="titles" v-model="selectedList" :data="dataList"> </transfer>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from "vue";

import type { TransferOption } from "@cyoda/ui-lib/src/types/types";

const emit = defineEmits(["change", "input"]);
const props = defineProps({ possibleList: { default: () => [] }, titles: { default: () => [] }, value: { default: () => [] } });
const dataList = computed(() => {
  let list: Array<{ label: string; key: string }> = [];
  if (props.possibleList && props.possibleList.length > 0) {
    list = props.possibleList.map((el) => {
      return {
        label: el.alias,
        key: el.alias
      };
    });
  }
  return list;
});

let selectedList = ref([]);

function filterMethod(query: string, item: TransferOption) {
  return item.label.toLowerCase().indexOf(query.toLowerCase()) > -1;
}

function onChange(vals: string[]) {
  emit("change", vals);
}

watch(
  selectedList,
  (data: string[]) => {
    emit("input", data);
  },
  { immediate: true }
);

watch(
  () => props.value,
  (data: string[]) => {
    selectedList.value = data;
  },
  { immediate: true }
);
</script>

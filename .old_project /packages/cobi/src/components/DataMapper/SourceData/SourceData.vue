<template>
  <div>
    <template v-for="(key, index) in computedRows">
      <template v-if="(computedRowKey(key) === '*' && index === 0) || computedRowKey(key) !== '*'">
        <SourceDataRow ref="sourceDataRowRef" :findSourcePath="findSourcePath" :toggleExpand="toggleExpand"
                       :allDataRelations="allDataRelations" :parentTypeOfData="parentTypeOfData"
                       :parentPath="parentPath" :jsonParentPath="jsonParentPath" :level="level" :value="data[key]"
                       :jsonKey="key" :rowKey="computedRowKey(key)"
                       :key="`${computedRowKey(key)}${selectedEntityMapping.isPolymorphicList}`"
                       :selectedEntityMapping="selectedEntityMapping" :notExistRelations="notExistRelations"/>
      </template>
    </template>
    <template v-if="isShowLoadMore">
      <SourceDataRowLoadMore :allDataRelations="allDataRelations" :jsonParentPath="jsonParentPath"
                             :numberRows="numberRows" :data="data" :parentTypeOfData="parentTypeOfData"
                             :isDisabledLoadMore="isDisabledLoadMore" :isDisabledHideMore="isDisabledHideMore"
                             @loadMore="onLoadMore" @hideMore="onHideMore"/>
    </template>
  </div>
</template>

<script setup lang="ts">
import {ref, nextTick, computed} from "vue";

import SourceDataRow from "./SourceDataRow.vue";
import SourceDataRowLoadMore from "./SourceDataRowLoadMore.vue";
import eventBus from "@cyoda/ui-lib/src/plugins/eventBus";

const sourceDataRowRef = ref(null);
const props = defineProps({
  data: undefined,
  allDataRelations: undefined,
  level: undefined,
  parentTypeOfData: undefined,
  parentPath: undefined,
  jsonParentPath: undefined,
  assignMode: {default: "multiple"},
  toggleExpand: undefined,
  findSourcePath: undefined,
  notExistRelations: {default: () => []},
  selectedEntityMapping: {
    default: () => {
      return {};
    }
  }
});
const isArray = computed(() => {
  return Array.isArray(props.data);
});
const numberRows = computed(() => {
  let num = pageSize.value * (page.value + 1);
  if (num > props.data.length) num = props.data.length;
  return num;
});
const isShowLoadMore = computed(() => {
  return props.selectedEntityMapping.isPolymorphicList && props.data.length > 3;
});
const isDisabledLoadMore = computed(() => {
  return isArray.value && numberRows.value >= props.data.length;
});
const isDisabledHideMore = computed(() => {
  return isArray.value && numberRows.value <= 3;
});
const computedRows = computed(() => {
  if (isArray.value && props.selectedEntityMapping.isPolymorphicList) {
    const data = props.data.slice(0, numberRows.value);
    return Object.keys(data);
  }
  return Object.keys(props.data);
});

const pageSize = ref(3);
const page = ref(0);

function computedRowKey(key: any) {
  if (props.selectedEntityMapping.isPolymorphicList) return key;

  if (props.parentTypeOfData == "array" && props.assignMode == "multiple") {
    return "*";
  }
  return key;
}

async function onLoadMore() {
  page.value += 1;
  await nextTick();

  eventBus.$emit("updateRelations");
}

async function onHideMore() {
  page.value -= 1;
  await nextTick();

  eventBus.$emit("updateRelations");
}

defineExpose({sourceDataRowRef});
</script>

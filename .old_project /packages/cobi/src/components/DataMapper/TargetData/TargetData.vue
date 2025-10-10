<template>
  <div v-loading="isLoading">
    <template v-for="(reportInfoRow, index) in reportingInfoRowsComputed" :key="index">
      <TargetDataRow :reportInfoRow="reportInfoRow" :allDataRelations="allDataRelations" :findTargetPath="findTargetPath" :toggleExpand="toggleExpand" :selectedEntityMapping="selectedEntityMapping" :notExistRelations="notExistRelations" />
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, nextTick, computed, watch } from "vue";

import * as api from "@cyoda/ui-lib/src/api";
import HelperModelling from "../../../helpers/HelperModelling";
import TargetDataRow from "../../../components/DataMapper/TargetData/TargetDataRow.vue";
import eventBus from "@cyoda/ui-lib/src/plugins/eventBus";

const props = defineProps({
  selectedEntityMapping: {
    default: () => {
      return {};
    }
  },
  requestParam: {
    default: () => {
      return {};
    }
  },
  allDataRelations: undefined,
  noneMappingFields: { default: () => [] },
  toggleExpand: undefined,
  findTargetPath: undefined,
  notExistRelations: { default: () => [] }
});
const reportingInfoRowsComputed = computed(() => {
  if (!props.selectedEntityMapping.isShowNoneMappingFields) return reportingInfoRows.value;

  return reportingInfoRows.value.filter((el) => {
    return !props.noneMappingFields.includes(el.columnPath);
  });
});

let reportingInfoRows = ref([]);
const isLoading = ref<boolean>(false);
const emit = defineEmits(["loaded"]);

async function loadEntity() {
  let response = [];
  if (props.requestParam) {
    const { data } = await api.getReportingInfo(props.selectedEntityMapping.entityClass, props.requestParam.reportClass, props.requestParam.columnPath);
    response = data;
  } else {
    const { data } = await api.getReportingInfo(props.selectedEntityMapping.entityClass);
    response = data;
  }
  reportingInfoRows.value = HelperModelling.sortData(HelperModelling.filterData(response));
  emit("loaded");
  await nextTick();

  eventBus.$emit("updateRelations");
}

watch(
  () => props.selectedEntityMapping.entityClass,
  async () => {
    isLoading.value = true;
    try {
      await loadEntity();
    } finally {
      isLoading.value = false;
    }
  },
  { immediate: true }
);
</script>

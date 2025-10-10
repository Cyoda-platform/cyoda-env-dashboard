<template>
  <span class="column-settings">
    <el-tooltip :show-after="1000" class="item" effect="dark" content="Transform settings" placement="top">
      <font-awesome-icon
        :class="{
          success: !isSettingsError,
          error: isSettingsError
        }"
        @click="onOpenSettings"
        class="settings"
        icon="cogs"
      />
    </el-tooltip>

    <DialogColumnSettings ref="dialogColumnSettingsRef" :selectedEntityMapping="selectedEntityMapping" />
  </span>
</template>

<script setup lang="ts">
import { usePlatformMappingStore } from "../../../stores/platform-mapping";
import { ref, nextTick, computed } from "vue";

import DialogColumnSettings from "./DialogColumnSettings.vue";
import HelperMapper from "../../../helpers/HelperMapper";

const props = defineProps({
  functionalMappingConfig: {
    default: () => {
      return {};
    }
  },
  selectedEntityMapping: {
    default: () => {
      return {};
    }
  },
  reportInfoRow: {
    default: () => {
      return {};
    }
  }
});
const platformMappingStore = usePlatformMappingStore();
const listAllTransformers = computed(() => {
  return platformMappingStore.listAllTransformers;
});
const isSettingsError = computed(() => {
  if (!props.functionalMappingConfig.statements) return true;
  return HelperMapper.isFunctionalMappingRelationHaveError(props.functionalMappingConfig);
});

const dialogColumnSettingsRef = ref(null);

async function onOpenSettings() {
  if (!props.functionalMappingConfig.dstPath) {
    props.selectedEntityMapping.functionalMappings.push({
      "@bean": "com.cyoda.plugins.mapping.core.dtos.functional.FunctionalMappingConfigDto",
      srcPaths: [],
      name: null,
      statements: [],
      dstPath: props.reportInfoRow.columnPath,
      collectElemsSetModes: [],
      metaPaths: []
    });
    await nextTick();

    dialogColumnSettingsRef.value.openDialogAndEditRecord(props.functionalMappingConfig);

    return;
  }
  dialogColumnSettingsRef.value.openDialogAndEditRecord(props.functionalMappingConfig);
}
</script>

<style scoped lang="scss">
.column-settings {
  .settings {
    opacity: 0.6;
    cursor: pointer;
    transition: all 0.5s;
    margin-left: 10px;

    &:hover {
      opacity: 1;
    }

    &.success {
      color: #67c23a;
    }

    &.error {
      color: #f56c6c;
    }
  }
}
</style>

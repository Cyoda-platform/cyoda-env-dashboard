<template>
  <span class="column-settings">
    <el-tooltip :show-after="1000" class="item" effect="dark" content="Meta Data" placement="top">
      <font-awesome-icon
        :class="{
          success: !isSettingsError,
          error: isSettingsError
        }"
        @click="onOpenSettings"
        class="settings"
        icon="database"
      />
    </el-tooltip>

    <DialogMetaData ref="dialogMetaDataRef" :dstCyodaColumnPath="dstCyodaColumnPath" :dstCyodaColumnPathType="dstCyodaColumnPathType" :selectedEntityMapping="selectedEntityMapping" />
  </span>
</template>

<script setup lang="ts">
import { usePlatformMappingStore } from "../../../stores/platform-mapping";
import { ref, computed } from "vue";

import DialogMetaData from "../../../components/DataMapper/MetaData/DialogMetaData.vue";

const props = defineProps({
  dstCyodaColumnPath: {
    default: ""
  },
  dstCyodaColumnPathType: {
    default: ""
  },
  element: {
    default: () => {
      return {};
    }
  },
  selectedEntityMapping: {
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
  return !props.selectedEntityMapping.metadata.find((el) => el.dstCyodaColumnPath === props.dstCyodaColumnPath);
});

const dialogMetaDataRef = ref(null);

function onOpenSettings() {
  dialogMetaDataRef.value.dialogVisible = true;
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

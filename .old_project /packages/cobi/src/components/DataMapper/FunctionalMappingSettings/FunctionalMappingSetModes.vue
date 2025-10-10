<template>
  <span class="column-mapping-set-modes">
    <el-tooltip :show-after="1000" class="item" effect="dark" content="Collection Element Set Modes" placement="top">
      <font-awesome-icon @click="onOpenDialog" class="icon" icon="fa-solid fa-code-merge" />
    </el-tooltip>

    <DialogMappingSetModes ref="dialogMappingSetModesRef" @change="functionalMappingConfig.collectElemsSetModes = $event" :collectElemsSetModes="functionalMappingConfig.collectElemsSetModes" :key="activeKey" :path="functionalMappingConfig.dstPath" />
  </span>
</template>

<script setup lang="ts">
import { ref, nextTick } from "vue";

import DialogMappingSetModes from "../DialogMappingSetModes.vue";

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
  }
});

const dialogMappingSetModesRef = ref(null);

const activeKey = ref(0);

function onOpenDialog() {
  activeKey.value += 1;
  setTimeout(async () => {
    await nextTick();

    dialogMappingSetModesRef.value.dialogVisible = true;
  }, 200);
}
</script>

<style scoped lang="scss">
.column-mapping-set-modes {
  .icon {
    color: #67c23a;
    cursor: pointer;
    margin-left: 10px;
  }
}
</style>

<template>
  <span>
    <template v-if="!isNew">
      <el-tooltip :show-after="500" effect="dark" content="History" placement="top">
        <el-button @click="onOpenHistory" type="primary">
          <font-awesome-icon icon="clock-rotate-left" />
        </el-button>
      </el-tooltip>
      <DrawerHistory ref="drawerHistoryRef" :dataDto="dataDto" :getHistory="getHistory" :getHistoryByTimeUid="getHistoryByTimeUid" />
    </template>
  </span>
</template>
<script setup lang="ts">
import { ref, computed } from "vue";

import DrawerHistory from "./DrawerHistory.vue";

const props = defineProps({
  getHistory: undefined,
  getHistoryByTimeUid: undefined,
  dataDto: {
    default: () => {
      return {};
    }
  }
});
const isNew = computed(() => {
  return !props.dataDto.id;
});

const drawerHistoryRef = ref(null);

function onOpenHistory() {
  drawerHistoryRef.value.drawerVisiable = true;
}
</script>

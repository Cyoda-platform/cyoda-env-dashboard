<template>
  <span @click="onShowPopover" class="column-mapping-set-modes">
    <el-popover popper-class="popover-actions" :disabled="columns.length<2" v-model:visible="visibleTooltip" width="auto" placement="top-start" title="Actions"
                trigger="click">
      <template v-for="(column, index) in columns" :key="index">
        <div class="action">
          <el-button @click="onOpenDialog(column)" link type="primary">
            {{ column.srcColumnPath }}
          </el-button>
        </div>
      </template>
      <template #reference>
        <span>
        <el-tooltip :show-after="1000" class="item" effect="dark" content="Collection Element Set Modes"
                    placement="top">
          <font-awesome-icon class="icon" icon="fa-solid fa-code-merge"/>
        </el-tooltip>
          </span>
      </template>
    </el-popover>

    <DialogMappingSetModes ref="dialogMappingSetModesRef" v-if="Object.keys(activeColumn).length > 0"
                           @change="activeColumn.dstCollectionElementSetModes = $event"
                           :collectElemsSetModes="activeColumn.dstCollectionElementSetModes" :key="activeKey"
                           :path="activeColumn.dstCyodaColumnPath"/>
  </span>
</template>

<script setup lang="ts">
import {ref, nextTick} from "vue";
import DialogMappingSetModes from "../DialogMappingSetModes.vue";

const props = defineProps({
  columns: {
    default: () => {
      return [];
    }
  },
  selectedEntityMapping: {
    default: () => {
      return {};
    }
  }
});

const dialogMappingSetModesRef = ref(null);

const visibleTooltip = ref<boolean>(false);
const activeKey = ref(0);
let activeColumn = ref({});

function onOpenDialog(column) {
  activeKey.value += 1;
  activeColumn.value = column;
  setTimeout(async () => {
    await nextTick();

    dialogMappingSetModesRef.value.dialogVisible = true;
  }, 200);
}

function onShowPopover() {
  if (props.columns.length < 2) {
    onOpenDialog(props.columns[0]);
  }
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

.popover-actions .action {
  padding: 10px 0;
}
</style>

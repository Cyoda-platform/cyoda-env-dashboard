<template>
  <span class="column-settings">
    <el-popover popper-class="popover-actions" v-model:visible="visibleTooltip" placement="top-start" title="Actions"
                trigger="click" @before-enter="onShowPopover">
      <template v-for="(column, index) in columns" :key="index">
        <div class="action">
          <el-button @click="onOpenSettings(column)" type="primary" link>
            {{ column.srcColumnPath }}
          </el-button>
        </div>
      </template>
      <template #reference>
        <div>
        <el-tooltip :show-after="1000" class="item" effect="dark" content="Transform settings" placement="top">
          <font-awesome-icon
            :class="computedClass"
            class="settings"
            icon="cogs"
          />
        </el-tooltip>
          </div>
      </template>
    </el-popover>

    <DialogColumnSettings :key="activeTransformerKey" v-show="Object.keys(activeColumn).length > 0"
                          ref="dialogColumnSettingsRef" :column="activeColumn"/>
  </span>
</template>

<script setup lang="ts">
import {usePlatformMappingStore} from "../../../stores/platform-mapping";
import {ref, nextTick, computed} from "vue";

import DialogColumnSettings from "./DialogColumnSettings.vue";
import HelperMapper from "../../../helpers/HelperMapper";

const props = defineProps({
  columns: {
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
  return props.columns.some((column) => {
    return HelperMapper.isColumnHaveTransformError(column, listAllTransformers.value);
  });
});

const dialogColumnSettingsRef = ref(null);

let activeColumn = ref({});

const visibleTooltip = ref<boolean>(false);
const activeTransformerKey = ref(0);

const computedClass = computed(() => {
  const isExist = props.columns.some((column) => {
    return column?.transformer?.children?.length > 0;
  });
  if (!isExist) {
    return {default: true}
  } else if (isSettingsError.value) {
    return {error: true}
  }
  return {success: true}
})

function onOpenSettings(column) {
  activeTransformerKey.value += 1;
  activeColumn.value = column

  visibleTooltip.value = false;
  setTimeout(async () => {
    await nextTick();

    dialogColumnSettingsRef.value.dialogVisible = true;
  }, 200);
}

function onShowPopover() {
  if (props.columns.length < 2) {
    onOpenSettings(props.columns[0]);
  }
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

    &.default {
      color: #f56c6c;
    }

    &.success {
      color: #67c23a;
    }

    &.error {
      color: red;
      opacity: 1;
    }
  }
}

.popover-actions .action {
  padding: 10px 0;
}
</style>

<template>
  <span class="column-unique-check">
    <template v-if="isCanBeAddToUniqueCheck">
      <el-tooltip :show-after="1000" class="item" effect="dark" content="Column Path For Unique Check" placement="top">
        <span @click="onToggleAddUniqueCheck" class="column-path-for-unique-check" :class="{ selected: isSelected }">U</span>
      </el-tooltip>
    </template>
  </span>
</template>

<script setup lang="ts">
import { computed } from "vue";

const props = defineProps({
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
const isCanBeAddToUniqueCheck = computed(() => {
  return dstPath.value.split("*").length === 1;
});
const dstPath = computed(() => {
  return props.element.columnPath;
});
const isSelected = computed(() => {
  return props.selectedEntityMapping.columnPathsForUniqueCheck && props.selectedEntityMapping.columnPathsForUniqueCheck.find((el) => el === dstPath.value);
});

function onToggleAddUniqueCheck() {
  if (!("columnPathsForUniqueCheck" in props.selectedEntityMapping)) {
    props.selectedEntityMapping["columnPathsForUniqueCheck"] = [];
  }

  if (props.selectedEntityMapping.columnPathsForUniqueCheck.indexOf(dstPath.value) == -1) {
    props.selectedEntityMapping.columnPathsForUniqueCheck.push(dstPath.value);
  } else {
    props.selectedEntityMapping.columnPathsForUniqueCheck = props.selectedEntityMapping.columnPathsForUniqueCheck.filter((el) => el !== dstPath.value);
  }
}
</script>

<style scoped lang="scss">
.column-unique-check {
  .column-path-for-unique-check {
    display: inline-block;
    width: 16px;
    height: 16px;
    text-align: center;
    line-height: 16px;
    margin-left: 10px;
    background: #909399;
    color: #fff;
    border-radius: 2px;
    font-size: 12px;
    cursor: pointer;
    opacity: 0.6;
    transition: opacity 0.5s;
    &:hover {
      opacity: 1;
    }

    &.selected {
      background-color: #67c23a;
    }
  }
}
</style>

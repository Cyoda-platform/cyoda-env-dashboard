<template>
  <div class="list-component">
    <h2>
      {{ name }}
    </h2>
    <div class="box-list">
      <el-checkbox-group :min="min" :max="maxLocal" @change="onChange" class="wrap-checkbox-group" v-model="selected">
        <el-checkbox v-for="option in options" :key="option.value" size="default" :label="option.value">{{
            option.label
          }}
        </el-checkbox>
      </el-checkbox-group>
    </div>
  </div>
</template>

<script setup lang="ts">
import {ref, watch, computed, nextTick} from "vue";

import {ElementUiOption} from "@/types/types";

const emit = defineEmits(["change", "update:modelValue"]);
const props = defineProps({
  options: {default: () => []},
  name: {default: ""},
  min: {default: 0},
  max: {default: 9999},
  modelValue: {default: () => []},
  allowChange: {default: false}
});

const maxLocal = computed(() => {
  if (!props.allowChange) return props.max;
  return props.max + 1;
});

let selected = ref([]);

function onChange(value) {
  const newValue = JSON.parse(JSON.stringify(value));
  if (props.allowChange && newValue.length > 1) {
    newValue.shift();
    selected.value = newValue;
  }
  emit("change", newValue);
  emit("update:modelValue", newValue);
}

watch(
  () => props.modelValue,
  () => {
    selected.value = props.modelValue;
  },
  {immediate: true}
);
</script>

<style lang="scss">
.list-component {
  h2 {
    margin-top: 15px;
    margin-bottom: 5px !important;
    color: #595959;
    font-size: 20px;
  }

  .box-list {
    overflow: hidden;
    border: 1px solid #bdc3c7;

    .el-checkbox__inner {
      display: none !important;
    }

    label {
      padding: 5px;
      border-bottom: 1px solid #ebeef5;
      border-left: 2px solid transparent;

      &.is-checked {
        background-color: #f0f9eb;
        border-left: 2px solid orange;
      }
    }
  }

  .el-checkbox__input.is-checked + .el-checkbox__label {
    color: rgb(96, 98, 102) !important;
  }

  .el-checkbox__label {
    line-height: 21px;
  }

  .el-checkbox {
    display: block;
    margin-right: 0;
  }
}
</style>

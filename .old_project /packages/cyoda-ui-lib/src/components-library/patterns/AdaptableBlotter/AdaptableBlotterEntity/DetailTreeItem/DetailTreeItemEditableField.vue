<template>
  <div class="detail-tree-item-editable-field" :class="{ 'is-focused': isFocused }">
    <template v-if="clazzType === 'Boolean'">
      <el-checkbox :disabled="isDisabled" @change="onChange" v-model="form.value" />
    </template>
    <template v-else-if="clazzType.indexOf('Date') > -1">
      <DateTimePicker :disabled="isDisabled" @change="onChange" v-model="form.value" />
    </template>
    <template v-else>
      <el-input @focus="onFocus" @blur="onBlur" :disabled="isDisabled" @change="onChange" size="small" class="input-field" v-model="form.value">
        <template slot="prepend">
          <font-awesome-icon icon="heading" />
        </template>
      </el-input>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from "vue";

import { Column } from "../../../../../types/types";
import DateTimePicker from "@cyoda/ui-lib/src/components-library/patterns/DateTimePicker/DateTimePicker.vue";
import {useDetailEntityStore} from "@cyoda/http-api/src/stores/detail-entity";

const props = defineProps({
  column: {
    default: () => {
      return {};
    }
  },
  itemValue: {
    default: ""
  }
});
const detailEntityStore = useDetailEntityStore();
const clazzType = computed(() => {
  return props.column.columnInfo.clazzType.split(".").pop();
});
const isDisabled = computed(() => {
  const listNotEditableFields = ["lastUpdateTime"];
  return listNotEditableFields.indexOf(props.column.columnInfo.columnPath) > -1;
});
function addEditableItem(form) {
  return detailEntityStore.addEditableItem(form);
}

let form = ref({
  columnPath: "",
  value: ""
});

const isFocused = ref<boolean>(false);

form.value.columnPath = props.column.columnInfo.columnPath;

function getValue(value: string) {
  if (value === "-") {
    return "";
  } else if (clazzType.value === "Boolean") {
    if (typeof props.itemValue === "boolean") {
      return value;
    } else {
      return value === "true";
    }
  }
  return value;
}

function onChange() {
  addEditableItem(form.value);
}

function onFocus() {
  isFocused.value = true;
}

function onBlur() {
  isFocused.value = false;
}

watch(
  clazzType,
  (val: string) => {
    if (val) {
      form.value.value = getValue(props.itemValue);
    }
  },
  { immediate: true }
);
</script>

<style lang="scss">
.detail-tree-item-editable-field {
  .el-input__inner, .el-input__wrapper {
    box-shadow: none;
    border: none;
    border-radius: 0;
    background: #f1f1f1;
    height: 38px !important;
    padding: 0;
    transition: background-color 0.5s;
  }

  &.is-focused {
    .el-input__inner,
    .el-input-group__prepend {
      background: #fff;
    }
  }

  .el-date-editor.el-input {
    width: 100% !important;
  }

  .el-input-group__prepend {
    border: none;
    padding: 0 10px;
    background: #f1f1f1;
    border-radius: 0;
    border-left: 1px solid #dfe6ec !important;
    transition: background-color 0.5s;
  }

  .el-checkbox {
    padding-left: 10px;
  }
}
</style>

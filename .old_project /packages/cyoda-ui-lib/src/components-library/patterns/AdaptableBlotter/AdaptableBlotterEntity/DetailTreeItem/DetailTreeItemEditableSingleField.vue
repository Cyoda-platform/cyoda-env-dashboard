<template>
  <el-dialog :close-on-click-modal="false" class="detail-tree-item-editable-single-field" title="Edit" append-to-body v-model="dialogVisible" width="600px">
    <el-form label-position="top" ref="form" :model="form" label-width="120px">
      <el-form-item label="Transition">
        <el-select :disabled="isSaveLoading" v-model="form.transition" placeholder="Select">
          <el-option v-for="item in optionsTransitions" :key="item.value" :label="item.label" :value="item.value"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item :label="currentField">
        <el-input :disabled="isSaveLoading" placeholder="Please input" v-model="form.value" />
      </el-form-item>
    </el-form>
    <template #footer>
      <span class="dialog-footer">
      <el-button @click="dialogVisible = false">Cancel</el-button>
      <el-button :loading="isSaveLoading" type="primary" @click="onSave">Save</el-button>
    </span>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, watch } from "vue";

import { Column, ElementUiOption, EntityRequest } from "../../../../../types/types";
import * as api from "@cyoda/ui-lib/src/api";
import eventBus from "../../../../../plugins/eventBus";

const props = defineProps({
  requestClass: {
    default: ""
  },
  id: {
    default: ""
  },
  column: {
    default: () => {
      return {};
    }
  },
  currentField: {
    default: ""
  },
  itemValue: {
    default: ""
  }
});

const dialogVisible = ref<boolean>(false);

const isSaveLoading = ref<boolean>(false);

const form = {
  value: props.itemValue === "-" ? "" : props.itemValue,
  transition: ""
};

let optionsTransitions = ref([]);

async function onSave() {
  const data: EntityRequest = {
    entityClass: props.requestClass,
    entityId: props.id,
    transition: form.transition,
    transactional: false,
    async: false,
    values: [
      {
        columnPath: props.column.columnInfo.columnPath,
        value: form.value
      }
    ]
  };
  try {
    isSaveLoading.value = true;
    await api.putEntity(data);
    eventBus.$emit("dialogDetailTreeItemEditableSingleField");
    dialogVisible.value = false;
  } finally {
    isSaveLoading.value = false;
  }
}

async function loadTransitions() {
  const { data } = await api.getTransitionsForEntity(props.id, props.requestClass);
  optionsTransitions.value = data.map((el) => {
    return {
      value: el,
      label: el
    };
  });
}

function resetForm() {
  form.value = "";
  form.transition = "";
}

watch(dialogVisible, async (val: boolean) => {
  if (val) {
    await loadTransitions();
  }
});

defineExpose({ dialogVisible });
</script>

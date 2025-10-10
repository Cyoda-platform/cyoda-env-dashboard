<template>
  <el-dialog :close-on-click-modal="false" class="catalog-of-aliases-change-state" title="Attempt transition" v-model="dialogVisible" width="500px">
    <el-form v-loading="loading" label-position="left" label-width="100px">
      <el-form-item label="State">
        <el-select v-model="value" placeholder="Select">
          <el-option v-for="item in optionsTransitions" :key="item.value" :label="item.label" :value="item.value"> </el-option>
        </el-select>
      </el-form-item>
    </el-form>
    <template #footer>
      <span class="dialog-footer">
      <el-button @click="dialogVisible = false">Cancel</el-button>
      <el-button type="primary" @click="onConfirm">Confirm</el-button>
    </span>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ElNotification } from "element-plus";
import { ref, computed, watch } from "vue";

import * as api from "@cyoda/ui-lib/src/api";

const optionsTransitions = computed(() => {
  return transitions.value.map((el) => {
    return {
      value: el,
      label: el
    };
  });
});

const dialogVisible = ref<boolean>(false);
const id = ref<string>("");
const loading = ref<boolean>(false);
let transitions = ref([]);
const value = ref<string>("");
const entityClass = ref<string>("com.cyoda.core.model.catalog.AliasCatalogItem");
const emit=defineEmits(['updated']);

async function onConfirm() {
  if (value.value) {
    try {
      loading.value = true;
      await api.putTransitionsForEntity(id.value, entityClass.value, value.value);
    } finally {
      loading.value = false;
      dialogVisible.value = false;
    }
    emit("updated");
  } else {
    ElNotification({
      title: "Warning",
      message: "Please select state",
      type: "warning"
    });
  }
}

watch(dialogVisible, () => {
  value.value = "";
});

watch(id, async (id: string) => {
  if (id) {
    try {
      loading.value = true;
      const { data } = await api.getTransitionsForEntity(id, entityClass.value);
      transitions.value = data;
    } finally {
      loading.value = false;
    }
  }
});

defineExpose({ dialogVisible, id });
</script>

<style lang="scss">
.catalog-of-aliases-change-state {
  .el-select {
    width: 100%;
  }
}
</style>

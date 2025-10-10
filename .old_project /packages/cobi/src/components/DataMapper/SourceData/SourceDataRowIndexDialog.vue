<template>
  <el-dialog class="source-data-row-index-dialog" appendToBody title="Index" v-model="dialogVisible" width="400px">
    <el-form ref="formRef" class="full-width" :model="form" label-position="top" label-width="120px">
      <el-form-item label="">
        <el-input-number v-model="form.index" :min="0"></el-input-number>
      </el-form-item>
    </el-form>
    <template #footer>
    <span class="dialog-footer">
      <el-button @click="dialogVisible = false">Close</el-button>
      <el-button type="primary" @click="onClickSave">Save</el-button>
    </span>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref } from "vue";

const emit = defineEmits(["save"]);

const dialogVisible = ref<boolean>(false);

let form = ref({
  index: 0
});

function openForm(value) {
  form.value.index = value;
  dialogVisible.value = true;
}
function onClickSave() {
  emit("save", form.value.index);
  dialogVisible.value = false;
}

defineExpose({ openForm });
</script>

<style lang="scss">
.source-data-row-index-dialog {
  .el-input-number {
    width: 100%;
  }
  .el-dialog__body {
    padding: 20px;
  }
}
</style>

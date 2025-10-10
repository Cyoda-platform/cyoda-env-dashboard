<template>
  <el-dialog :close-on-click-modal="false" append-to-body title="Add New Variable" v-model="dialogVisible" width="30%">
    <el-form @submit.native.prevent="onAddVariable" ref="formRef" :model="form" label-width="120px">
      <el-form-item label="Variable Name">
        <el-input v-model="form.name"></el-input>
      </el-form-item>
    </el-form>
    <template #footer>
    <span class="dialog-footer">
      <el-button @click="dialogVisible = false">Cancel</el-button>
      <el-button type="primary" @click="onAddVariable">Add</el-button>
    </span>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, watch } from "vue";

const emit = defineEmits(["add"]);

const dialogVisible = ref<boolean>(false);

let defaultForm = ref({
  name: ""
});

let form = ref(JSON.parse(JSON.stringify(defaultForm.value)));
function onAddVariable() {
  emit("add", form.value.name);
  dialogVisible.value = false;
}

function resetForm() {
  form.value = JSON.parse(JSON.stringify(defaultForm.value));
}

watch(
  dialogVisible,
  (val) => {
    if (val) {
      resetForm();
    }
  }
);

defineExpose({ dialogVisible });
</script>

<style scoped lang="scss">
.blocklyDiv {
  height: 300px;
  width: 100%;
  text-align: left;
}
</style>

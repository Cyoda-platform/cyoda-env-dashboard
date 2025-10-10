<template>
  <el-dialog
    v-model="dialogVisible"
    title="Create"
    width="500"
  >
    <el-form :model="form" label-width="auto" style="max-width: 600px">
      <el-form-item label="Schema Name">
        <el-input v-model="form.name"/>
      </el-form-item>
    </el-form>
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="dialogVisible = false">Cancel</el-button>
        <el-button type="primary" @click="onCreate">
          Save
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import {reactive, watch, ref} from "vue";

const dialogVisible = ref(false);
const defaultForm = {
  name: ''
}

let form = reactive(defaultForm);
const emit = defineEmits(['save']);

function onCreate() {
  emit('create', form);
  dialogVisible.value = false;
}

function resetForm() {
  form = reactive(defaultForm);
}

watch(dialogVisible, (value) => {
  if (!value) resetForm()
});

defineExpose({dialogVisible});
</script>

<style lang="scss">

</style>

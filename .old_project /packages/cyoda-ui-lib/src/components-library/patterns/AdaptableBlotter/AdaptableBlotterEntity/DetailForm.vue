<template>
  <el-form ref="formRef" label-width="150px">
    <el-form-item label="Show Empty Fields">
      <el-switch v-model="form.isShowEmpty"></el-switch>
    </el-form-item>
  </el-form>
</template>

<script setup lang="ts">
import { ref, watch } from "vue";

const emit = defineEmits(["change"]);

let form = ref({
  isShowEmpty: false
});

watch(
  form,
  () => {
    emit("change", form.value);
  },
  { immediate: true, deep: true }
);
</script>

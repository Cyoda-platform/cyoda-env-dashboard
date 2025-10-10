<template>
  <el-form :inline="true" class="actions-settings-inner" label-width="150px">
    <el-form-item label="Condense the paths">
      <el-switch v-model="form.isCondenseThePaths"></el-switch>
    </el-form-item>
    <span class="delimiter">|</span>
    <el-form-item label="Open all selected">
      <el-switch v-model="form.isOpenAllSelected"></el-switch>
    </el-form-item>
  </el-form>
</template>

<script setup lang="ts">
import { ref, watch } from "vue";

const emit = defineEmits(["change"]);

let form = ref({
  isOpenAllSelected: false,
  isCondenseThePaths: false
});

watch(
  form,
  () => {
    emit("change", form.value);
  },
  { deep: true }
);
</script>

<style scoped lang="scss">
.actions-settings-inner {
  .el-form-item {
    margin: 0;
  }

  .el-form-item__label {
    width: auto !important;
  }

  .delimiter {
    margin: 0 20px;
    display: inline-block;
    font-size: 25px;
    position: relative;
    top: 5px;
  }
}
</style>

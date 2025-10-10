<template>
  <div>
    <h2>Settings</h2>
    <el-form :inline="true" label-position="left" ref="formRef">
      <el-form-item label="Lazy loading">
        <el-switch v-model="settings.lazyLoading"></el-switch>
      </el-form-item>
      <el-form-item label="Group display">
        <el-radio-group v-model="settings.displayGroupType">
          <el-radio-button label="in">In Table</el-radio-button>
          <el-radio-button label="out">Out Table</el-radio-button>
        </el-radio-group>
      </el-form-item>
    </el-form>
  </div>
</template>

<script setup lang="ts">
const emit = defineEmits(["update:modelValue",]);
const props = defineProps({
  settings: {
    default: () => {
      return {};
    }
  }
})
</script>

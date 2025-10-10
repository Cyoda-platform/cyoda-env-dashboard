<template>
  <div class="dialog-connection-workflow">
    <el-form-item label="Name" prop="name">
      <el-input v-model.trim="connectionDetailsDto.name" />
    </el-form-item>
  </div>
</template>

<script setup lang="ts">
const props = defineProps({
  connectionDetailsDto: {
    default: () => {
      return {};
    }
  }
});
</script>

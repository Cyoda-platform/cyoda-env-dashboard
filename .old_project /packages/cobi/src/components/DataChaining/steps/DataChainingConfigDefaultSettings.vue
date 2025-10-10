<template>
  <div class="data-mapper-default-settings">
    <el-form-item label="Name" prop="name">
      <el-input v-model="chainingConfigDto.name"></el-input>
    </el-form-item>

    <el-form-item label="Description" prop="description">
      <el-input type="textarea" :autosize="{ minRows: 4, maxRows: 6 }" v-model="chainingConfigDto.description"></el-input>
    </el-form-item>
  </div>
</template>

<script setup lang="ts">
const props = defineProps({
  chainingConfigDto: {
    default: () => {
      return {};
    }
  }
});
</script>

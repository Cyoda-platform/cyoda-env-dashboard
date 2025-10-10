<template>
  <div class="data-mapper-default-settings">
    <el-form-item label="Active" prop="active">
      <el-switch v-model="dataSourceConfigDto.active" />
    </el-form-item>
    <el-form-item label="Name" prop="name">
      <el-input v-model="dataSourceConfigDto.name"></el-input>
    </el-form-item>
    <el-form-item label="Description" prop="description">
      <el-input type="textarea" :autosize="{ minRows: 4, maxRows: 6 }" v-model="dataSourceConfigDto.description"></el-input>
    </el-form-item>
  </div>
</template>

<script setup lang="ts">
const props = defineProps({
  dataSourceConfigDto: {
    default: () => {
      return {};
    }
  }
});
</script>

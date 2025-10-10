<template>
  <div class="upload-file-sample-column-configuration">
    <el-form-item prop="name" label="Name">
      <el-input placeholder="Please input" v-model="configDto.name" />
    </el-form-item>
  </div>
</template>

<script setup lang="ts">
const props = defineProps({
  configDto: {
    default: () => {
      return {};
    }
  }
});
</script>

<style lang="scss">
.upload-file-sample-column-configuration {
  margin-top: 15px;
  .wrap-buttons {
    margin-top: 5px;
  }

  .note {
    color: #b3b3b3;
  }
}
</style>

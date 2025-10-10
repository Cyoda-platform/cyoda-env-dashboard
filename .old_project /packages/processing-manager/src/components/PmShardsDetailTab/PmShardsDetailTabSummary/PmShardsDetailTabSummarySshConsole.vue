<template>
  <el-dialog :close-on-click-modal="false" title="Ssh console" v-model="dialogVisible" fullscreen>
    <iframe title="Ssh console" v-if="dialogVisible" :src="link" width="100%" height="700px" frameborder="0"></iframe>
    <template #footer>
      <span class="dialog-footer">
      <el-button @click="dialogVisible = false">Close</el-button>
    </span>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref } from "vue";

const dialogVisible = ref<boolean>(false);

const link = ref<string>("");

defineExpose({dialogVisible, link});
</script>

<style scoped>
svg {
  margin-right: 5px;
}

.flex {
  display: flex;
  justify-content: space-between;
}
</style>

<style lang="scss">
.el-form-ssh-settings {
  .el-form-item__content {
    width: auto !important;
  }
}
</style>

<template>
  <el-upload action="#" class="upload" drag :auto-upload="false" :on-change="onChange" :show-file-list="false">
    <el-icon class="el-icon--upload">
      <upload-filled/>
    </el-icon>
    <div class="el-upload__text">
      Drop file here or <em>click to upload</em>
    </div>
  </el-upload>
</template>

<script setup lang="ts">
import {ref} from 'vue';
import {UploadFilled} from "@element-plus/icons-vue";

const aIGenerateDialogRef = ref(null);
const emit = defineEmits(['save']);

function onUpload() {
  aIGenerateDialogRef.value.dialogVisible = true;
}

async function onChange(fileElement: any) {
  emit('save');
}
</script>

<style scoped lang="scss">

</style>

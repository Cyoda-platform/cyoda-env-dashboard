<template>
  <div class="ai-generate">
    <div class="text-right">
      <el-button class="upload-btn" @click="onUpload" type="primary">
        <span class="wrapper-inner">
        <span class="text">
          AI Generate
        </span>
        <AiSvg width="20" height="auto"/>
          </span>
      </el-button>
    </div>
    <AIGenerateDialog :type="type" ref="aIGenerateDialogRef"/>
  </div>
</template>

<script setup lang="ts">
import {ref} from 'vue';
import AIGenerateDialog from "./AIGenerateDialog.vue";
import AiSvg from '../../../../cyoda-ui-lib/src/assets/images/ai.svg?component';

const aIGenerateDialogRef = ref(null);
defineProps({
  type: {
    default: '',
  }
});

function onUpload() {
  aIGenerateDialogRef.value.dialogVisible = true;
}
</script>

<style lang="scss">
.ai-generate {
  .text-right {
    text-align: right;
  }

  .wrapper-inner {
    display: flex;
    align-items: center;
    gap: 5px;
  }
}
</style>

<template>
  <el-dialog appendToBody :close-on-click-modal="false" title="Inconsistent Configuration" v-model="dialogVisible" width="90%">
    <el-alert title="Warning" type="warning" description="Inconsistent configuration translation, if you continue you need to check the configuration for completeness." :closable="false" show-icon> </el-alert>
    <el-divider />
    <div class="functional-mapping-diff">
      <div class="code-diff-title">
        <div class="left">
          <h3>Generated</h3>
        </div>
        <div class="right">
          <h3>From Server</h3>
        </div>
      </div>
      <CyodaEditor :old-string="newString" :new-string="oldString" :diff="true" />
    </div>
    <template #footer>
    <span class="dialog-footer">
      <el-button type="primary" @click="dialogVisible = false">Confirm</el-button>
    </span>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref } from "vue";

import CyodaEditor from "@cyoda/ui-lib/src/components-library/elements/CyodaEditor/CyodaEditor.vue";

import beautify from "js-beautify";

const newString = ref<string>("");
const oldString = ref<string>("");

const dialogVisible = ref<boolean>(false);

function openForm(oldObj, newObj) {
  oldString.value = beautifyJs(oldObj);
  newString.value = beautifyJs(newObj);
  dialogVisible.value = true;
}

function beautifyJs(obj) {
  return beautify.js(JSON.stringify(obj).trim(), {
    indent_size: 2,
    space_in_empty_paren: true,
    wrap_line_length: 50
  });
}

defineExpose({ openForm });
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
.code-diff-title {
  display: flex;
  margin-bottom: 10px;

  div {
    width: 50%;

    h3 {
      font-weight: bold;
    }
  }
}
</style>

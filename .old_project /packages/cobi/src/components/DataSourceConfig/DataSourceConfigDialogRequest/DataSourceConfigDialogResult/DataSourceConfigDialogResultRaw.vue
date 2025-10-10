<template>
  <el-dialog append-to-body :close-on-click-modal="false" title="Result" v-model="dialogVisible" width="80%">
    <pre :class="codeObj.class"><code :class="codeObj.class" v-html="codeObj.code"></code></pre>
    <template #footer>
    <span class="dialog-footer">
      <el-button @click="dialogVisible = false">Close</el-button>
    </span>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";

import "prismjs/themes/prism.css";

import beautify from "js-beautify";
import Prism from "prismjs";

const props = defineProps({
  result: {
    default: () => {
      return {};
    }
  }
});
const codeObj = computed(() => {
  const data = beautify.js(JSON.stringify(props.result || {}).trim(), {
    indent_size: 2,
    space_in_empty_paren: true,
    wrap_line_length: 50
  });
  return {
    class: "language-javascript",
    code: Prism.highlight(data, Prism.languages.javascript, "javascript")
  };
});

const dialogVisible = ref<boolean>(false);

defineExpose({ dialogVisible });
</script>

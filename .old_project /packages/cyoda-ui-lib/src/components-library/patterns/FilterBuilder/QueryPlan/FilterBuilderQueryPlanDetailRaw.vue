<template>
  <el-dialog :close-on-click-modal="false" append-to-body :title="computedTitle" v-model="dialogVisible" width="80%" class="filter-builder-query-plan-detail-raw">
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

import Prism from "prismjs";
import "prismjs/themes/prism.css";

import beautify from "js-beautify";

const props = defineProps({
  queryPlan: {
    default() {
      return {};
    }
  },
  title: {
    default: ""
  }
});
const computedTitle = computed(() => {
  return `Query Plan Raw For ${props.title}`;
});
const codeObj = computed(() => {
  const data = beautify.js(JSON.stringify(props.queryPlan).trim(), {
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

defineExpose({dialogVisible});
</script>

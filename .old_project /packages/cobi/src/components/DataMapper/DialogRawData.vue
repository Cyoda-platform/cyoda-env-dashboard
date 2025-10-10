<template>
  <el-dialog :close-on-click-modal="false" title="Raw data" v-model="dialogVisible" width="90%">
    <pre :class="codeObj.class"><code :class="codeObj.class" v-html="codeObj.code"></code></pre>
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="dialogVisible = false">Close</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";

import Prism from "prismjs";
import "prismjs/themes/prism.css";

import beautify from "js-beautify";

const props = defineProps({
  fileDatas: {
    default: () => {
      return {};
    }
  },
  fileType: undefined
});
const codeObj = computed(() => {
  if (props.fileType === "json") {
    const data = beautify.js(props.fileDatas[props.fileType].trim(), {
      indent_size: 2,
      space_in_empty_paren: true,
      wrap_line_length: 50
    });
    return {
      class: "language-javascript",
      code: Prism.highlight(data, Prism.languages.javascript, "javascript")
    };
  } else {
    const data = props.fileDatas[props.fileType].trim();
    return {
      class: "language-xml",
      code: Prism.highlight(data, Prism.languages.xml, "xml")
    };
  }
});

const dialogVisible = ref<boolean>(false);

defineExpose({ dialogVisible });
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
h3 {
  margin: 40px 0 0;
}

ul {
  list-style-type: none;
  padding: 0;
}

li {
  display: inline-block;
  margin: 0 10px;
}

a {
  color: #42b983;
}
</style>

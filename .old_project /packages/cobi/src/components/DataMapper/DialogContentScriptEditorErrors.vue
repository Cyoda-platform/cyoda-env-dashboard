<template>
  <div class="dialog-content-script-editor-errors">
    <el-alert class="alert-scripts" :closable="false" title="Errors" type="error" show-icon>
      <div>
        Scripts contain an errors.
        <el-link @click="dialogVisible = true" class="check-link" type="danger">See all</el-link>
      </div>
    </el-alert>

    <el-dialog append-to-body :close-on-click-modal="false" title="Errors" v-model="dialogVisible" width="800px"
               class="history-table-hierarhy-edit-pop-up">
      <el-tabs>
        <el-tab-pane v-if="Object.keys(allScriptsData.linksErrors).length > 0" label="Links Errors">
          <pre class="language-javascript"><code class="language-javascript"
                                                 v-html="getCode('linksErrors')"></code></pre>
        </el-tab-pane>
        <el-tab-pane v-if="Object.keys(allScriptsData.structureErrors).length > 0" label="Structure Errors">
          <pre class="language-javascript"><code class="language-javascript" v-html="getCode('structureErrors')"></code></pre>
        </el-tab-pane>
      </el-tabs>
      <template #footer>
        <span class="dialog-footer">
          <el-button type="primary" @click="dialogVisible = false">Close</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import {ref} from "vue";

import "prismjs/themes/prism.css";
// @ts-ignore
import beautify from "js-beautify";
import Prism from "prismjs";

const props = defineProps({
  allScriptsData: {
    default: () => {
      return {};
    }
  }
});

const dialogVisible = ref<boolean>(false);

function getCode(fieldName) {
  const data = beautify.js(JSON.stringify(props.allScriptsData[fieldName] || {}).trim(), {
    indent_size: 2,
    space_in_empty_paren: true,
    wrap_line_length: 50
  });
  return Prism.highlight(data, Prism.languages.javascript, "javascript");
}
</script>

<style lang="scss">
.dialog-content-script-editor {
  .check-link {
    font-size: 12px;
  }

  .alert-scripts {
    margin-bottom: 15px;
  }
}
</style>

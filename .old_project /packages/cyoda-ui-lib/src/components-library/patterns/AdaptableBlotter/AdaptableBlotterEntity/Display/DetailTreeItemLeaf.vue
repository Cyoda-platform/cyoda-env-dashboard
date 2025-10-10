<template>
  <div class="body">
    <template v-if="codeObj">
      <pre :class="codeObj.class">
          <code :class="codeObj.class" v-html="codeObj.code"></code>
       </pre>
    </template>
    <template v-else>
      {{ valueData }}
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";

import Prism from "prismjs";
import "prismjs/themes/prism.css";
import HelperFormat from "../../../../../helpers/HelperFormat";
import { ColumnInfo } from "../../../../../types/types";

const props = defineProps({
  column: {
    default: () => {
      return {};
    }
  },
  isShowEmpty: {
    default: true
  }
});
const codeObj = computed(() => {
  if (props.column.value && typeof props.column.value === "string" && HelperFormat.isXml(props.column.value)) {
    return {
      class: "language-xml",
      code: Prism.highlight(props.column.value, Prism.languages.xml, "xml")
    };
  } else if (props.column.value && typeof props.column.value === "string" && HelperFormat.isJson(props.column.value)) {
    return {
      class: "language-javascript",
      code: Prism.highlight(props.column.value, Prism.languages.javascript, "javascript")
    };
  }
  return false;
});
const valueData = computed(() => {
  return HelperFormat.getValue(props.column.value);
});
</script>

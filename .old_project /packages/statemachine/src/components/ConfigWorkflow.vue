<template>
  <div v-loading="isLoading">
    <pre :class="codeObj.class"><code :class="codeObj.class" v-html="codeObj.code"></code></pre>
  </div>
</template>

<script setup lang="ts">
import {computed, ref} from "vue";
import Prism from "prismjs";
import "prismjs/themes/prism.css";
import beautify from "js-beautify";
import {useStatemachineStore} from "../stores/statemachine";

const props = defineProps({
  workflowId: {
    default: null,
  },
  persistedType: {
    default: "",
  }
})

const workflow = ref({});
const isLoading = ref(false);
const statemachineStore = useStatemachineStore();

(async function () {
  try {
    isLoading.value = true;

    const {data} = await statemachineStore.getWorkflow(props.persistedType, props.workflowId);
    workflow.value = data;
  } finally {
    isLoading.value = false;
  }
})();

const codeObj = computed(() => {
  const data = beautify.js(JSON.stringify(workflow.value).trim(), {
    indent_size: 2,
    space_in_empty_paren: true,
    wrap_line_length: 50
  });
  return {
    class: "language-javascript",
    code: Prism.highlight(data, Prism.languages.javascript, "javascript")
  };
});
</script>

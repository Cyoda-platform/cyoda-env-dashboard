<template>
  <div class="ai-chat-bot-messages-js-editor">
    <div class="message">
      <pre class="language-javascript"><code class="language-javascript" v-html="code"></code></pre>
<!--      <div v-if="ready && result" class="actions">-->
<!--        <el-button @click="onCopy" size="default" type="primary">Copy</el-button>-->
<!--      </div>-->
    </div>
  </div>
</template>

<script setup lang="ts">
import {computed, watch, inject} from 'vue';
import beautify from "js-beautify";
import Prism from "prismjs";
import {outputResponse} from "../../../../helpers/HelperChatbot";
import {ElNotification} from "element-plus";

const isLoading = inject('isLoading');

const props = defineProps({
  message: {
    default: {}
  }
})

const jsData = computed(() => {
  return beautify.js(props.message.text, {
    indent_size: 2,
    space_in_empty_parent: true,
  });
})

const {result, ready} = outputResponse(jsData.value, isLoading);
const code = computed(() => {
  return Prism.highlight(result.value, Prism.languages.javascript, "javascript")
})

watch(ready, (value) => {
  if (value) props.message.ready = true;
})

function onCopy() {
  navigator.clipboard.writeText(jsData.value).then(
    () => {
      ElNotification({
        title: "Success",
        message: `Value was copied`,
        type: "success"
      });
    },
    () => {
      ElNotification({
        title: "Error",
        message: `Value is NOT was copied`,
        type: "error"
      });
    }
  );
}
</script>

<style scoped lang="scss">
.ai-chat-bot-messages-js-editor {

  .actions {
    text-align: right;
  }
}
</style>

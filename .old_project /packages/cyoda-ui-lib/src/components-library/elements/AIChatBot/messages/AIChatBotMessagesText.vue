<template>
  <div class="ai-chat-bot-messages-text" ref="rootRef">
    <div class="message" v-html="resultComputed"></div>
  </div>
</template>

<script setup lang="ts">
import {computed, inject, nextTick, watch, ref, h} from 'vue';
import {outputResponse} from "../../../../helpers/HelperChatbot";
import * as marked from 'marked';
import "prismjs/themes/prism.css";
import Prism from "prismjs";
import 'prismjs/components/prism-sql';


const isLoading = inject('isLoading');
const rootRef = ref(null);

const props = defineProps({
  message: {
    default: {}
  }
})

const {result, ready} = outputResponse(props.message, isLoading);

const isMarkdownExist = ref(false);
const markdownContent = ref(null);
const resultComputed = computed(() => {
  return isMarkdownExist.value ? markdownContent.value : result.value;
});

watch(ready, (value) => {
  if (value) {
    props.message.ready = true;
    // if (result.value.includes('```')) {
    isMarkdownExist.value = true;
    markdownContent.value = marked.parse(result.value);
    nextTick(() => {
      addButtons()
    })
    // }
  }
}, {immediate: true})

function addButtons() {
  const codeBlocks = rootRef.value.querySelectorAll('pre code');
  codeBlocks.forEach(block => {
    Prism.highlightElement(block);
    // Создаем кнопку копирования
    const button = document.createElement('button');
    button.textContent = 'copy';
    button.className = 'copy-button';


    button.addEventListener('click', () => {
      navigator.clipboard.writeText(block.textContent).then(() => {
        button.textContent = 'copied!';
        setTimeout(() => {
          button.textContent = 'copy';
        }, 2000);
      });
    });

    // Вставляем кнопку в блок кода
    block.parentNode.style.position = 'relative';
    block.parentNode.prepend(button);
  });
}
</script>

<style lang="scss">
.ai-chat-bot-messages-text {
  .message {
    p {
      margin: 0;

      //  white-space: pre-line;
    }
  }

  .copy-button {
    position: absolute;
    top: 5px;
    left: 5px;
    background: none;
    border: none;
    font-size: .8em;
    padding: 0 .5em;
    background: hsla(0, 0%, 55%, 0.2);
    border-radius: .5em;
  }

  pre[class*="language-"] {
    padding-top: 1.5rem;
  }

  a {
    color: #409eff;
    text-decoration: none;

    &:hover {
      text-decoration: underline;
    }
  }

  table {
    margin-top: 10px;
    border-collapse: collapse;

    th {
      background-color: #4b5d7a;
      color: #fff;
    }

    td, th {
      padding: 10px;
      border: 1px solid #ebeef5;
    }

    tr:nth-child(even) {
      td {
        background-color: #fafafa;
      }
    }

    tr:hover {
      td {
        background-color: #f5f7fa;
      }
    }
  }
}
</style>

<template>
  <el-drawer
    ref="rootRef"
    append-to-body
    :z-index="3000"
    size="40%"
    class="ai-chat-bot-drawer"
    v-model="drawer"
    direction="rtl"
  >

    <template #header="{ close, titleId, titleClass }">
      <h4 :id="titleId" :class="titleClass">AI assistant</h4>
      <el-button :loading="isLoadingClear" type="danger" @click="onClearChatMapping">
        Clear History
        <font-awesome-icon icon="trash"/>
      </el-button>
    </template>

    <template v-if="isEmpty">
      <AIChatBotEmpty/>
    </template>
    <template v-else>
      <div class="wrap-message" v-for="(message, index) in messages">
        <AIChatBotBody @repeat="onRepeat" @addToPrompt="addToPrompt" :message="message"/>
        <el-divider class="divider" v-if="index!==messages.length-1"/>
      </div>
    </template>

    <template #footer>
      <AIChatBotForm
        ref="aIChatBotFormRef"
        :isLoading="isLoading"
        :isLoadingClear="isLoadingClear"
        :disabledReturnObject="disabledReturnObject"
        :defaultReturnObject="defaultReturnObject"
        :category="category"
        :isSubmitBtnDisabled="isSubmitBtnDisabled"
        :hiddenReturnObject="hiddenReturnObject"
        :onlyReturnObject="onlyReturnObject"
        @submit="onSubmitMessage"
        @stop="onStopMessage"
      >
        <template #actions>
          <slot name="actions"/>
        </template>
      </AIChatBotForm>
    </template>
  </el-drawer>
</template>

<script setup lang="ts">
import {computed, ref, provide, watch, onMounted, nextTick, reactive, onBeforeUnmount} from 'vue';
import AIChatBotForm from "./AIChatBotForm.vue";
import AIChatBotBody from "./AIChatBotBody.vue";
import AIChatBotEmpty from "./AIChatBotEmpty.vue";
import {useChatbotStore} from "../../../stores/chatbot";
import {useAuthStore} from "../../../stores/auth";
import {ElMessageBox, ElNotification} from "element-plus";
import eventBus from "../../../plugins/eventBus";

const props = defineProps({
  defaultReturnObject: {
    default: null
  },
  id: {
    default: null
  },
  hiddenReturnObject: {
    default: () => ([])
  },
  onlyReturnObject: {
    default: () => ([])
  },
  chatBotDefaultMessages: {
    default: () => ({})
  },
  initialFn: {
    default: () => {
    }
  },
  submitMessageFn: {
    default: () => {
    }
  },
  axiosChatBotController: {
    default: null
  },
  category: {
    default: null
  },
  disabledReturnObject: {
    default: () => []
  },
  isSubmitBtnDisabled: {
    default: false,
  }
})

const drawer = ref(false);
const rootRef = ref(null);
const aIChatBotFormRef = ref(null);
const chatbotStore = useChatbotStore();
const authStore = useAuthStore();

const isLoading = ref(false);
const isLoadingClear = ref(false);
provide('isLoading', isLoading);

const messages: any = ref([]);

const isEmpty = computed(() => {
  return messages.value.length === 0;
})

defineExpose({drawer})

onMounted(() => {
  eventBus.$on('chatBot:close', closeDrawer);
  loadHistoryMessages();
})

onBeforeUnmount(() => {
  eventBus.$off('chatBot:close', closeDrawer);
})

async function loadHistoryMessages() {
  const history = await loadHistory();
  if (Array.isArray(history.message) && history.message?.length === 0) return;
  history.message?.messages.filter((message) => {
    if (props.onlyReturnObject.length > 0) {
      return props.onlyReturnObject.includes(message.return_object)
    }
    return true;
  }).filter((message) => {
    if (props.hiddenReturnObject.length > 0) {
      return !props.hiddenReturnObject.includes(message.return_object)
    }
    return true;
  }).forEach((message) => {
    messages.value.push({
      question: {
        text: message.question,
        return_object: message.return_object
      },
      repeats: [[{
        "ready": true,
        "immediate": true,
        "type": "text",
        "text": props.chatBotDefaultMessages[message.return_object] || message.answer
      }]]
    });
  })
}

function closeDrawer() {
  drawer.value = false;
}

async function onClearChatMapping() {
  try {
    isLoadingClear.value = true;
    await chatBotClear();
    await props.initialFn();
    messages.value = [];
  } finally {
    isLoadingClear.value = false;
  }
}

function chatBotClear() {
  return chatbotStore.getChatClear(props.category, props.id);
}

async function loadHistory() {
  const {data: history} = await chatbotStore.getChatHistory(props.category, props.id);
  return history;
}

async function onSubmitMessage({message, key, file}, element) {
  if (!element) {
    element = reactive({
      question: {
        text: message,
        return_object: key,
        file,
      },
      repeats: [],
    })
    messages.value.push(element);
  }
  try {
    isLoading.value = true;
    await props.submitMessageFn({message, key, file}, element);
  } finally {
    isLoading.value = false;
  }
}

function onRepeat(message) {
  onSubmitMessage({
    message: message.question.text,
    key: message.question.return_object,
    file: message.question.file
  }, message)
}

async function addToPrompt(value) {
  ElMessageBox.confirm("Do you really want to add this value to Prompt?", "Confirm!", {
    callback: async (action) => {
      if (action === "confirm") {
        await chatbotStore.postPromtsByUser(props.category, authStore.userId, {prompt: value.trim()});
        ElNotification({
          type: 'success',
          message: 'New prompt has been added',
          zIndex: 10000
        })
      }
    }
  });
}

let drawerBody = null;
watch(drawer, (value) => {
  if (value && !drawerBody) {
    nextTick(() => {
      drawerBody = document.querySelector('.ai-chat-bot-drawer .el-drawer__body');
      new MutationObserver(() => {
        drawerBody.scrollTo(0, drawerBody.scrollHeight);
      }).observe(drawerBody, {
        childList: true,
        // subtree: true //Disable scroll to down
      });
    })
  }
})

function onStopMessage() {
  isLoading.value = false;
  if (props.axiosChatBotController) {
    props.axiosChatBotController.abort();
    props.axiosChatBotController = null;
  }
}
</script>

<style lang="scss">
.ai-chat-bot-drawer {
  text-align: left;

  .wrap-message {
    line-height: 20px;
  }

  .divider {
    margin-top: 0 !important;
  }

  .icon {
    fill: #ffffff !important;
  }
}
</style>

<template>
  <div class="ai-chat-bot">
    <el-button v-if="isChatBotReady" @click="openDrawer" :disabled="disabled" class="upload-btn" type="primary">
    <span class="wrapper-inner">
        <span class="text">
         AI assistant
        </span>
        <ChatbotSvg class="icon" width="25" height="auto"/>
    </span>
    </el-button>
    <el-button
      v-else
      @click="onClickInitAi"
      :disabled="disabled"
      :loading="isLoadingAI"
      class="next-step"
      type="primary">
                <span class="wrapper-inner">
                  <span class="text">
                   Init AI
                  </span>
                <AiSvg width="20" height="auto"/>
                </span>
    </el-button>
    <AIChatBotDrawer
      ref="aIChatBotDrawerRef"
      v-if="isChatBotReady"
      :id="id"
      :hiddenReturnObject="hiddenReturnObject"
      :onlyReturnObject="onlyReturnObject"
      :defaultReturnObject="defaultReturnObject"
      :disabledReturnObject="disabledReturnObject"
      :chatBotDefaultMessages="chatBotDefaultMessages"
      :initialFn="initialFn"
      :submitMessageFn="submitMessageFn"
      :axiosChatBotController="axiosChatBotController"
      :category="category"
      :isSubmitBtnDisabled="isSubmitBtnDisabled"
    >

      <template #actions>
        <slot name="actions"/>
      </template>
    </AIChatBotDrawer>
  </div>
</template>

<script setup lang="ts">
import {onMounted, ref, watch} from 'vue';
import ChatbotSvg from '../../../assets/images/chatbot.svg?component';
import AIChatBotDrawer from "./AIChatBotDrawer.vue";
import AiSvg from '../../../assets/images/ai.svg?component';
import {useChatbotStore} from "../../../stores/chatbot";

const isChatBotReady = ref(false);
const isLoadingAI = ref(false);
const emit = defineEmits(["update:ready"]);

const props = defineProps({
  disabled: {
    default: false
  },
  defaultReturnObject: {
    default: null
  },
  submitMessageFn: {
    default: () => {
    }
  },
  initialFn: {
    default: () => {
    }
  },
  isInitializedFn: {
    default: () => {
    }
  },
  axiosChatBotController: {
    default: null
  },
  category: {
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
  disabledReturnObject: {
    default: () => []
  },
  isSubmitBtnDisabled: {
    default: false,
  },
})

const aIChatBotDrawerRef = ref(null);
const chatbotStore = useChatbotStore();

onMounted(async () => {
  const {data} = await isInitialized();
  isChatBotReady.value = data;
})

function openDrawer() {
  aIChatBotDrawerRef.value.drawer = true;
}

async function onClickInitAi() {
  isLoadingAI.value = true;
  try {
    await props.initialFn();
    isChatBotReady.value = true;
  } finally {
    isLoadingAI.value = false
  }
}

async function isInitialized() {
  return chatbotStore.isInitialized(props.category, props.id);
}

function updateId(init_chat_id, update_chat_id) {
  if (init_chat_id === update_chat_id) return Promise.resolve();;
  return chatbotStore.putUpdateId(props.category, {
    init_chat_id,
    update_chat_id
  })
}

function saveChat(chat_id) {
  return chatbotStore.getSaveChat(props.category, chat_id);
}

watch(isChatBotReady, (value) => {
  emit("update:ready", value);
})

defineExpose({updateId, saveChat})
</script>

<style lang="scss">
.ai-chat-bot {
  display: inline;
  margin-left: 12px;

  .wrapper-inner {
    display: flex;
    align-items: center;
    gap: 5px;
  }

  .icon {
    fill: #ffffff !important;
  }
}
</style>

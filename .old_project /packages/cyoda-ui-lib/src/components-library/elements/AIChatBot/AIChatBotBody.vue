<template>
  <div class="ai-chat-bot-body">
    <div class="ai-chat-bot-body-question">
      <div class="title">
        <el-avatar :size="30">
          <font-awesome-icon icon="user"/>
        </el-avatar>
        <span>
          You
        </span>
      </div>
      <div class="ai-chat-bot-body-question-item">
        <AIChatBotMessagesQuestion
          v-if="message.question"
          :message="message.question"
        />
        <div class="actions">
          <div class="buttons">
            <el-tooltip :show-after="2000" popper-class="tooltip-item" class="item" effect="dark" content="Repeat"
                        placement="bottom">
              <font-awesome-icon @click="onRepeat" icon="repeat"/>
            </el-tooltip>
            <el-tooltip :show-after="2000" popper-class="tooltip-item" class="item" effect="dark"
                        content="Add to Prompt"
                        placement="bottom">
              <font-awesome-icon @click="onAddNewPrompt" icon="plus"/>
            </el-tooltip>
          </div>
        </div>
      </div>
    </div>

    <div class="ai-chat-bot-body-answer">
      <div class="title">
        <el-avatar :size="30">
          <ChatbotSvg class="icon" width="25" height="auto"/>
        </el-avatar>
        <span>
          ChatBot
        </span>
      </div>
      <div class="ai-chat-bot-body-answer-item">
        <template v-if="!isExistAnswers">
          <AIChatBotMessagesEmpty/>
        </template>
        <template v-else v-for="item in repeat">
          <AIChatBotMessagesText
            v-if="item.type==='text'"
            :message="item"
          />

          <AIChatBotMessagesJavascript
            v-if="item.type==='javascript'"
            :message="item"
          />
        </template>

        <div class="actions">
          <span v-if="message.repeats.length>1">
           <font-awesome-icon @click="onPrevRepeat" :icon="['fas', 'chevron-left']"/>
            {{ page + 1 }} / {{ message.repeats.length }}
            <font-awesome-icon @click="onNextRepeat" :icon="['fas', 'chevron-right']"/>
          </span>
          <div class="buttons">
          <span v-if="textForCopy">
               <el-tooltip :show-after="2000" popper-class="tooltip-item" class="item" effect="dark" content="Copy"
                           placement="bottom">
                  <font-awesome-icon @click="onCopy" icon="copy"/>
               </el-tooltip>
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {computed, inject, provide, ref, watch} from "vue";
import AIChatBotMessagesQuestion from "./messages/AIChatBotMessagesQuestion.vue";
import AIChatBotMessagesText from "./messages/AIChatBotMessagesText.vue";
import AIChatBotMessagesJavascript from "./messages/AIChatBotMessagesJavascript.vue";
import {ElNotification} from "element-plus";
import AIChatBotMessagesEmpty from "./messages/AIChatBotMessagesEmpty.vue";
import ChatbotSvg from '../../../assets/images/chatbot.svg?component';

const props = defineProps({
  message: Object
})

const emit = defineEmits(['ready', 'repeat', 'addToPrompt']);
const page = ref(0);

const repeat = computed(() => {
  return props.message.repeats[page.value];
})

const textForCopy = computed(() => {
  if (!repeat.value) return "";
  return repeat.value.map((el) => el.text).join();
})

function onCopy() {
  navigator.clipboard.writeText(textForCopy.value).then(
    () => {
      ElNotification({
        title: "Success",
        message: `Value was copied`,
        type: "success",
        zIndex: 10000
      });
    },
    () => {
      ElNotification({
        title: "Error",
        message: `Value is NOT was copied`,
        type: "error",
        zIndex: 10000
      });
    }
  );
}

function onRepeat() {
  page.value = props.message.repeats.length;
  emit('repeat', props.message);
}

function onNextRepeat() {
  if (page.value + 1 >= props.message.repeats.length) return;
  page.value += 1;
}

function onPrevRepeat() {
  if (page.value <= 0) return;
  page.value -= 1;
}

function onAddNewPrompt() {
  emit('addToPrompt', props.message.question.text)
}

const isExistAnswers = computed(() => {
  return repeat.value?.length > 0;
})


// watch(notVisibleChildren, () => {
//   notVisibleChildren.value.forEach((childrenMessage) => {
//     if (childrenMessage.actions.includes('addColumnMapping')) {
//       addColumnMapping(childrenMessage);
//     }
//     if (childrenMessage.actions.includes('deleteColumnMapping')) {
//       deleteColumnMapping(childrenMessage);
//     }
//     // emit('ready')
//   })
// }, {immediate: true})

</script>

<style scoped lang="scss">
.ai-chat-bot-body {
  height: 100%;
}

.title {
  font-weight: bold;
  display: flex;
  align-items: center;
  gap: 10px;
}

.actions {
  display: flex;
  margin-top: 5px;
  gap: 10px;
  padding-bottom: 5px;

  svg {
    cursor: pointer;
    color: #868686;
  }

  .buttons {
    opacity: 0;
    transition: all 0.5s;
    display: flex;
    gap: 10px;
  }
}

.ai-chat-bot-body-answer:hover, .ai-chat-bot-body-question:hover {
  .actions .buttons {
    display: flex;
    opacity: 1;
  }
}

.ai-chat-bot-body-question-item, .ai-chat-bot-body-answer-item {
  margin-left: 40px;
}
</style>

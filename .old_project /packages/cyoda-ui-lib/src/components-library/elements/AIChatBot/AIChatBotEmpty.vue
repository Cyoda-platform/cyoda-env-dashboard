<template>
  <div class="ai-chat-bot-empty">
    <ChatbotSvg/>
  <span class="message">
    How can I help you today?
  </span>
  </div>
</template>

<script setup lang="ts">
import ChatbotSvg from '../../../assets/images/chatbot.svg?component';
</script>

<style scoped lang="scss">
.ai-chat-bot-empty {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 100%;
  .message{
    font-size: 24px;
  }
}
</style>

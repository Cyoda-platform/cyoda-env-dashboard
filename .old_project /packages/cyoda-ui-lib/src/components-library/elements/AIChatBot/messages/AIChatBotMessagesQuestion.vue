<template>
  <div class="ai-chat-bot-messages-question">
    <div class="message">{{ message.text || `You didn't ask a question` }}</div>
    <div class="return-object"><small>Return object: {{ message.return_object }}</small></div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps({
  message: {
    default: {}
  }
})
</script>

<style lang="scss">
.ai-chat-bot-messages-question {
  .return-object {

    small {
      color: #a2a2a2;
      font-weight: bold;
    }
  }
}
</style>

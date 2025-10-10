<template>
  <div class="dots" v-html="dots">
  </div>
</template>

<script setup lang="ts">
import {onBeforeUnmount, ref} from "vue"

const dots = ref("");
let num = 0;
let timerId = setInterval(() => {
  dots.value = ". ".repeat(num++) || '&nbsp;';
  if (num > 3) num = 0;
}, 500)

onBeforeUnmount(() => {
  if (timerId) clearInterval(timerId);
})
</script>

<style scoped lang="scss">
.dots {
  height: 20px;
}
</style>

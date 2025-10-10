<template>
  <div @click="onClick" class="notification">
    <font-awesome-icon icon="bug" />
  </div>
</template>

<script setup lang="ts">
const emit=defineEmits(['open']);
function onClick() {
  emit("open");
}
</script>

<style lang="scss" scoped>
.notification {
  position: fixed;
  background: #fff;
  padding: 10px;
  box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
  border-radius: 999px;
  z-index: 999;
  bottom: 20px;
  right: 20px;
  cursor: pointer;
  svg {
    font-size: 20px;
    color: #f56c6c;
    &:hover {
      color: #f69a9a;
    }
  }
}
</style>

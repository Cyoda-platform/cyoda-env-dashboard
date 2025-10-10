<template>
  <router-link
    class="el-button"
    type="button"
    :class="{
      'el-button--small': size === 'small',
      'el-button--warning': type === 'warning'
    }"
    :to="to"
  >
    <slot />
  </router-link>
</template>

<script setup lang="ts">
const props = defineProps({ to: { default: "" }, type: { default: "" }, size: { default: "" } });
</script>

<style scoped lang="scss">
.el-button {
  color: #fff;
  display: inline-block;
}
</style>

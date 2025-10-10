<template>
  <div class="wrap">
    <div class="active-automated-state" :class="{
    'is-active': state
  }">
      A
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps({
  state: {
    default: false,
  }
})
</script>

<style scoped lang="scss">
.active-automated-state {
  text-align: center;
  font-size: 30px;
  font-weight: bold;
  color: rgb(204, 204, 204);

  &.is-active {
    color: #309566;
  }
}
</style>

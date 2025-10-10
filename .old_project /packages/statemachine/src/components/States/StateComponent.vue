<template>
  <div class="wrap">
    <div class="active-state" :class="{
    'is-active': state
  }">
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
.active-state {
  width: 22px;
  height: 22px;
  background: rgb(204, 204, 204);
  border-radius: 22px;

  &.is-active {
    background: #309566;
  }
}

.wrap {
  width: 100%;
  display: flex;
  justify-content: center;
}
</style>

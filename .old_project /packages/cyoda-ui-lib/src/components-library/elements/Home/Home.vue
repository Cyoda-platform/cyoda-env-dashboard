<template>
  <div class="wrap-home">
    <HomeMenuDisplay v-for="menu in menus" :key="menu.link" :menu="menu" />
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";

import Menu from "./Menu";
import HomeMenuDisplay from "./HomeMenuDisplay.vue";

let menus = ref(Menu);
</script>

<style lang="scss">
.wrap-home {
  width: 800px;
  margin: 40px auto 0;
}
</style>

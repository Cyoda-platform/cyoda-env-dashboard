<template>
  <div class="wrap-home-drawer">
    <font-awesome-icon v-if="route.path !== '/'" @click="onClickBars" class="wrap-bars" icon="bars" />
    <el-drawer class="home-drawer" append-to-body title="Menu" v-model="drawer" direction="ltr">
      <div class="inner">
        <HomeMenuDisplay v-for="menu in menus" :key="menu.link" :menu="menu" :is-display-description="false" />
      </div>
    </el-drawer>
  </div>
</template>

<script setup lang="ts">
import { useRoute } from "vue-router";
import { ref } from "vue";

import Menu from "./Menu";
import HomeMenuDisplay from "./HomeMenuDisplay.vue";

const drawer = ref<boolean>(false);
let menus = ref(Menu);
const route=useRoute();

function onClickBars() {
  drawer.value = true;
}

defineExpose({ drawer });
</script>

<style lang="scss">
.wrap-home-drawer {
  display: inline-block;

  .wrap-bars {
    margin-right: 15px;
    margin-bottom: 6px;
    font-size: 20px;
    cursor: pointer;

    &:hover {
      opacity: 0.7;
    }
  }
}

.home-drawer {
  * {
    outline: none;
  }

  .el-drawer__body {
    height: 100%;
    box-sizing: border-box;
    overflow-y: auto;
  }

  .inner {
    padding: 15px;
  }
}
</style>

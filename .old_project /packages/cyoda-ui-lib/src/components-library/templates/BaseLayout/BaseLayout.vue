<template>
  <div class="app-wrapper">
    <div class="app-content">
      <div>
        <header class="sticky">
          <slot name="header"></slot>
        </header>
        <main class="main">
          <slot name="main"></slot>
        </main>
        <footer>
          <slot name="footer"></slot>
        </footer>
      </div>
    </div>
    <div class="app-overlaping-components">
      <portal-target name="modal" />
      <slot name="portals"></slot>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from "vue";

import _ from "lodash";

let resizeWindowThrottle = ref(_.throttle(resizeWindow));

let header=null;
let main=null;
onMounted(() => {
  header = document.querySelector("header.sticky");
  main = document.querySelector("main.main");
  window.addEventListener("resize", resizeWindowThrottle.value);
  resizeWindowThrottle.value();
});

onBeforeUnmount(() => {
  window.removeEventListener("resize", resizeWindowThrottle.value);
});

function resizeWindow() {
  if(!header || !main) return;
  const headerHeight = header.offsetHeight;
  main.setAttribute("style", `padding-top: ${headerHeight + 10}px`);
}
</script>

<style lang="scss">
body {
  position: relative;
}

.app-wrapper {
  position: static;
}
</style>

<style lang="scss" scoped>
.app-content {

  > * {
    min-height: 100%;
    display: flex;
    flex-direction: column;

    > * {
      flex: 0 1 auto;
    }

    .main {
      flex: 1 0 auto;
    }
  }
}

header {
  background: rgb(255, 255, 255);
  border-bottom: 2px solid #e8e8e8;

  &:not(:empty) {
    padding: 16px;
  }

  &.sticky {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    z-index: 10;
  }
}

.sticky + .main {
  padding-top: 75px;
}

main {
  padding: 16px;
}

footer {
  &:not(:empty) {
    padding: 16px;
  }
}
</style>

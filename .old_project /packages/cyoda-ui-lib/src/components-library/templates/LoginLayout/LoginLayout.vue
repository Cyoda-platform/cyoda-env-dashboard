<template>
  <div class="app-wrapper">
    <div class="app-content">
      <div>
        <header>
          <div class="header-contents" slot="header">
            <router-link to="/" class="logo-wrapper" aria-label="Cyoda">
              <AppLogo></AppLogo>
            </router-link>
            <small class="name-app">
              {{ nameApp }}
            </small>
          </div>
        </header>
        <main class="main main-contents">
          <router-view />
        </main>
        <footer>
          <slot name="footer"></slot>
        </footer>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import AppLogo from "../../../components-library/elements/AppLogo/AppLogo.vue";

const props = defineProps({ nameApp: { default: "" } });
</script>

<style lang="scss">
/*html,*/
/*body,*/
/*.app-wrapper {*/
/*  width: 100%;*/
/*  height: 100%;*/
/*  overflow: hidden;*/
/*}*/

body {
  position: relative;
}

.app-wrapper {
  position: static;
}
</style>

<style lang="scss" scoped>
.app-content {
  /*overflow-y: scroll;*/
  /*overflow-x: auto;*/
  /*width: 100%;*/
  /*height: 100%;*/

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
  border-bottom:  2px solid #e8e8e8;

  &:not(:empty) {
    padding: 16px;
  }
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

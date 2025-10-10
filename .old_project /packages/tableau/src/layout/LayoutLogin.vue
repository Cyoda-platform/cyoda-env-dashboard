<template>
  <div id="login">
    <div class="header">
      <img alt="logo" class="logo" src="../assets/images/cyoda-logo.svg" />
    </div>
    <slot />
    <div class="footer">
      <div class="version">Version {{ uiVersion }} {{ uiBuildTime }}</div>
      <div class="branch">Branch name "{{ uiBranchName }}"</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";

import moment from "moment";

let uiVersion = ref(import.meta.env.VITE_APP_UI_VERSION);
let uiBuildTime = ref(moment(import.meta.env.VITE_APP_UI_BUILD_TIME).format("DD.MM.YYYY HH:mm:ss"));
let uiBranchName = ref(import.meta.env.VITE_APP_UI_BRANCH_NAME);
</script>

<style scoped lang="scss">
#login {
  font-family: Roboto, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin: 0;
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  padding: 0;
  background: #102a43;
  background-size: contain;
}
.footer,
.header {
  padding: 20px 20px;
  color: #f0f4f8;
  display: flex;
  flex-direction: column;
  align-items: center;
  h1,
  h2,
  h3 {
    color: #f0f4f8;
    padding: 0;
    margin: 0;
  }
  .links {
    display: flex;
    font-family: "Open Sans";
    span {
      padding: 0 10px;
      font-size: 18px;
      border-right: 1px solid #9fb3c8;
      &:last-child {
        border-right: none;
      }
    }
  }
  .version,
  .branch {
    font-family: "Open Sans";
    padding: 0 10px;
    color: #9fb3c8;
    font-size: 12px;
    margin-top: 5px;
  }
}
.header {
  padding: 10px 20px;
  .logo {
    font-family: "Open Sans";
    letter-spacing: 3px;
    padding-top: 15px;
    padding-bottom: 15px;
    color: #fff;
  }
}
</style>

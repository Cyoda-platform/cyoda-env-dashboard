<template>
  <div>
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

<style scoped>
.footer {
  text-align: center;
}

.version,
.branch {
  font-family: "Open Sans", sans-serif;
  padding: 0 10px;
  color: #6a7686;
  font-size: 12px;
  margin-top: 5px;
}
</style>

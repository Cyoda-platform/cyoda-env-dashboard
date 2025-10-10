<template>
  <div class="cyoda-version-mismatch">
    <el-alert v-if="!isVersionEqual" title="Version Mismatch" type="warning" :closable="false" show-icon>
      <template #default> Platform version: {{ platform.version || "-" }}, but UI version is {{ uiVersion || "-" }}. This may cause the system to malfunction. </template>
    </el-alert>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from "vue";

import * as api from "../../../api";
import { VersionPlatform } from "../../../types/types";

let uiVersion = ref(import.meta.env.VITE_APP_UI_VERSION!);
const isVersionEqual = ref<boolean>(true);
let platform = reactive({});
checkVersion();

async function checkVersion() {
  const { data: platformData } = await api.versionPlatform();
  platform = platformData;

  const platformVersion = platform.version || "-";
  const platformVersionMatch = platformVersion.match(/\d+\.\d+\.\d+/);
  const uiVersionMatch = uiVersion.value.match(/\d+\.\d+\.\d+/);

  isVersionEqual.value = platformVersionMatch[0] === uiVersionMatch[0];
}
</script>

<style lang="scss">
.cyoda-version-mismatch {
  margin-bottom: 25px;
}
</style>

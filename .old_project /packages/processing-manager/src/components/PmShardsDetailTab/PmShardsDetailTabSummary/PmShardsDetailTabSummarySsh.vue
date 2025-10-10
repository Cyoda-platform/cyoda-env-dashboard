<template>
  <div class="card">
    <div class="card-header flex">
      <div>Console</div>
      <div>
        <a @click.prevent="onClickSettings" href="#">
          <font-awesome-icon icon="cogs" />
        </a>
      </div>
    </div>
    <div class="card-body">
      <el-link @click="runLaunchConsole" :underline="false">
        <font-awesome-icon icon="terminal" />
        Launch Console
      </el-link>
    </div>
    <PmShardsDetailTabSummarySshSettings ref="pmShardsDetailTabSummarySshSettingsRef" />
    <PmShardsDetailTabSummarySshConsole ref="pmShardsDetailTabSummarySshConsoleRef" />
  </div>
</template>

<script setup lang="ts">
import { useRoute } from "vue-router";
import { ref, computed } from "vue";

import PmShardsDetailTabSummarySshSettings from "../../../components/PmShardsDetailTab/PmShardsDetailTabSummary/PmShardsDetailTabSummarySshSettings.vue";

import PmShardsDetailTabSummarySshConsole from "../../../components/PmShardsDetailTab/PmShardsDetailTabSummary/PmShardsDetailTabSummarySshConsole.vue";
import {useSshStore} from "../../../stores/ssh";

const route = useRoute();
const sshStore = useSshStore();
const settings = computed(() => {
  return sshStore.settings;
});
const pmShardsDetailTabSummarySshConsoleRef = ref(null);
const pmShardsDetailTabSummarySshSettingsRef = ref(null);

function onClickSettings() {
  pmShardsDetailTabSummarySshSettingsRef.value.dialogVisible = true;
}

function runLaunchConsole() {
  let form = {
    hostname: "",
    username: "",
    password: ""
  };
  const settingsValue = settings.value?.find((el: any) => el.name === route.params.name);
  if (settingsValue) {
    form = settingsValue.form;
  }
  const baseUrl = import.meta.env.VITE_APP_BASE_URL;
  const link = `${baseUrl}:8888/?hostname=${form.hostname}&username=${form.username}&password=${btoa(form.password)}`;
  pmShardsDetailTabSummarySshConsoleRef.value.link = link;
  pmShardsDetailTabSummarySshConsoleRef.value.dialogVisible = true;
}
</script>

<style scoped>
svg {
  margin-right: 5px;
}

.flex {
  display: flex;
  justify-content: space-between;
}
</style>

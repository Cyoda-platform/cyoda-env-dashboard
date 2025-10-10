<template>
  <div class="processing-view-wrapper">
    <portal to="breadcrumbs">
      <div class="c-subheader px-3">
        <!-- Breadcrumb-->
        <ol class="breadcrumb border-0 m-0" v-if="breadcrumbs">
          <li v-for="(breadcrumb, index) in breadcrumbs" :key="`${breadcrumb.link}${index}`"
              class="breadcrumb-item">
            <template v-if="breadcrumb.link">
              <router-link :to="breadcrumb.link">
                {{ breadcrumb.name }}
              </router-link>
            </template>
            <template v-else>
              {{ breadcrumb.name }}
            </template>
          </li>
          <!-- Breadcrumb Menu-->
        </ol>
        <div class="consistency-time">Consistency time lag(millis): {{ consistencyTimeLagMs }}</div>
        <div class="delimiter">|</div>
        <div>
          Live update:
          <el-switch v-model="liveUpdate"/>
        </div>
        <div class="delimiter">|</div>
        <div class="proxy-request">
          <PmHeaderProxyRequest/>
        </div>
      </div>
    </portal>

    <slot></slot>
  </div>
</template>

<script setup lang="ts">
import {useRoute} from "vue-router";
import {ref, computed, onBeforeUnmount, watch, getCurrentInstance} from "vue";
/* eslint-disable */

import PmHeaderProxyRequest from "./PmHeader/PmHeaderProxyRequest.vue";
import {useProcessingStore} from "../stores/processing";
import {useGrafanaStore} from "../stores/grafana";
import {useAppStore} from "../stores/app";
import HelperStorage from "@cyoda/ui-lib/src/helpers/HelperStorage";

const helperStorage = new HelperStorage();
const liveUpdate = ref(helperStorage.get("liveUpdate", false));
const route = useRoute();
const processingStore = useProcessingStore();
const grafanaStore = useGrafanaStore();
const appStore = useAppStore();
const breadcrumbs = computed(() => {
  return route.meta.breadcrumbsComputed;
})

function pmClusterStatsFull() {
  return processingStore.pmClusterStatsFull();
}

function loadNodes() {
  return processingStore.loadNodes();
}

function init() {
  return grafanaStore.init();
}

const consistencyTimeLagMs = ref(0);
let intervalId: any = null;


loadNodes();
init();

const fetchStats = async () => {
  if (!liveUpdate.value) {
    intervalId = setTimeout(fetchStats, 1000);
    return;
  }
  const {data} = await pmClusterStatsFull();
  consistencyTimeLagMs.value = data.consistencyTimeLagMs;
  intervalId = setTimeout(fetchStats, 1000);
};

fetchStats();

onBeforeUnmount(() => {
  if (intervalId) {
    clearInterval(intervalId);
  }
});

const app = getCurrentInstance();
watch(() => route.params.name, (newValue: string) => {
  appStore.setNode(newValue);
}, {immediate: true})

watch(liveUpdate, (newValue: boolean) => {
  helperStorage.set("liveUpdate", newValue);
})
</script>

<style scoped>
.c-subheader {
  display: flex;
  align-items: center;
}

.consistency-time {
  margin-left: auto;
}

.delimiter {
  margin: 0 10px;
  position: relative;
  top: -1px;
}
</style>

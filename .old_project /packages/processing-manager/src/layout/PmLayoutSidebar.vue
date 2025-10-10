<template>
  <div>
    <PmSidebar />
    <div class="c-wrapper">
      <PmHeader />
      <div class="c-body">
        <main class="c-main">
          <div class="container-fluid">
            <div class="fade-in">
              <slot />
            </div>
          </div>
        </main>
      </div>
      <PmFooter />
    </div>
  </div>
</template>
<script setup lang="ts">
import { useRoute } from "vue-router";
import {computed, getCurrentInstance, watch} from "vue";

import PmHeader from "../components/PmHeader/PmHeader.vue";
import PmSidebar from "../components/PmSidebar/PmSidebar.vue";
import PmFooter from "../components/PmFooter/PmFooter.vue";
import {useProcessingStore} from "../stores/processing";
import {useAppStore} from "../stores/app";

const route = useRoute();
const processingStore = useProcessingStore();
const nodes = computed(() => {
  return processingStore.nodes;
});

const appStore = useAppStore();
watch(nodes, () => {
  const node = nodes.value.find((el: any) => el.hostname === route.params.name);
  if (node) {
    appStore.setBaseUrl(node.baseUrl);
  }
});
</script>

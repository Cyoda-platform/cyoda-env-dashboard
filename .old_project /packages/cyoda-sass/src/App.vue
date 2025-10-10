<template>
  <div id="app">
    <component :is="layout">
      <keep-alive>
        <RouterView v-if="route.meta.keepAlive" />
      </keep-alive>
      <RouterView v-if="!route.meta.keepAlive" />
    </component>
    <ErrorHandler />
  </div>
</template>

<script setup lang="ts">
import { useRoute, RouterView } from "vue-router";
import { computed } from "vue";

import ErrorHandler from "@cyoda/ui-lib/src/components-library/elements/ErrorHandler/ErrorHandler.vue";

const defaultLayout = "default";

const route = useRoute();
const layout = computed(() => {
  if (route.params.workflowType) {
    return "sidebar-layout";
  } else {
    return `${route.meta.layout || defaultLayout}-layout`;
  }
});
</script>

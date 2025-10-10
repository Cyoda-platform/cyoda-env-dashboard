<template>
  <div id="app">
    <component :is="layout">
      <router-view />
    </component>
        <TasksNotifications/>
    <ErrorHandler />
  </div>
</template>

<script setup lang="ts">
import { useRoute } from "vue-router";
import { computed } from "vue";

import TasksNotifications from "@cyoda/ui-lib/src/components-library/elements/TasksNotifications/TasksNotifications.vue";
import ErrorHandler from "@cyoda/ui-lib/src/components-library/elements/ErrorHandler/ErrorHandler.vue";

const defaultLayout = "base";

const route = useRoute();
const layout = computed(() => {
  return `${route.meta.layout || defaultLayout}-wrapper-layout`;
});
</script>

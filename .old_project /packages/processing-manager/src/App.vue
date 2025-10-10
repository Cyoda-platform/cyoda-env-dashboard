<template>
  <div id="app">
    <component :is="layout">
      <router-view />
    </component>
  </div>
</template>

<script setup lang="ts">
import { useRoute } from "vue-router";
import { computed } from "vue";

const defaultLayout = "default";

const route = useRoute();
const layout = computed(() => {
  return `${route.meta.layout || defaultLayout}-layout`;
});
</script>

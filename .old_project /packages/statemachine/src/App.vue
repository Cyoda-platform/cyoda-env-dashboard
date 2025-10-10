<template>
  <component :is="layout">
    <router-view />
  </component>
</template>

<script setup lang="ts">
import { useRoute } from 'vue-router'
import { computed } from 'vue'

const defaultLayout = 'base'

const route = useRoute()
const layout = computed(() => {
  return `${route.meta.layout || defaultLayout}-wrapper-layout`
})
</script>

<template>
  <div>
    <span class="label">Description</span>
    <div class="text" v-if="configDefinition && configDefinition.description">
      {{ configDefinition.description }}
    </div>
    <div class="text" v-else>Please, select predefined report config to show description</div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps({
  configDefinition: {
    default: () => {
      return {};
    }
  }
});
</script>

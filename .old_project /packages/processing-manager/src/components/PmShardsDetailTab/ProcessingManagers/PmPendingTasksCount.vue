<template>
  <div class="card">
    <div class="card-header">Pending Tasks count</div>
    <div class="card-body">
      {{ pendingTaskCount }}
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps({ pendingTaskCount: { default: 0 } });
</script>

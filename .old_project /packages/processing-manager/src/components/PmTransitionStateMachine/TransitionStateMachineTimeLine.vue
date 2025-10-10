<template>
  <div class="card">
    <div class="card-header">Time Line</div>
    <div class="card-body">
      <el-timeline>
        <el-timeline-item v-for="(activity, index) in activities" :key="index" :timestamp="activity.timestamp">
          {{ activity.content }}
        </el-timeline-item>
      </el-timeline>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";

const props = defineProps({ entityVersions: { default: () => [] } });
const activities = computed(() => {
  return props.entityVersions.map((el) => ({
    content: el.state,
    timestamp: el.date
  }));
});
</script>

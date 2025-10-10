<template>
  <div class="card">
    <div class="card-header">Resources</div>
    <div class="card-body">
      <div class="progress-container" v-for="resource in poolInfo" :key="resource.type">
        <div class="title">{{ capitalize(resource.type) }}</div>
        <el-progress :show-text="false" :stroke-width="10" :percentage="getPercentage(resource)" :status="getStatus(resource)"></el-progress>
        <div class="labels d-flex justify-content-between">
          <div>{{ resource.available }}/{{ resource.poolSize }}</div>
          <div class="bold">
            {{ resource.size }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import _ from "lodash";

const props = defineProps({ poolInfo: { default: () => [] } });

function getUsed(resource: any) {
  return resource.poolSize - resource.available;
}
function getPercentage(resource: any) {
  const used = getUsed(resource);
  return Math.ceil((used / resource.poolSize) * 100);
}
function getStatus(resource: any) {
  const percentage = getPercentage(resource);
  if (percentage < 30) {
    return "success";
  }
  if (percentage < 50) {
    return "success";
  }
  if (percentage < 80) {
    return "warning";
  }
  return "exception";
}
function capitalize(string: string) {
  return _.capitalize(string);
}
</script>

<style scoped>
.title {
  font-weight: bold;
  font-size: 16px;
}

.progress-container {
  margin-bottom: 15px;
}

.bold {
  font-weight: bold;
}

.labels {
  margin-top: 5px;
}
</style>

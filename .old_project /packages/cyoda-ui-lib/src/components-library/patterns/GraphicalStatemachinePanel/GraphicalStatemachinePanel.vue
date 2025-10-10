<template>
  <div>
    <el-button @click="emit('toggleListOfTransitions')">
      <font-awesome-icon :icon="showListOfTransitions?'eye':'eye-slash'"/>
      List of transitions
    </el-button>
    <el-button @click="emit('toggleProcesses')">
      <font-awesome-icon :icon="showProcesses?'eye':'eye-slash'"/>
      processes
    </el-button>
    <el-button @click="emit('toggleCriteria')">
      <font-awesome-icon :icon="showCriteria?'eye':'eye-slash'"/>
      criteria
    </el-button>
    <el-button @click="emit('toggleTitles')">
      <font-awesome-icon :icon="showTitles?'eye':'eye-slash'"/>
      states
    </el-button>
    <el-button @click="emit('toggleEdgesTitles')">
      <font-awesome-icon :icon="showEdgesTitles?'eye':'eye-slash'"/>
      transitions titles
    </el-button>
    <el-button @click="emit('resetPositions')" type="warning"> Reset positions</el-button>
  </div>
</template>

<script setup lang="ts">
const props = defineProps({
  showProcesses: {type: Boolean, default: true},
  showListOfTransitions: {type: Boolean, default: true},
  showCriteria: {type: Boolean, default: true},
  showTitles: {type: Boolean, default: true},
  showEdgesTitles: {type: Boolean, default: false}
});
const emit = defineEmits(['toggleListOfTransitions', 'toggleProcesses', 'toggleCriteria', 'toggleTitles', 'toggleEdgesTitles', 'resetPositions']);
</script>

<style lang="scss" scoped>
button {
  margin: 8px;
}
</style>

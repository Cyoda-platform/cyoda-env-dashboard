<template>
  <span v-if="nodeInfo[field] != clusterStateCurrentNode[field]" class="curr-node-info-check-state">
    <el-popover placement="top-start" title="Cluster state value" width="200" trigger="hover" :content="clusterStateCurrentNode[field]">
      <template #reference>
      <font-awesome-icon icon="exclamation-circle" />
      </template>
    </el-popover>
  </span>
</template>

<script setup lang="ts">
const props = defineProps({
  clusterStateCurrentNode: {
    default: () => {
      return {};
    }
  },
  nodeInfo: {
    default: () => {
      return {};
    }
  },
  field: {
    default: ""
  }
});
</script>

<style lang="scss">
.curr-node-info-check-state {
  svg {
    color: #ff6f6f;
    cursor: pointer;
  }
}
</style>

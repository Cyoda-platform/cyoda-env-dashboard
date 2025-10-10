<template>
  <div class="code" :class="{ 'is-not-collapsed': !isCollapsed }">
    <div @click="onToggleCollapse" class="header">
      <div>{{ isCollapsed ? "Expand" : "Collapse" }} code</div>
      <div>
        <font-awesome-icon icon="chevron-down" />
      </div>
    </div>
    <el-collapse-transition>
      <div v-show="!isCollapsed" class="body">
        <pre v-text="code"></pre>
      </div>
    </el-collapse-transition>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";

const props = defineProps({
  code: {
    default: () => {
      return {};
    }
  }
});

const isCollapsed = ref<boolean>(true);

function onToggleCollapse() {
  isCollapsed.value = !isCollapsed.value;
}
</script>

<style scoped lang="scss">
.code {
  margin-top: 15px;
}

.header {
  display: flex;
  padding: 15px 20px;
  background-color: #909399;
  color: #fff;
  justify-content: space-between;
  font-weight: bold;
  cursor: pointer;
}

.body {
  padding: 15px;
  border: 2px solid #909399;
  color: #000;
}

.header svg {
  transition: all 0.5s;
}

.is-not-collapsed {
  .header svg {
    transform: rotate(-180deg);
  }
}
</style>

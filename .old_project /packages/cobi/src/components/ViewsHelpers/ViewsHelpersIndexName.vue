<template>
  <span class="views-helpers-index-name">
    <template v-if="!row.id">
      <el-popover placement="top-start" title="Auto saved record" trigger="click" width="350">
        <p>Created at: {{ row.virtual.createdAt }}</p>
        <p>Updated at: {{ row.virtual.updatedAt }}</p>
        <template #reference>
          <span>
            <font-awesome-icon icon="info-circle" />
            Draft {{ row.name ? `(${row.name})` : "" }}
          </span>
        </template>
      </el-popover>
    </template>
    <template v-else>
      {{ row.name }}
    </template>
  </span>
</template>

<script setup lang="ts">
import { ref } from "vue";

const props = defineProps({
  row: {
    default: () => ({})
  }
});

const relationOptions = ref(null);
</script>

<style scoped>
.views-helpers-index-name {
  cursor: pointer;
}
</style>

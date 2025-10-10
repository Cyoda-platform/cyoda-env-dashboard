<template>
  <div>
    <el-drawer append-to-body class="upload-file-sample-column-settings-mapper-documentation" size="700px" :title="computedTitle" v-model="drawerVisible" direction="rtl">
      <div class="inner" v-html="docMapper.doc"></div>
    </el-drawer>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";

const props = defineProps({
  docMapper: {
    default: () => {
      return {};
    }
  }
});
const computedTitle = computed(() => {
  return `Mapper Settings Documentation for type: ${props.docMapper.title}`;
});

const drawerVisible = ref<boolean>(false);
</script>

<style lang="scss">
.upload-file-sample-column-settings-mapper-documentation {
  table {
    width: 100%;
  }
  td,
  th {
    padding: 5px;
  }
  h3,
  h4 {
    margin-top: 16px;
  }
}
</style>

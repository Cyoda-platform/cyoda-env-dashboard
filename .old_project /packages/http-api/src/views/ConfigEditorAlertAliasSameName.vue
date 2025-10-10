<template>
  <el-alert v-if="isColumnNameSameAsAlias" class="is-column-name-same-as-alias" title="Warning" type="warning"
            :description="description" show-icon></el-alert>
</template>

<script setup lang="ts">
import {computed} from "vue";

const props = defineProps({
  configDefinition: {
    default: () => {
      return {};
    }
  }
});
const sameWithAliases = computed(() => {
  const columns = props.configDefinition.colDefs.map((el) => el.fullPath);
  return props.configDefinition.aliasDefs.filter((el) => columns.includes(el.name)).map((el) => el.name);
});

const isColumnNameSameAsAlias = computed(() => {
  return sameWithAliases.value.length > 0;
})

const description = computed(() => {
  return `Alias name same with column names: ${sameWithAliases.value.join(', ')}`
})
</script>

<style lang="scss">
.is-column-name-same-as-alias {
  margin-bottom: 15px !important;
}
</style>

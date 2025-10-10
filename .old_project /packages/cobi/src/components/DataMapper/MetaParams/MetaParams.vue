<template>
  <div class="meta-params">
    <h2>Meta Params</h2>
    <MetaParamsRow v-for="metaParam in metaParams" :key="metaParam.name" :metaParam="metaParam" :allDataRelations="allDataRelations":selectedEntityMapping="selectedEntityMapping"
    />
  </div>
</template>

<script setup lang="ts">
import MetaParamsRow from "./MetaParamsRow.vue";

const props = defineProps({
  metaParams: undefined,
  allDataRelations: undefined,
  selectedEntityMapping: {
    default: () => {
      return {};
    },
  }
});
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
.meta-params {
  margin-top: 30px;
}
</style>

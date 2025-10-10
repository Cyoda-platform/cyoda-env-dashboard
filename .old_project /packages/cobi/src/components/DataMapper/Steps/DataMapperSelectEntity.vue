<template>
  <div class="data-mapper-select-entity">
    <EntityMapping :isFirst="true" :noneMappingFields="noneMappingFields" :sourceData="sourceData" ref="entityMappingRef" :dataMappingConfigDto="dataMappingConfigDto" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";

import EntityMapping from "../../../components/DataMapper/EntityMapping.vue";

const props = defineProps({
  sourceData: undefined,
  noneMappingFields: { default: () => [] },
  dataMappingConfigDto: {
    default: () => {
      return {};
    }
  }
});

const entityMappingRef = ref(null);

onMounted(() => {
  if (props.dataMappingConfigDto.entityMappings.length > 0) {
    entityMappingRef.value.entityMapping = props.dataMappingConfigDto.entityMappings[0];
  }
});

defineExpose({ entityMappingRef });
</script>

<style scoped lang="scss">
.data-mapper-select-entity {
  margin-top: 20px;
}
</style>

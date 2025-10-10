<template>
  <div class="navigation-entity" v-if="dataMappingConfigDto.entityMappings.length > 1">
    <div>
      <el-button :disabled="isDisablePrev" @click="onPrevEntity">
        <font-awesome-icon icon="arrow-left" />
        Previous Entity
      </el-button>
    </div>
    <div>
      <el-button :disabled="isDisableNext" @click="onNextEntity">
        Next Entity
        <font-awesome-icon icon="arrow-right" />
      </el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from "vue";

const emit = defineEmits(["change"]);
const props = defineProps({
  dataMappingConfigDto: {
    default: () => {
      return {};
    }
  }
});
const isDisablePrev = computed(() => {
  return index.value == 0;
});
const isDisableNext = computed(() => {
  const count = props.dataMappingConfigDto.entityMappings.length - 1;
  return index.value == count;
});

const index = ref(0);
function onPrevEntity() {
  if (index.value > 0) {
    index.value -= 1;
  }
  emitData();
}
function onNextEntity() {
  const count = props.dataMappingConfigDto.entityMappings.length - 1;
  if (index.value < count) {
    index.value += 1;
  }
  emitData();
}

function emitData() {
  emit("change", index.value);
}

emitData();

watch(
  () => props.dataMappingConfigDto.entityMappings,
  () => {
    emitData();
  },
  { immediate: true }
);

defineExpose({ index, onNextEntity, onPrevEntity });
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
.navigation-entity {
  display: flex;
  justify-content: space-between;
}
</style>

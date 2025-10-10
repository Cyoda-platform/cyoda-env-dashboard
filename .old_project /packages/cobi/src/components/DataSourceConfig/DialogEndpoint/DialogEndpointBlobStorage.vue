<template>
  <div class="dialog-endpoint-blob-storage">
    <DialogEndpointFieldOperation :endpointDto="endpointDto" />
    <div class="flex-row">
      <div class="full-width">
        <el-form-item label="Consumer" prop="consumerConfig.configId">
          <el-select filterable clearable v-model="endpointDto.consumerConfig.configId" placeholder="Select">
            <el-option v-for="item in dataMappingConfigOptions" :key="item.value" :label="item.label" :value="item.value"></el-option>
          </el-select>
        </el-form-item>
      </div>
      <div>
        <el-button :disabled="!endpointDto.consumerConfig.configId" @click="onEditMappingConfig" type="primary">
          Edit
          <font-awesome-icon icon="pencil-alt" />
        </el-button>
      </div>
    </div>

    <BlobStorageParameters :parameters="endpointDto.parameters" />
    <DialogCreateDataMapping v-if="dialogCreateDataMappingVisible" ref="dialogCreateDataMappingRef" />
  </div>
</template>

<script setup lang="ts">
import { ref, nextTick, computed } from "vue";

import DialogEndpointFieldOperation from "./Fields/DialogEndpointFieldOperation.vue";
import DialogCreateDataMapping from "../DialogCreateDataMapping.vue";
import BlobStorageParameters from "../BlobStorageParameters/BlobStorageParameters.vue";

const props = defineProps({
  endpointDto: {
    default: () => {
      return {};
    }
  },
  listAllDataMappings: {
    default: () => {
      return [];
    }
  }
});
const dataMappingConfigOptions = computed(() => {
  return props.listAllDataMappings.map((el) => {
    return {
      value: el.id,
      label: el.name
    };
  });
});

const dialogCreateDataMappingRef = ref(null);

const dialogCreateDataMappingVisible = ref<boolean>(true);

async function onEditMappingConfig() {
  dialogCreateDataMappingVisible.value = false;
  await nextTick();

  dialogCreateDataMappingVisible.value = true;
  await nextTick();
  dialogCreateDataMappingRef.value.dialogVisible = true;
  await nextTick();
  dialogCreateDataMappingRef.value.dataMapperEditRef.loadMappingById(props.endpointDto.consumerConfig.configId);
}

defineExpose({ dialogCreateDataMappingVisible });
</script>

<style lang="scss">
.dialog-endpoint-blob-storage {
  .flex-row {
    display: flex;

    .full-width {
      flex-grow: 1;
      margin-right: 15px;
    }
  }
}
</style>

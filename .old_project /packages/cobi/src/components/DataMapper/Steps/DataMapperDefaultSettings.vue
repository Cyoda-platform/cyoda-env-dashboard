<template>
  <div class="data-mapper-default-settings">
    <el-form :model="dataMappingConfigDto" :rules="rules" ref="formRef" label-width="120px">
      <el-form-item label="Name" prop="name">
        <el-input v-model="dataMappingConfigDto.name"></el-input>
      </el-form-item>
      <el-form-item label="Data Type" prop="dataType">
        <el-select v-model="dataMappingConfigDto.dataType" placeholder="Select">
          <el-option v-for="item in dataTypeOptions" :key="item.value" :label="item.label" :value="item.value"> </el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="Description" prop="description">
        <el-input type="textarea" :autosize="{ minRows: 4, maxRows: 6 }" v-model="dataMappingConfigDto.description"></el-input>
      </el-form-item>
    </el-form>
  </div>
</template>

<script setup lang="ts">
import { usePlatformMappingStore } from "../../../stores/platform-mapping";
import { ref, watch } from "vue";

import HelperContent from "../../../helpers/HelperContent";

const props = defineProps({
  dataMappingConfigDto: {
    default: () => {
      return {};
    }
  }
});
const platformMappingStore = usePlatformMappingStore();
function getListAllDataMappings() {
  return platformMappingStore.getListAllDataMappings();
}

function getListAllDataTypes() {
  return platformMappingStore.getListAllDataTypes();
}

function setDataType(val) {
  return platformMappingStore.setDataType(val);
}

const formRef = ref(null);

let dataTypeOptions = ref([]);

let rules = ref({
  name: [
    { required: true, message: "Please fill field Name", trigger: "blur" },
    { validator: checkUniqName, trigger: "blur" }
  ],
  dataType: [{ required: true, message: "Please fill field Data Type", trigger: "blur" }]
});

async function checkUniqName(rule: any, value: any, callback: any) {
  callback();
}
loadListAllDataTypes();

async function loadListAllDataTypes() {
  const { data } = await getListAllDataTypes();
  const listIgnore = ["SQL"];
  const dataFiltered = data.filter((el: string) => listIgnore.indexOf(el) == -1);
  dataTypeOptions.value = HelperContent.transformEnumToOption(dataFiltered);
}

watch(
  () => props.dataMappingConfigDto.dataType,
  (val: string) => {
    setDataType(val);
    if (val == "BINARY_DOC") {
      props.dataMappingConfigDto.sampleContent = JSON.stringify({
        content: "",
        "content-size": ""
      });
    }
  },
  { immediate: true }
);

defineExpose({ formRef });
</script>

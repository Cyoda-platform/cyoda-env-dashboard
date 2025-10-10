<template>
  <el-dialog :close-on-click-modal="false" :title="computedTitle" v-model="dialogVisible" width="500px">
    <el-form :model="form" :rules="rules" ref="elFormRef" label-width="120px" class="demo-ruleForm">
      <el-form-item label="Name" prop="name">
        <el-input v-model="form.name"></el-input>
      </el-form-item>
    </el-form>
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="dialogVisible = false">Close</el-button>
        <el-button :loading="isLoading" type="primary" @click="onCopy">Copy</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import {ref, reactive, computed} from "vue";

import HelperErrors from "@cyoda/ui-lib/src/helpers/HelperErrors";
import {usePlatformMappingStore} from "../../stores/platform-mapping";
import {useDataSourceConfigStore} from "../../stores/data-source-config";
import {useChainingConfigStore} from "../../stores/chaining-config";

const props = defineProps({type: {default: "", required: true}});
const platformMappingStore = usePlatformMappingStore();
const dataSourceConfigStore = useDataSourceConfigStore();
const chainingConfigStore = useChainingConfigStore();

const computedTitle = computed(() => {
  return `Copy: ${dataBefore.value.name}`;
});

function getListAllDataMappings(value) {
  return platformMappingStore.getListAllDataMappings(value);
}

function getDataMapping(id) {
  return platformMappingStore.getDataMapping(id);
}

function savePlatformMapping(value) {
  return platformMappingStore.postSave(value);
}

function getListAll() {
  return dataSourceConfigStore.getListAll();
}

function saveDataSourceConfig(dataForSave) {
  return dataSourceConfigStore.postSave(dataForSave);
}

function getDataSourceConfigById(id) {
  return dataSourceConfigStore.getById(id);
}

function getChainingConfigById(id) {
  return chainingConfigStore.getById(id);
}

function saveDataChainingConfig(dataForSave) {
  return chainingConfigStore.postSave(dataForSave);
}

const elFormRef = ref(null);

const dialogVisible = ref<boolean>(false);
const isLoading = ref<boolean>(false);
let form = ref({
  name: "",
  id: null
});
let dataBefore = ref({});

let rules = reactive({
  name: [
    {required: true, message: "Please input Name", trigger: "blur"},
    {validator: checkUniqName, trigger: "blur"}
  ]
});

async function checkUniqName(rule: any, value: any, callback: any) {
  let response: any = {};
  if (props.type == "DataMapper") {
    const {data} = await getListAllDataMappings(false);
    response = data;
  } else if (props.type == "DataSourceConfig") {
    const {data} = await getListAll();
    response = data;
  } else if (props.type == "DataChainingConfig") {
    const {data} = await chainingConfigStore.getListAll();
    response = data;
  }
  const names = response.map((el: any) => el.name);
  if (names.indexOf(value) > -1) {
    return callback(new Error(`This name is not unique`));
  }
  callback();
}

function copy(data: any) {
  dialogVisible.value = true;
  dataBefore.value = JSON.parse(JSON.stringify(data));
  form.value.id = data.id;
  form.value.name = `${data.name} copy`;
}

const emit = defineEmits(['copied']);

function onCopy() {
  isLoading.value = true;
  elFormRef.value.validate(async (valid: boolean) => {
    if (valid) {
      try {
        let response: any = {};
        if (props.type == "DataMapper") {
          const {data: dataForSave} = await getDataMapping(form.value.id);
          const {data} = await savePlatformMapping(prepareDataForSave(dataForSave));
          response = data;
        } else if (props.type == "DataSourceConfig") {
          const {data: dataForSave} = await getDataSourceConfigById(form.value.id);
          const {data} = await saveDataSourceConfig(prepareDataForSave(dataForSave));
          response = data;
        } else if (props.type == "DataChainingConfig") {
          const {data: dataForSave} = await getChainingConfigById(form.value.id);
          const {data} = await saveDataChainingConfig(prepareDataForSave(dataForSave));
          response = data;
        }
        if (response.success) {
          emit("copied");
          dialogVisible.value = false;
          resetForm();
        } else {
          HelperErrors.handler(response);
        }
      } finally {
        isLoading.value = false;
      }
    } else {
      isLoading.value = false;
    }
  });
}

function prepareDataForSave(data) {
  const dataCopy = JSON.parse(JSON.stringify(data));
  dataCopy.id = null;
  dataCopy.name = form.value.name;
  return dataCopy;
}

function resetForm() {
  form.value = {
    name: "",
    id: null
  };
}

defineExpose({dialogVisible, isLoading, copy});
</script>

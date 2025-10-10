<template>
  <el-drawer z-index="6000" append-to-body title="Documentation" size="40%" class="function-description-dialog" v-model="dialogVisible">
    <el-form :inline="true" class="demo-form-inline">
      <el-form-item label="Search by filter name">
        <el-input @input="debounceFilter" v-model="formFilter.searchValue" placeholder="Search"></el-input>
      </el-form-item>
    </el-form>

    <div :key="keyShow">
      <template v-if="isShowFunctions">
        <h1 v-if="simpleList.length > 0 || reduceList.length > 0 || reduceList.length > 0">Functions</h1>
        <el-collapse v-model="activeFunctionName" accordion>
          <el-collapse-item v-if="simpleList.length > 0" title="Simple" name="simple">
            <div class="block">
              <template v-for="functionDesc in simpleList">
                <FunctionDescriptionSection :search="formFilter.search" :isShowUseBtn="isShowUseBtn" :listAllFunctions="listAllFunctions" :listAllTransformers="listAllTransformers" :listAllDictionaries="listAllDictionaries" :listAllExamplesFunctions="listAllExamplesFunctions" :functionDesc="functionDesc" />
              </template>
            </div>
          </el-collapse-item>

          <el-collapse-item v-if="reduceList.length > 0" title="Reduce" name="reduce">
            <div class="block">
              <template v-for="functionDesc in reduceList">
                <FunctionDescriptionSection :search="formFilter.search" :isShowUseBtn="isShowUseBtn" :listAllFunctions="listAllFunctions" :listAllTransformers="listAllTransformers" :listAllDictionaries="listAllDictionaries" :listAllExamplesFunctions="listAllExamplesFunctions" :functionDesc="functionDesc" />
              </template>
            </div>
          </el-collapse-item>

          <el-collapse-item v-if="enlargeList.length > 0" title="Enlarge" name="enlarge">
            <div class="block">
              <template v-for="functionDesc in enlargeList">
                <FunctionDescriptionSection :search="formFilter.search" :isShowUseBtn="isShowUseBtn" :listAllFunctions="listAllFunctions" :listAllTransformers="listAllTransformers" :listAllDictionaries="listAllDictionaries" :listAllExamplesFunctions="listAllExamplesFunctions" :functionDesc="functionDesc" />
              </template>
            </div>
          </el-collapse-item>
        </el-collapse>
      </template>

      <template v-if="isShowTransformers">
        <h1 class="margin-top" v-if="isExistFilterTransformers">Transformers</h1>

        <el-collapse v-model="activeTransformerName" accordion>
          <template v-for="type in transformersBlocklyTypes">
            <el-collapse-item v-if="transformersByType(type).length > 0" :title="type" :name="type">
              <div class="block">
                <template v-for="transformerDesc in transformersByType(type)">
                  <TransformerDescriptionSection :search="formFilter.search" :isShowUseBtn="isShowUseBtn" :listAllFunctions="listAllFunctions" :listAllTransformers="listAllTransformers" :listAllDictionaries="listAllDictionaries" :listAllExamplesTransformers="listAllExamplesTransformers" :transformerDesc="transformerDesc" />
                </template>
              </div>
            </el-collapse-item>
          </template>
        </el-collapse>
      </template>
    </div>
  </el-drawer>
</template>

<script setup lang="ts">
import { usePlatformMappingStore } from "../../../../../stores/platform-mapping";
import { ref, computed, watch } from "vue";

import FunctionDescriptionSection from "./FunctionDescriptionSection.vue";
import TransformerDescriptionSection from "./TransformerDescriptionSection.vue";

const props = defineProps({
  isShowFunctions: {
    default: true
  },
  isShowUseBtn: {
    default: true
  },
  isShowTransformers: {
    default: true
  }
});
const platformMappingStore = usePlatformMappingStore();
const simpleList = computed(() => {
  return filterData(listAllFunctions.value.filter((el: any) => el.functionClass.indexOf(".simple.") > -1));
});
const reduceList = computed(() => {
  return filterData(listAllFunctions.value.filter((el: any) => el.functionClass.indexOf(".reduce.") > -1));
});
const enlargeList = computed(() => {
  return filterData(listAllFunctions.value.filter((el: any) => el.functionClass.indexOf(".enlarge.") > -1));
});
const isExistFilterTransformers = computed(() => {
  return (
    listAllTransformers.value.filter((el: any) => {
      return el.description.toLowerCase().indexOf(formFilter.value.search.toLowerCase()) > -1;
    }).length > 0
  );
});
const transformersBlocklyTypes = computed(() => {
  const types = listAllTransformers.value.map((el: any) => {
    let name = el.inType.split(".").pop();
    if (name === "[B") name = "Bytes";
    return name;
  });
  return [...new Set(types)];
});
function getListAllFunctions() {
  return platformMappingStore.getListAllFunctions();
}

function getListAllTransformers() {
  return platformMappingStore.getListAllTransformers();
}

function getListExamplesFunctions() {
  return platformMappingStore.getListExamplesFunctions();
}

function getListExamplesTransformers() {
  return platformMappingStore.getListExamplesTransformers();
}

function getListAllDictionaries() {
  return platformMappingStore.getListAllDictionaries();
}

let listAllFunctions = ref([]);
let listAllTransformers = ref([]);
let listAllDictionaries = ref([]);
let listAllExamplesFunctions = ref([]);
let listAllExamplesTransformers = ref([]);
const keyShow = ref(0);
loadData();

const searchTimeout = ref(null);
function debounceFilter(value) {
  if (searchTimeout.value) clearTimeout(searchTimeout.value);
  searchTimeout.value = setTimeout(() => {
    formFilter.value.search = value;
  }, 500);
}
async function loadData() {
  const [dataListAllExamplesFunctions, dataListAllFunctions, dataListAllTransformers, dataListAllDictionaries] = await Promise.all([getListExamplesFunctions(), getListAllFunctions(), getListAllTransformers(), getListAllDictionaries()]);
  listAllExamplesFunctions.value = dataListAllExamplesFunctions.data;
  listAllFunctions.value = dataListAllFunctions.data;
  listAllTransformers.value = dataListAllTransformers.data;
  listAllDictionaries.value = dataListAllDictionaries.data;
}

const dialogVisible = ref<boolean>(false);
const activeFunctionName = ref<string>("");
const activeTransformerName = ref<string>("");

let formFilter = ref({
  search: "",
  searchValue: ""
});

let formFilterDefault = ref(JSON.parse(JSON.stringify(formFilter.value)));

function resetForm() {
  formFilter.value = JSON.parse(JSON.stringify(formFilterDefault.value));
  keyShow.value += 1;
  activeFunctionName.value = "";
}

function filterData(data) {
  return data.filter((el) => {
    return !formFilter.value.search || (el.name && el.name.toLowerCase().indexOf(formFilter.value.search.toLowerCase()) > -1) || (el.transformerKey && el.transformerKey.toLowerCase().indexOf(formFilter.value.search.toLowerCase()) > -1) || el.description.toLowerCase().indexOf(formFilter.value.search.toLowerCase()) > -1;
  });
}

function transformersByType(type) {
  return filterData(
    listAllTransformers.value.filter((el: any) => {
      if (type === "Bytes") return el.inType.indexOf(`[B`) > -1;
      return el.inType.indexOf(`.${type}`) > -1;
    })
  );
}

watch(
  dialogVisible,
  (val) => {
    if (val) {
      resetForm();
    }
  }
);

defineExpose({ dialogVisible });
</script>

<style lang="scss">
.function-description-dialog {
  h1 {
    margin-bottom: 10px;
  }

  h1.margin-top {
    margin-top: 30px;
  }

  .section {
    margin-bottom: 10px;

    .name {
      font-size: 16px;
      font-weight: bold;
      margin-bottom: 5px;
    }

    .description {
      margin-bottom: 15px;
    }

    .parameters-title {
      font-size: 14px;
      font-weight: bold;
      margin-bottom: 5px;
    }
  }

  //h2 {

  //}

  .block {
    padding: 10px;
    border: 1px solid #eee;
    margin-bottom: 20px;
  }

  .el-collapse-item__header {
    background-color: #eee;
    padding: 5px 10px;
    border-bottom: 1px solid #dedede;
    font-size: 16px;
  }

  .el-form--inline .el-form-item {
    display: flex;

    label {
      white-space: nowrap;
      text-align: left;
    }

    .el-form-item__content {
      width: 100%;
    }
  }
}
</style>

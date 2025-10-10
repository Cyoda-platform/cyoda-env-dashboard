<template>
  <div>
    <el-row :gutter="20">
      <el-col :span="12">
        <el-input placeholder="Filter" v-model="form.filter"></el-input>
      </el-col>
    </el-row>
    <el-table ref="elTableRef" @selection-change="handleSelectionChange" class="table" border v-loading="isLoading" :data="tableData" :default-sort="{ prop: 'lastUpdated', order: 'descending' }" style="width: 100%">
      <el-table-column type="selection" width="55"></el-table-column>
      <el-table-column sortable prop="name" label="Name"></el-table-column>
      <el-table-column sortable prop="dataType" label="Data Type" min-width="100">
        <template v-slot:default="{ row }">
          {{ getDataType(row) }}
        </template>
      </el-table-column>
      <el-table-column sortable prop="description" label="Description"></el-table-column>
      <el-table-column sortable prop="numberOfConfiguredColumns" width="270" label="Number of configured columns"></el-table-column>
      <el-table-column sortable prop="lastUpdated" label="Updated at">
        <template v-slot:default="{ row }">
          <span v-if="row.id">
            {{ $filters.mktimeToDateTime(row.lastUpdated) }}
          </span>
          <span v-else> - </span>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script setup lang="ts">
import { usePlatformMappingStore } from "../../../stores/platform-mapping";
import { ref, nextTick, computed, inject } from "vue";

import HelperContent from "../../../helpers/HelperContent";

const emit = defineEmits(["multipleSelection"]);
const platformMappingStore = usePlatformMappingStore();
const tableData = computed(() => {
  const filter = form.value.filter.toLowerCase();
  return listConfigs.value
    .filter((el: any) => {
      return !filter || el.name.toLowerCase().indexOf(filter) > -1;
    })
    .map((el) => {
      return {
        ...el,
        numberOfConfiguredColumns: calculateNumberOfConfiguredColumns(el)
      };
    });
});

function getListAllDataMappings(value) {
  return platformMappingStore.getListAllDataMappings(value);
}

function getListAllDataTypes() {
  return platformMappingStore.getListAllDataTypes();
}

const getSelectedItems = inject("getSelectedItems");
const selectedItemsType = inject("selectedItemsType");
const elTableRef = ref(null);

let listConfigs = ref([]);
let multipleSelection = ref([]);
let listAllDataTypes = ref([]);
const isLoading = ref<boolean>(false);

function handleSelectionChange(val: any) {
  multipleSelection.value = val;

  emit("multipleSelection", {
    key: "mappingsIds",
    data: val
  });
}

let form = ref({
  filter: ""
});

(async function () {
  await nextTick();

  await loadData();
  await loadListAllDataTypes();

  if (selectedItemsType === "dataMappings") {
    getSelectedItems.value.forEach((selectedItemEl) => {
      const selectedItem = tableData.value.find((tableDataEl) => tableDataEl.id === selectedItemEl.id);
      if (selectedItem) {
        elTableRef.value.toggleRowSelection(selectedItem);
      }
    });
  }
})();

async function loadData() {
  try {
    isLoading.value = true;
    const { data } = await getListAllDataMappings(false);
    listConfigs.value = data;
  } finally {
    isLoading.value = false;
  }
}

async function loadListAllDataTypes() {
  const { data } = await getListAllDataTypes();
  listAllDataTypes.value = HelperContent.transformEnumToOption(data);
}

function getDataType(row: any) {
  const usedVal: any = listAllDataTypes.value.find((el) => el.value == row.dataType);
  if (usedVal) {
    return usedVal.label;
  }
  return row.dataType;
}

function calculateNumberOfConfiguredColumns(row: any) {
  let total = 0;
  if (row?.entityMappings) {
    row.entityMappings.forEach((el: any) => {
      total += el.columns.length;
      el.functionalMappings.forEach((elFM: any) => {
        total += elFM.srcPaths.length;
      });
    });
  }
  return total;
}
</script>

<template>
  <div>
    <el-row :gutter="20">
      <el-col :span="12">
        <el-input placeholder="Filter" v-model="form.filter"></el-input>
      </el-col>
    </el-row>
    <el-table ref="elTableRef" @selection-change="handleSelectionChange" v-loading="isLoading" class="table" border :data="tableData" :default-sort="{ prop: 'lastUpdated', order: 'descending' }" style="width: 100%">
      <el-table-column type="selection" width="55"></el-table-column>
      <el-table-column sortable prop="name" label="Name"></el-table-column>
      <el-table-column sortable prop="description" label="Description"></el-table-column>
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
import { useDataSourceConfigStore } from "../../../stores/data-source-config";
import { ref, computed, inject } from "vue";

import HelperContent from "../../../helpers/HelperContent";

const emit = defineEmits(["multipleSelection"]);
const dataSourceConfigStore = useDataSourceConfigStore();
const tableData = computed(() => {
  const filter = form.value.filter.toLowerCase();
  return listConfigs.value.filter((el: any) => {
    return !filter || el.name.toLowerCase().indexOf(filter) > -1;
  });
});

function getListAll() {
  return dataSourceConfigStore.getListAll();
}

function deleteById() {
  return dataSourceConfigStore.deleteById();
}

function getAvailableAuthType() {
  return dataSourceConfigStore.getAvailableAuthType();
}

const getSelectedItems = inject("getSelectedItems");
const selectedItemsType = inject("selectedItemsType");
const elTableRef = ref(null);

const isLoading = ref<boolean>(false);
let listConfigs = ref([]);
let authTypeOptions = ref([]);
let multipleSelection = ref([]);

let form = ref({
  filter: ""
});
(async function () {
  await loadData();
  if (selectedItemsType === "connections") {
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
    await loadList();
    await loadAvailableAuthType();
  } finally {
    isLoading.value = false;
  }
}

async function loadAvailableAuthType() {
  const { data } = await getAvailableAuthType();
  authTypeOptions.value = HelperContent.transformEnumToOption(data);
}

async function loadList() {
  const { data } = await getListAll();
  listConfigs.value = data;
}

function handleSelectionChange(val: any) {
  multipleSelection.value = val;
  emit("multipleSelection", {
    key: "datasourcesIds",
    data: val
  });
}

function getAuthTypeName(val: string) {
  const used = authTypeOptions.value.find((el) => el.value === val);
  if (used && used.label) {
    return used.label;
  } else {
    return "-";
  }
}
</script>

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
import { useChainingConfigStore } from "../../../stores/chaining-config";
import { ref, computed, inject } from "vue";

const emit = defineEmits(["multipleSelection"]);
const chainingConfigStore = useChainingConfigStore();
const tableData = computed(() => {
  const filter = form.value.filter.toLowerCase();
  return listConfigs.value.filter((el: any) => {
    return !filter || el.name.toLowerCase().indexOf(filter) > -1;
  });
});

function getListAll() {
  return chainingConfigStore.getListAll();
}

function deleteById(id) {
  return chainingConfigStore.deleteById(id);
}

const getSelectedItems = inject("getSelectedItems");
const selectedItemsType = inject("selectedItemsType");
const elTableRef = ref(null);

const isLoading = ref<boolean>(false);
let listConfigs = ref([]);
let multipleSelection = ref([]);

let form = ref({
  filter: ""
});

(async function () {
  await loadData();
  if (selectedItemsType === "chaining") {
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
    await loadChainings();
  } finally {
    isLoading.value = false;
  }
}

async function loadChainings() {
  const { data } = await getListAll();
  listConfigs.value = data;
}

function handleSelectionChange(val: any) {
  multipleSelection.value = val;
  emit("multipleSelection", {
    key: "chainingsIds",
    data: val
  });
}
</script>

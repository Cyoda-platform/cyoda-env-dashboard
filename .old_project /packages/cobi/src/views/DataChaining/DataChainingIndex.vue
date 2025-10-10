<template>
  <div class="data-source-config-creation-index">
    <div class="card">
      <div class="card-body">
        <div class="flex">
          <div>
            <h4>Chaining</h4>
          </div>
          <div>
            <el-button @click="onClickDeleteSelected" :disabled="multipleSelection.length === 0" type="danger">
              Delete Selected
              <font-awesome-icon icon="trash"/>
            </el-button>
            <el-divider direction="vertical"></el-divider>
            <ExportImport class="export-import" type="data-chaining-config" :dataToExport="multipleSelection"/>
            <el-button @click="onAddNewConfiguration" type="primary">
              Create Configuration
              <font-awesome-icon icon="plus"/>
            </el-button>
          </div>
        </div>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-input placeholder="Filter" v-model="form.filter"></el-input>
          </el-col>
        </el-row>

        <data-tables
          ref="dataTableRef"
          @headerDragend="onHeaderDragend"
          v-model:pageSize="form.pageSize"
          v-model:currentPage="form.currentPage"
          :pagination-props="{ pageSizes: [5, 10, 20, 50] }"
          :table-props="{
            border: true
          }"
          @selection-change="handleSelectionChange"
          v-loading="isLoading"
          class="table"
          border
          :data="tableData"
          :default-sort="{ prop: 'lastUpdated', order: 'descending' }"
          style="width: 100%"
        >
          <el-table-column type="selection" width="55"></el-table-column>
          <el-table-column sortable prop="name" label="Name">
            <template v-slot:default="{ row }">
              <ViewsHelpersIndexName :row="row"/>
            </template>
          </el-table-column>
          <el-table-column sortable prop="lastUpdated" label="Updated at">
            <template v-slot:default="{ row }">
              <span v-if="row.id">
                {{ $filters.mktimeToDateTime(row.lastUpdated) }}
              </span>
              <span v-else> - </span>
            </template>
          </el-table-column>
          <el-table-column width="180" label="Actions">
            <template v-slot="{ row }">
              <CyodaButton size="default" type="warning" :to="getEditLink(row)">
                <font-awesome-icon icon="pencil-alt"/>
              </CyodaButton>
              <el-button size="default" type="danger" @click="onDelete(row)">
                <font-awesome-icon icon="trash"/>
              </el-button>
            </template>
          </el-table-column>
        </data-tables>
      </div>
    </div>
    <CopyData @copied="onCopied" ref="copyDataRef" type="DataChainingConfig"/>
  </div>
</template>

<script setup lang="ts">
import {useChainingConfigStore} from "../../stores/chaining-config";
import {ElMessageBox} from "element-plus";
import {useRouter} from "vue-router";
import {ref, nextTick, computed, onBeforeUnmount, provide, reactive} from "vue";

import ExportImport from "../../components/ExportImport/ExportImport.vue";
import CopyData from "../../components/CopyData/CopyData.vue";

import {useAutoSavingMixin} from "../../mixins/AutoSavingMixin";
import ViewsHelpersIndexName from "../../components/ViewsHelpers/ViewsHelpersIndexName.vue";
import _ from "lodash";
import CyodaButton from "../../components/CyodaButton/CyodaButton.vue";
import eventBus from "@cyoda/ui-lib/src/plugins/eventBus";
import {useTableSaveStateMixin} from "@cyoda/ui-lib/src/mixins/TableSaveStateMixin";

const {
  autoDataStorageKey,
  deleteAutoSaveRecordById,
  clearOldAutoSaveRecords,
  autoSaveRecordsForIndex,
  copyAutoSaveRecord
} = useAutoSavingMixin();

const dataTableRef = ref(null);
const router = useRouter();
const chainingConfigStore = useChainingConfigStore();
const tableData = computed(() => {
  const filter = form.filter.toLowerCase();
  return listConfigs.value.filter((el: any) => {
    return !form.filter || el.name.toLowerCase().indexOf(filter) > -1;
  });
});

function getListAll() {
  return chainingConfigStore.getListAll();
}

function deleteById(id) {
  return chainingConfigStore.deleteById(id);
}

const copyDataRef = ref(null);

const isLoading = ref<boolean>(false);
let listConfigs = ref([]);
let multipleSelection = ref([]);

provide("getSelectedItems", multipleSelection);
provide("selectedItemsType", "chaining");

let form = reactive({
  filter: "",
  currentPage: 1,
  pageSize: 10
});

const {onHeaderDragend} = useTableSaveStateMixin('dataChainingIndexTable', dataTableRef, form);

(async function () {
  autoDataStorageKey.value = `autoSave:${import.meta.env.VITE_APP_UI_VERSION}:dataChainingList`;
  clearOldAutoSaveRecords();

  await nextTick();

  loadData();
  eventBus.$on("closedImportExport:data-chaining-config", loadData);
})();

onBeforeUnmount(() => {
  eventBus.$off("closedImportExport:data-chaining-config", loadData);
});

async function loadData() {
  try {
    isLoading.value = true;
    await loadChainings();
  } finally {
    isLoading.value = false;
  }
}

async function loadChainings() {
  let {data} = await getListAll();
  data = _.orderBy(data, "lastUpdated", "desc");
  listConfigs.value = [...autoSaveRecordsForIndex.value, ...data];
}

function onAddNewConfiguration() {
  router.push("/data-mapper/chaining/configuration");
}

function getEditLink(row: any) {
  if (row.virtual) {
    return `/data-mapper/chaining/configuration/${row.virtual.id}?virtual=true`;
  }
  return `/data-mapper/chaining/configuration/${row.id}`;
}

function onDelete(row: any) {
  ElMessageBox.confirm("Do you really want to remove row?", "Confirm!", {
    callback: async (action) => {
      if (action === "confirm") {
        try {
          isLoading.value = true;
          if (row.virtual && row.virtual.id) {
            deleteAutoSaveRecordById(row.virtual.id);
          } else {
            await deleteById(row.id);
          }
          loadChainings();
        } finally {
          isLoading.value = false;
        }
      }
    }
  });
}

function onClickDeleteSelected() {
  ElMessageBox.confirm(`Do you really want to remove ${multipleSelection.value.length} row(s)?`, "Confirm!", {
    callback: async (action) => {
      if (action === "confirm") {
        try {
          isLoading.value = true;
          for (const row of multipleSelection.value) {
            if (row.virtual && row.virtual.id) {
              deleteAutoSaveRecordById(row.virtual.id);
            } else {
              await deleteById(row.id);
            }
          }
          loadChainings();
        } finally {
          isLoading.value = false;
        }
      }
    }
  });
}

function handleSelectionChange(val: any) {
  multipleSelection.value = val;
}

function onCopy(row: any) {
  if (row.virtual) {
    copyAutoSaveRecord(row);
    loadData();
    return;
  }
  copyDataRef.value.copy(row);
}

function onCopied() {
  loadData();
}
</script>

<style lang="scss">
.data-source-config-creation-index {
  h4 {
    font-size: 18px;
  }

  .flex {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .table {
    margin-top: 10px;
  }

  .export-import {
    margin-right: 10px;
  }
}
</style>

<template>
  <div class="data-mapper-index-view">
    <div class="card">
      <div class="card-body">
        <div class="flex">
          <div>
            <h4>Data Mappings</h4>
          </div>
          <div>
            <el-button @click="onClickDeleteSelected" :disabled="multipleSelection.length === 0" type="danger">
              Delete Selected
              <font-awesome-icon icon="trash"/>
            </el-button>
            <el-divider direction="vertical"></el-divider>
            <ExportImport class="export-import" type="data-mapper" :dataToExport="multipleSelection">
              <template #alert>
                <el-alert :closable="false" class="message" title="Info" type="success" show-icon>
                <span>
                  To apply transformers from JSON to Blockly field
                  <strong>metadata</strong> must <br/>
                  be <strong>NULL</strong> , <strong>empty string</strong> <br/>
                  OR select option
                  <strong>"Do you want overwrite blockly?"</strong>
                </span>
                </el-alert>
              </template>
              <template v-slot:parameters="{ formParameters }">
                <el-form class="data-mapper-export-import-parameters" ref="form" label-width="220px">
                  <el-form-item label="Do you want overwrite blockly?">
                    <el-switch v-model="formParameters.isGenerateBlockly"></el-switch>
                  </el-form-item>
                </el-form>
              </template>
            </ExportImport>
            <el-button @click="onAddNewConfiguration" type="primary">
              Create Data Mapping
              <font-awesome-icon icon="plus"/>
            </el-button>
          </div>
        </div>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-input placeholder="Filter" v-model="form.filter"></el-input>
          </el-col>
          <el-col :span="12">
            <!--            <AIGenerate v-if="isChatBotEnabled" type="dataMapper"/>-->
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
          <el-table-column type="expand">
            <template #default="{ row }">
              <el-table :data="row.entityMappings[0].columns" style="width: 100%">
                <el-table-column prop="srcColumnPath" label="Source Column Path" min-width="180"></el-table-column>
                <el-table-column prop="dstCyodaColumnPath" label="Cyoda Column Path" min-width="180">
                  <template #default="{ row }">
                    {{ shortNamePath(row.dstCyodaColumnPath) }}
                  </template>
                </el-table-column>
                <el-table-column prop="transformer" min-width="180" label="Transformers">
                  <template #default="{ row }">
                    <div v-for="(transform, index) in getListTransformers(row.transformer.children)" :key="index">
                      {{ index + 1 }}) {{ transform }}
                    </div>
                  </template>
                </el-table-column>
              </el-table>
            </template>
          </el-table-column>
          <el-table-column sortable prop="name" label="Name">
            <template #default="{ row }">
              <ViewsHelpersIndexName :row="row"/>
            </template>
          </el-table-column>
          <el-table-column sortable prop="dataType" label="Data Type" min-width="100">
            <template #default="{ row }">
              {{ getDataType(row) }}
            </template>
          </el-table-column>
          <el-table-column sortable prop="description" label="Description"></el-table-column>
          <el-table-column sortable prop="entities" label="Entities">
            <template #default="{ row }">
              {{ row.entities.join(", ") }}
            </template>
          </el-table-column>
          <el-table-column sortable prop="numberOfConfiguredColumns" width="180"
                           label="Number of configured columns"/>
          <el-table-column sortable prop="lastUpdated" width="200" label="Updated at">
            <template #default="{ row }">
              <span v-if="row.id">
                {{ $filters.mktimeToDateTime(row.lastUpdated) }}
              </span>
              <span v-else> - </span>
            </template>
          </el-table-column>
          <el-table-column width="220" label="Actions">
            <template #default="{ row }">
              <CyodaButton size="default" type="warning" :to="getEditLink(row)">
                <font-awesome-icon icon="pencil-alt"/>
              </CyodaButton>
              <el-button size="default" type="danger" @click="onDelete(row)">
                <font-awesome-icon icon="trash"/>
              </el-button>
              <el-button size="default" type="primary" @click="onCopy(row)">
                <font-awesome-icon icon="copy"/>
              </el-button>
            </template>
          </el-table-column>
        </data-tables>
      </div>
    </div>
    <CopyData @copied="onCopied" ref="copyDataRef" type="DataMapper"/>
  </div>
</template>

<script setup lang="ts">
import {ElMessageBox} from "element-plus";
import {useRouter} from "vue-router";

import {ref, reactive, nextTick, computed, onBeforeUnmount, provide, onMounted} from "vue";

import HelperFormat from "../../helpers/HelperFormat";
import ExportImport from "../../components/ExportImport/ExportImport.vue";
import HelperContent from "../../helpers/HelperContent";
import CopyData from "../../components/CopyData/CopyData.vue";

import {useAutoSavingMixin} from "../../mixins/AutoSavingMixin";
import ViewsHelpersIndexName from "../../components/ViewsHelpers/ViewsHelpersIndexName.vue";
import _ from "lodash";
import CyodaButton from "../../components/CyodaButton/CyodaButton.vue";
import {usePlatformMappingStore} from "../../stores/platform-mapping";
import eventBus from "@cyoda/ui-lib/src/plugins/eventBus";
import {useTableSaveStateMixin} from "@cyoda/ui-lib/src/mixins/TableSaveStateMixin";
import AIGenerate from "../../components/AIGenerate/AIGenerate.vue";
import HelperFeatureFlags from "@cyoda/ui-lib/src/helpers/HelperFeatureFlags";
import HelperEntities from "@cyoda/ui-lib/src/helpers/HelperEntities.ts";

const {
  autoDataStorageKey,
  deleteAutoSaveRecordById,
  clearOldAutoSaveRecords,
  autoSaveRecordsForIndex,
  copyAutoSaveRecord
} = useAutoSavingMixin();
// @TODO Mixins: AutoSavingMixin, IndexHistoryPageMixin
const router = useRouter();
const store = usePlatformMappingStore();
const isChatBotEnabled = HelperFeatureFlags.isChatBotEnabled();

const copyDataRef = ref(null);

const isLoading = ref<boolean>(false);
let listConfigs = ref([]);
let multipleSelection = ref([]);
let listAllDataTypes = reactive([]);
const dataTableRef = ref(null);

let form = reactive({
  filter: "",
  currentPage: 1,
  pageSize: 10
});

const {onHeaderDragend} = useTableSaveStateMixin('dataMapperIndexTable', dataTableRef, form);

provide("getSelectedItems", multipleSelection);
provide("selectedItemsType", "dataMappings");

const tableData = computed(() => {
  return listConfigs.value
    .map((el) => {
      return {
        ...el,
        numberOfConfiguredColumns: calculateNumberOfConfiguredColumns(el),
        entities: el.entityMappings.map((entityMapping) => {
          return HelperEntities.getShortNameOfEntity(entityMapping.entityClass);
        })
      };
    })
    .filter((el: any) => {
      const filter = form.filter.toLowerCase();
      return !form.filter || el.name.toLowerCase().indexOf(filter) > -1 || el.dataType.toLowerCase().indexOf(filter) > -1 || el.description.toLowerCase().indexOf(filter) > -1 || el.entities.join("").toLowerCase().indexOf(filter) > -1;
    });
});

function getTestDataMapping() {
  return store.getTestDataMapping();
}

function getListAllDataMappings(value) {
  return store.getListAllDataMappings(value);
}

function deleteById(id) {
  return store.deleteById(id);
}

function getListAllDataTypes() {
  return store.getListAllDataTypes();
}

function onAddNewConfiguration() {
  router.push("/data-mapper/configuration?action=new");
}

async function init() {
  autoDataStorageKey.value = `autoSave:${import.meta.env.VITE_APP_UI_VERSION}:dataMapperList`;
  clearOldAutoSaveRecords();

  await nextTick();

  await loadData();
  await loadListAllDataTypes();
}

init();
eventBus.$on("closedImportExport:data-mapper", loadData);

onBeforeUnmount(() => {
  eventBus.$off("closedImportExport:data-mapper", loadData);
});

async function loadData() {
  try {
    isLoading.value = true;
    let {data} = await getListAllDataMappings(false);
    data = _.orderBy(data, "lastUpdated", "desc");
    listConfigs.value = [...autoSaveRecordsForIndex.value, ...data];
  } finally {
    isLoading.value = false;
  }
}

async function loadListAllDataTypes() {
  const {data} = await getListAllDataTypes();
  listAllDataTypes = HelperContent.transformEnumToOption(data);
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

function shortNamePath(name: string) {
  return HelperFormat.shortNamePath(name);
}

function getListTransformers(child: any[]) {
  const data: any[] = [];
  child.forEach((el, index) => {
    if (index == 0) {
      data.push(`SourceObjectValueTransformer -> ${el.transformerKey.split("$").pop()}`);
    }
    const current = el;
    const next = child[index + 1];
    if (current && next) {
      data.push(`${current.transformerKey.split("$").pop()} -> ${next.transformerKey.split("$").pop()}`);
    }
  });
  return data;
}

function getEditLink(row: any) {
  if (row.virtual) {
    return `/data-mapper/configuration/${row.virtual.id}?virtual=true`;
  }
  return `/data-mapper/configuration/${row.id}`;
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
          await loadData();
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

function getDataType(row: any) {
  const usedVal: any = listAllDataTypes.find((el) => el.value == row.dataType);
  if (usedVal) {
    return usedVal.label;
  }
  return row.dataType;
}

function onCopy(row: any) {
  const data = listConfigs.value.find((el) => el.id === row.id);
  if (data.virtual) {
    copyAutoSaveRecord(data);
    loadData();
    return;
  }
  copyDataRef.value.copy(data);
}

function onCopied() {
  loadData();
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
          loadData();
        } finally {
          isLoading.value = false;
        }
      }
    }
  });
}
</script>

<style lang="scss">
.data-mapper-index-view {
  .message {
    margin-bottom: 10px;
  }

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

  .data-mapper-export-import-parameters .el-form-item {
    margin-bottom: 0;
  }
}
</style>

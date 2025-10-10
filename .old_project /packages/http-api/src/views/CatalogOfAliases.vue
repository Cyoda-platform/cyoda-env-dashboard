<template>
  <div v-loading="tableLoading" class="config-editor-reports">
    <div class="flex-buttons">
      <el-button @click="onModalCreateNew" type="warning">
        <font-awesome-icon icon="plus"/>
        Create New
      </el-button>
      <ExportImport :dataToExport="dataToExport" type="alias"/>
    </div>

    <CatalogOfAliasesFilter v-model="filterForm" :entityOptions="entityOptions" :usersOptions="usersOptions"
                            :stateOptions="stateOptions"/>
    <el-divider/>

    <el-table :default-sort="defaultSort" class="ab-style" border ref="tableReportRef" :data="tableData"
              size="small" @selection-change="handleSelectionChange" style="width: 100%">
      <el-table-column type="selection"></el-table-column>
      <el-table-column sortable :width="widthColumnName" prop="name" label="Name"></el-table-column>
      <el-table-column sortable prop="description" label="Description"></el-table-column>
      <el-table-column sortable width="150" prop="entity" label="Entity"></el-table-column>
      <el-table-column sortable prop="user" label="User"></el-table-column>
      <el-table-column sortable prop="state" label="State"></el-table-column>
      <el-table-column sortable prop="createdTimestamp" width="150" label="Created">
        <template v-slot:default="scope">
          {{ scope.row.createdHuman }}
        </template>
      </el-table-column>
      <el-table-column fixed="right" width="120" label="Action">
        <template v-slot:default="scope">
          <el-button size="default" type="warning" @click="onEdit(scope.row)">
            <font-awesome-icon icon="pencil-alt"/>
          </el-button>
          <el-button size="default" @click="onDelete(scope.row)" type="danger">
            <font-awesome-icon icon="trash"/>
          </el-button>
        </template>
      </el-table-column>
    </el-table>
    <div class="form-multiple-selection" v-if="multipleSelection.length > 0">
      <FormMultipleSelection :isLoading="multipleSelectionLoading" :listActions="listActions"
                             :multipleSelection="multipleSelection" @action="onFormMultipleSelectionAction"/>
    </div>
    <CyodaModellingPopUpAliasNew @change="onChangeModellingPopUpAlias" @update="onUpdateModellingPopUpAlias"
                                 :aliasEdit="aliasEdit" :allowSelectEntity="true" ref="cyodaModellingPopUpAliasNewRef"/>
    <CatalogOfAliasesChangeState @updated="onUpdatedAliasState" ref="catalogOfAliasesChangeStateRef"/>
  </div>
</template>

<script setup lang="ts">
import {ref, computed, onBeforeUnmount} from "vue";

import * as api from "@cyoda/ui-lib/src/api";
import CatalogOfAliasesFilter from "../components/CatalogOfAliasesFilter/CatalogOfAliasesFilter.vue";
import moment from "moment";
import _ from "lodash";
import CyodaModellingPopUpAliasNew
  from "./ConfigEditor/tabs/CyodaModelling/CyodaModellingAlias/CyodaModellingPopUpAliasNew.vue";
import HelperReportDefinition from "../helpers/HelperReportDefinition";
import type {CatalogItem} from "@cyoda/ui-lib/src/types/types";
import CatalogOfAliasesChangeState from "../components/CatalogOfAliasesChangeState/CatalogOfAliasesChangeState.vue";
import ExportImport from "@cyoda/ui-lib/src/components-library/elements/ExportImport/ExportImport.vue";
import FormMultipleSelection from "../components/FormMultipleSelection/FormMultipleSelection.vue";
import {ElTable, ElMessageBox} from "element-plus";
import eventBus from "@cyoda/ui-lib/src/plugins/eventBus";
import HelperEntities from "@cyoda/ui-lib/src/helpers/HelperEntities.ts";

interface TableDataRow {
  id: string;
  name: string;
  description: string;
  entity: string;
  user: string;
  state: string;
  created: string;
  createdHuman: string;
  createdTimestamp: string;
  source: CatalogItem;
}

const tableData = computed(() => {
  let tableData = aliases.value.map((el) => {
    return {
      id: el.id,
      name: el.name,
      description: el.desc,
      entity: HelperEntities.getShortNameOfEntity(el.entityClass),
      user: el.user,
      state: el.state,
      created: el.createDate || "",
      createdHuman: el.createDate ? moment(el.createDate).format("DD-MM-YYYY HH:mm") : "",
      createdTimestamp: el.createDate ? moment(el.createDate).format("X") : "",
      source: el
    };
  });

  tableData = HelperReportDefinition.applyFiltersForReportTables(tableData, filterForm.value);

  return tableData;
});
const dataToExport = computed(() => {
  return multipleSelection.value.map((el) => el.source);
});
const usersOptions = computed(() => {
  let users = aliases.value.map((el) => {
    return {
      value: el.user,
      label: el.user
    };
  });
  return _.uniqBy(users, "value");
});
const entityOptions = computed(() => {
  let aliasesValues = aliases.value.map((el) => {
    const entity = HelperEntities.getShortNameOfEntity(el.entityClass);
    return {
      value: entity,
      label: entity
    };
  });
  return _.uniqBy(aliasesValues, "value");
});
const stateOptions = computed(() => {
  let states = aliases.value.map((el) => {
    return {
      value: el.state,
      label: el.state
    };
  });
  return _.uniqBy(states, "value");
});
const widthColumnName = computed(() => {
  const sizes = tableData.value.map((el) => {
    let canvas = document.createElement("canvas");
    let context = canvas.getContext("2d")!;
    context.font = '12px "Open Sans"';
    return context.measureText(el.name).width;
  });
  let maxSize = _.max(sizes)! + 40;
  if (maxSize > 300) {
    maxSize = 300;
  }
  return maxSize;
});

const cyodaModellingPopUpAliasNewRef = ref(null);

const catalogOfAliasesChangeStateRef = ref(null);

const tableReportRef = ref(null);

const filterForm = ref({});

let aliases = ref([]);
let multipleSelection = ref([]);
const tableLoading = ref<boolean>(false);
let aliasEdit = ref({});
let defaultSort = ref({
  prop: "createdTimestamp",
  order: "descending"
});

let listActions = ref([
  {
    label: "Delete",
    value: "delete"
  }
]);

const multipleSelectionLoading = ref<boolean>(false);

loadCatalog();
eventBus.$on("closedImportExport:alias", loadCatalog);

onBeforeUnmount(() => {
  eventBus.$off("closedImportExport:alias", loadCatalog);
});

async function loadCatalog() {
  try {
    tableLoading.value = true;
    const {data} = await api.getAllCatalogItems();
    aliases.value = data;
  } finally {
    tableLoading.value = false;
  }
}

function handleSelectionChange(val: TableDataRow[]) {
  multipleSelection.value = val;
}

function onModalCreateNew() {
  aliasEdit.value = {} as CatalogItem;
  cyodaModellingPopUpAliasNewRef.value.active = 0;
  cyodaModellingPopUpAliasNewRef.value.dialogVisible = true;
  cyodaModellingPopUpAliasNewRef.value.resetForm();
}

async function onChangeModellingPopUpAlias(alias: CatalogItem) {
  try {
    tableLoading.value = true;
    await api.postCatalogItem(alias);
    loadCatalog();
  } finally {
    tableLoading.value = false;
  }
}

async function onUpdateModellingPopUpAlias(alias: CatalogItem) {
  tableLoading.value = true;
  try {
    await api.putCatalogItem(alias, aliasEdit.value.id);
    await loadCatalog();
  } finally {
    tableLoading.value = false;
  }
}

function onDelete(item: TableDataRow) {
  ElMessageBox.confirm("Do you really want to remove?", "Confirm!", {
    callback: async (action) => {
      tableLoading.value = true;
      try {
        if (action === "confirm") {
          await api.deleteCatalogItems(item.id);
          await loadCatalog();
        }
      } finally {
        tableLoading.value = false;
      }
    }
  });
}

function onEdit(value: TableDataRow) {
  cyodaModellingPopUpAliasNewRef.value.dialogVisible = true;
  cyodaModellingPopUpAliasNewRef.value.active = 0;
  cyodaModellingPopUpAliasNewRef.value.resetForm();
  aliasEdit.value = JSON.parse(JSON.stringify(value.source));
}

function onChangeState(value: TableDataRow) {
  catalogOfAliasesChangeStateRef.value.dialogVisible = true;
  catalogOfAliasesChangeStateRef.value.id = value.id;
}

function onUpdatedAliasState() {
  loadCatalog();
}

function onFormMultipleSelectionAction(actionMultipleSelection: string) {
  if (actionMultipleSelection === "delete") {
    ElMessageBox.confirm(`Do you really want to remove ${multipleSelection.value.length} records?`, "Confirm!", {
      callback: async (action) => {
        if (action === "confirm") {
          multipleSelectionLoading.value = true;
          await Promise.all(
            multipleSelection.value.map((el) => {
              return api.deleteCatalogItems(el.id || "");
            })
          );
          await loadCatalog();
          tableReportRef.value.clearSelection();
          multipleSelectionLoading.value = false;
        }
      }
    });
  }
}
</script>

<style lang="scss" scoped>
.form-multiple-selection {
  margin-top: 15px;
}
</style>

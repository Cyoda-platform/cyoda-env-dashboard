<template>
  <el-dialog :close-on-click-modal="false" append-to-body title="Catalog af Aliases" v-model="dialogVisible" width="90%">
    <div class="wrapper-actions">
      <el-button :disabled="!requestClass" @click="onOpenDialog" type="primary">
        Add New Alias
        <font-awesome-icon icon="plus" />
      </el-button>
    </div>

    <CyodaModellingPopUpAliasTable v-loading="loadingTable" :tableData="tableData">
      <template v-slot:actions-buttons="scope">
        <el-button :disabled="scope.row.isDisableSelect" size="default" type="primary" @click="onSelect(scope.row)">
          <font-awesome-icon icon="hand-pointer" />
        </el-button>
        <el-button size="default" type="warning" @click="onEdit(scope.row)">
          <font-awesome-icon icon="pencil-alt" />
        </el-button>
        <el-button size="default" type="danger" @click="onRemove(scope.row.item)">
          <font-awesome-icon icon="trash" />
        </el-button>
      </template>
      <template v-slot:multiple-selection="scope">
        <FormMultipleSelection :isLoading="multipleSelectionLoading" :listActions="listActions" :multipleSelection="scope.multipleSelection" @action="onAction($event, scope.multipleSelection, scope.table)" />
      </template>
    </CyodaModellingPopUpAliasTable>

    <CyodaModellingPopUpAliasNew @update="onUpdateModellingPopUpAlias" @change="onChangeModellingPopUpAlias" :aliasEdit="aliasEdit" ref="cyodaModellingPopUpAliasNewRef" :configDefinition="configDefinition" />
  </el-dialog>
</template>

<script setup lang="ts">
import { ElMessageBox } from "element-plus";
import { ref, computed, watch } from "vue";

import type { CatalogItem, IDefinitionContent } from "@cyoda/ui-lib/src/types/types";
import CyodaModellingPopUpAliasNew from "./CyodaModellingPopUpAliasNew.vue";
import * as api from "@cyoda/ui-lib/src/api";
import CyodaModellingPopUpAliasTable from "./CyodaModellingPopUpAliasTable.vue";
import FormMultipleSelection from "../../../../../components/FormMultipleSelection/FormMultipleSelection.vue";
import type { CyodaModellingPopUpAliasTableDataRow } from "../CyodaModellingTypes";

const emit = defineEmits(["delete", "change", "change", "close"]);
const props = defineProps({
  requestClass: {
    default: ""
  },
  configDefinition: {
    default: () => {
      return {};
    }
  }
});
const tableData = computed(() => {
  return catalogOfAliases.value.map((item) => {
    return {
      item,
      isDisableSelect: !!props.configDefinition.aliasDefs.find((selectedAlias) => selectedAlias.name === item.aliasDef.name),
      name: item.aliasDef.name,
      paths: item.aliasDef.aliasPaths.value.map((aliasPath) => {
        return {
          path: aliasPath.colDef.fullPath,
          mapperClass: (aliasPath.mapperClass && aliasPath.mapperClass.split(".").pop()) || "",
          mapperParameters: (aliasPath && aliasPath.mapperParameters) || undefined
        };
      })
    };
  });
});

const dialogVisible = ref<boolean>(false);
const cyodaModellingPopUpAliasNewRef = ref(null);

let listActions = ref([
  {
    label: "Add",
    value: "add"
  },
  {
    label: "Delete",
    value: "delete"
  }
]);

let aliasEdit = ref({});
let catalogOfAliases = ref([]);
const loadingTable = ref<boolean>(false);
const multipleSelectionLoading = ref<boolean>(false);

function onOpenDialog() {
  aliasEdit.value = {} as CatalogItem;
  cyodaModellingPopUpAliasNewRef.value.active = 0;
  cyodaModellingPopUpAliasNewRef.value.dialogVisible = true;
  cyodaModellingPopUpAliasNewRef.value.resetForm();
  cyodaModellingPopUpAliasNewRef.value.alias.entityClass = props.requestClass;
}

async function onChangeModellingPopUpAlias(alias: CatalogItem) {
  try {
    loadingTable.value = true;
    await api.postCatalogItem(alias);
    loadCatalog();
  } finally {
    loadingTable.value = false;
  }
}

async function loadCatalog() {
  loadingTable.value = true;
  try {
    const { data } = await api.getCatalogItems(props.requestClass);
    catalogOfAliases.value = data;
  } finally {
    loadingTable.value = false;
  }
}

function onRemove(item: CatalogItem) {
  ElMessageBox.confirm("Do you really want to remove?", "Confirm!", {
    callback: async (action) => {
      loadingTable.value = true;
      try {
        if (action === "confirm") {
          const id = item.id || "";
          await api.deleteCatalogItems(id);
          await loadCatalog();
          emit("delete", item.name);
        }
      } finally {
        loadingTable.value = false;
      }
    }
  });
}

function onEdit(value: CyodaModellingPopUpAliasTableDataRow) {
  cyodaModellingPopUpAliasNewRef.value.dialogVisible = true;
  cyodaModellingPopUpAliasNewRef.value.active = 0;
  cyodaModellingPopUpAliasNewRef.value.alias.entityClass = props.requestClass;
  aliasEdit.value = JSON.parse(JSON.stringify(value.item));
}

function onSelect(value: CyodaModellingPopUpAliasTableDataRow) {
  emit("change", JSON.parse(JSON.stringify(value.item.aliasDef)));
  dialogVisible.value = false;
}

function onAction(actionMultipleSelection: string, multipleSelection: CyodaModellingPopUpAliasTableDataRow[], table: ElTable) {
  if (actionMultipleSelection === "delete") {
    ElMessageBox.confirm(`Do you really want to remove ${multipleSelection.length} records?`, "Confirm!", {
      callback: async (action) => {
        if (action === "confirm") {
          multipleSelectionLoading.value = true;
          await Promise.all(
            multipleSelection.map((el) => {
              return api.deleteCatalogItems(el.item.id || "");
            })
          );
          await loadCatalog();
          table.clearSelection();
          multipleSelectionLoading.value = false;
        }
      }
    });
  }

  if (actionMultipleSelection === "add") {
    multipleSelection.forEach((el) => {
      emit("change", JSON.parse(JSON.stringify(el.item.aliasDef)));
    });
    dialogVisible.value = false;
  }
}

async function onUpdateModellingPopUpAlias(alias: CatalogItem) {
  loadingTable.value = true;
  try {
    await api.putCatalogItem(alias, aliasEdit.value.id || "");
    await loadCatalog();
  } finally {
    loadingTable.value = false;
  }
}

watch(
  () => props.requestClass,
  (val: string) => {
    if (val) {
      loadCatalog();
    }
  },
  { immediate: true }
);

watch(dialogVisible, (val: boolean) => {
  if (!val) {
    emit("close");
  }
});

defineExpose({ dialogVisible });
</script>

<style scoped lang="scss">
.wrapper-actions {
  margin-bottom: 20px;
}
</style>

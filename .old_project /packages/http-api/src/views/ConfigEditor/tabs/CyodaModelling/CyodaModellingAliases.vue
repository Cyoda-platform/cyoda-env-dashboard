<template>
  <div>
    <el-button :disabled="!configDefinition.requestClass || readOnly" @click="onOpenDialog" type="primary"> Catalogue of
      Aliases
    </el-button>

    <h2>Selected Aliases:</h2>
    <CyodaModellingPopUpAliasTable :tableData="tableData">
      <template v-slot:actions-buttons="scope">
        <el-button :disabled="readOnly" type="primary" @click="onEdit(scope.row.alias, scope.$index)">Edit</el-button>
        <el-button :disabled="readOnly" type="danger" @click="onRemove(scope.$index)">Remove</el-button>
      </template>
      <template v-slot:multiple-selection="scope">
        <FormMultipleSelection :multipleSelection="scope.multipleSelection"
                               @action="onAction($event, scope.multipleSelection, scope.table)"/>
      </template>
    </CyodaModellingPopUpAliasTable>

    <CyodaModellingPopUpAlias @change="onChangeModellingPopUpAlias" @delete="onDeleteModellingPopUpAlias"
                              ref="cyodaModellingPopUpAliasRef" :configDefinition="configDefinition"
                              :requestClass="configDefinition.requestClass"/>

    <CyodaModellingPopUpAliasNew :configDefinition="configDefinition" :aliasEdit="aliasEdit" :allowConfigFile="false"
                                 aliasEditType="report" @update="onUpdateModellingPopUpAlias"
                                 ref="cyodaModellingPopUpAliasNewRef" :requestClass="configDefinition.requestClass"/>
  </div>
</template>

<script setup lang="ts">
import {ref, computed} from "vue";

import type {AliasDef, CatalogItem} from "@cyoda/ui-lib/src/types/types";
import CyodaModellingPopUpAlias from "./CyodaModellingAlias/CyodaModellingPopUpAlias.vue";
import CyodaModellingPopUpAliasNew from "./CyodaModellingAlias/CyodaModellingPopUpAliasNew.vue";
import CyodaModellingPopUpAliasTable from "./CyodaModellingAlias/CyodaModellingPopUpAliasTable.vue";
import FormMultipleSelection from "../../../../components/FormMultipleSelection/FormMultipleSelection.vue";
import {ElMessageBox, ElTable} from "element-plus";
import type {CyodaModellingAliasesTableDataRow} from "./CyodaModellingTypes";
import HelperReportDefinition from "../../../../helpers/HelperReportDefinition";

interface AliasEdit {
  entityClass: string;
  name: string;
  desc: string;
  aliasDef: string;
}

const props = defineProps({
  configDefinition: {
    default: () => {
      return {};
    }
  },
  readOnly: {default: false}
});
const tableData = computed(() => {
  return props.configDefinition.aliasDefs.map((el) => {
    return {
      name: el.name,
      alias: el,
      paths: el.aliasPaths.value.map((aliasPath) => {
        return {
          path: aliasPath.colDef.fullPath,
          mapperClass: aliasPath.mapperClass.split(".").pop()!,
          mapperParameters: (aliasPath && aliasPath.mapperParameters) || undefined
        };
      })
    };
  });
});

const cyodaModellingPopUpAliasNewRef = ref(null);

const cyodaModellingPopUpAliasRef = ref(null);

let aliasEdit = ref({});
const aliasEditIndexReplace = ref(0);

function onRemove(index: number) {
  ElMessageBox.confirm("Do you really want to remove?", "Confirm!", {
    callback: async (action) => {
      if (action === "confirm") {
        const aliasDef = props.configDefinition.aliasDefs[index];
        HelperReportDefinition.deletePathFromFields(props.configDefinition, aliasDef.name);
        props.configDefinition.aliasDefs.splice(index, 1);
      }
    }
  });
}

function onAction(actionMultipleSelection: string, multipleSelection: CyodaModellingAliasesTableDataRow[], table: ElTable) {
  if (actionMultipleSelection === "delete") {
    ElMessageBox.confirm(`Do you really want to remove ${multipleSelection.length} records?`, "Confirm!", {
      callback: async (action) => {
        if (action === "confirm") {
          multipleSelection.forEach((el) => {
            const index = tableData.value.indexOf(el);
            props.configDefinition.aliasDefs.splice(index, 1);
          });
          table.clearSelection();
        }
      }
    });
  }
}

function onEdit(value: AliasDef) {
  aliasEditIndexReplace.value = props.configDefinition.aliasDefs.indexOf(value);
  aliasEdit.value = {
    entityClass: value.aliasPaths.value[0].colDef.parts.value[0].rootClass,
    name: value.name,
    desc: "",
    aliasDef: JSON.parse(JSON.stringify(value))
  };
  cyodaModellingPopUpAliasNewRef.value.dialogVisible = true;
  cyodaModellingPopUpAliasNewRef.value.active = 0;
}

function onOpenDialog() {
  cyodaModellingPopUpAliasRef.value.dialogVisible = true;
}

function onChangeModellingPopUpAlias(alias: AliasDef) {
  const exist = props.configDefinition.aliasDefs.find((el) => el.name === alias.name);
  if (!exist) {
    props.configDefinition.aliasDefs.push(alias);
  }
}

function onDeleteModellingPopUpAlias(name) {
  props.configDefinition.aliasDefs = props.configDefinition.aliasDefs.filter((el) => el.name !== name);
}

function onUpdateModellingPopUpAlias(alias: CatalogItem) {
  const oldName=props.configDefinition.aliasDefs[aliasEditIndexReplace.value].name;
  props.configDefinition.aliasDefs[aliasEditIndexReplace.value] = alias.aliasDef;
  HelperReportDefinition.updateAliasToNewName(props.configDefinition, oldName, alias.aliasDef.name)
}
</script>

<style lang="scss" scoped>
h2 {
  margin-top: 20px;
  margin-bottom: 10px;
}

ul {
  list-style: none;
  margin: 0;
  padding: 0;

  li {
    margin-bottom: 5px;
  }
}
</style>

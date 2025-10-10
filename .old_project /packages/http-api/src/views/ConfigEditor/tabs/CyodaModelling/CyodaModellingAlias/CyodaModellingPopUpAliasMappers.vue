<template>
  <div class="cyoda-modelling-pop-up-alias-mappers">
    <h2>Selected: {{ aliasDef.aliasPaths.value.length }}</h2>
    <el-table :data="tableData" style="width: 100%">
      <el-table-column prop="data.colDef.fullPath" label="Path"> </el-table-column>
      <el-table-column label="Mapper" width="250">
        <template v-slot:default="props">
          <el-select v-if="Object.keys(allMappers).length > 0" @change="onChangeMapper(props.row)" filterable v-model="props.row.data.mapperClass" placeholder="Select">
            <el-option v-for="item in getMapperForCurrentEl(props.row.data.colDef.colType)" :key="item.label" :label="item.label" :value="item.value"> </el-option>
          </el-select>
        </template>
      </el-table-column>
      <el-table-column label="Parameters" width="250">
        <template v-slot:default="props">
          <div v-if="props.row.parametrized">
            <div v-if="props.row.data.mapperParameters && props.row.data.mapperParameters.parameters && Object.keys(props.row.data.mapperParameters.parameters).length > 0">
              <div v-for="name in Object.keys(props.row.data.mapperParameters.parameters)">
                <el-link @click="onClickMapperParameters(props.row, name)" type="primary">
                  {{ name }}
                </el-link>
                <font-awesome-icon @click="onRemoveMapperParameter(props.row, name)" class="icon-trash-remove" icon="trash" />
              </div>
            </div>
          </div>
          <div v-else>
            <span class="not-possible">Not possible</span>
          </div>
        </template>
      </el-table-column>
      <el-table-column label="Action" width="180">
        <template v-slot:default="props">
          <el-tooltip class="item" effect="dark" content="Remove row" placement="top">
            <el-button size="default" type="danger" @click="onRemove(props.$index)">
              <font-awesome-icon icon="trash" />
            </el-button>
          </el-tooltip>

          <el-tooltip v-if="props.row.parametrized" class="item" effect="dark" content="Add parameter" placement="top">
            <el-button @click="onAddNewParameters(props.row)" size="default" type="primary">
              <font-awesome-icon icon="plus" />
            </el-button>
          </el-tooltip>
        </template>
      </el-table-column>
    </el-table>
    <CyodaModellingPopUpAliasMappersParameters @add="onAddMappersParameters" @update="onUpdateMappersParameters" ref="cyodaModellingPopUpAliasMappersParametersRef" />
  </div>
</template>

<script setup lang="ts">
import { ElMessageBox } from "element-plus";
import { ref, computed } from "vue";

import * as api from "@cyoda/ui-lib/src/api";
import CyodaModellingPopUpAliasMappersParameters from "./CyodaModellingPopUpAliasMappersParameters.vue";
import type { AliasDef, NamedParameter, ReportMapper } from "@cyoda/ui-lib/src/types/types";

interface SelectedMappersParametersRow {
  data: {
    mapperParameters: {
      parameters: NamedParameter;
    };
  };
}

const props = defineProps({
  aliasDef: {
    default() {
      return {};
    }
  }
});
const tableData = computed(() => {
  if (Object.keys(props.aliasDef).length > 0) {
    return props.aliasDef.aliasPaths.value.map((el) => {
      const mapper = allMappers.value.find((elMap) => elMap.mapperClass === el.mapperClass);
      return {
        data: el,
        parametrized: (mapper && mapper.parametrized) || false
      };
    });
  } else {
    return [];
  }
});

const cyodaModellingPopUpAliasMappersParametersRef = ref(null);

let allMappersByTypes: { [key: string]: ReportMapper[] } = ref({});
let allMappers = ref([]);
let selectedMappersParametersRow = ref({});

(async function () {
  loadMappersByTypes();
  loadMappers();
})();

async function loadMappersByTypes() {
  if (Object.keys(props.aliasDef).length > 0) {
    const allData = await Promise.all(
      props.aliasDef.aliasPaths.value.map((el) => {
        return api.getMappers({ inClass: el.colDef.colType });
      })
    );
    props.aliasDef.aliasPaths.value.forEach((el, index) => {
      allMappersByTypes[getKeyForType(el.colDef.colType)] = allData[index].data;
    });
  }
}

async function loadMappers() {
  const { data } = await api.getMappers();
  allMappers.value = data;
}

function onAddNewParameters(row: SelectedMappersParametersRow) {
  if (!("mapperParameters" in row.data)) {
    $set(row.data, "mapperParameters", {
      "@bean": "com.cyoda.core.reports.aliasmappers.SimpleTypeParameters",
      parameters: {}
    });
  }
  selectedMappersParametersRow.value = row;
  cyodaModellingPopUpAliasMappersParametersRef.value.mapperParameterEdit = {} as NamedParameter;
  cyodaModellingPopUpAliasMappersParametersRef.value.dialogVisible = true;
}

function onClickMapperParameters(row: SelectedMappersParametersRow, name: string) {
  selectedMappersParametersRow.value = row;
  cyodaModellingPopUpAliasMappersParametersRef.value.dialogVisible = true;
  cyodaModellingPopUpAliasMappersParametersRef.value.mapperParameterEdit = JSON.parse(JSON.stringify(row.data.mapperParameters.parameters[name]));
  cyodaModellingPopUpAliasMappersParametersRef.value.mapperParameterEdit.oldName = name;
}

function onRemoveMapperParameter(row: SelectedMappersParametersRow, name: string) {
  ElMessageBox.confirm("Do you really want to remove?", "Confirm!", {
    callback: async (action) => {
      if (action === "confirm") {
        delete row.data.mapperParameters.parameters[name];
      }
    }
  });
}

function onRemove(index: number) {
  ElMessageBox.confirm("Do you really want to remove?", "Confirm!", {
    callback: async (action) => {
      if (action === "confirm") {
        props.aliasDef.aliasPaths.value.splice(index, 1);
      }
    }
  });
}

function onAddMappersParameters(val: NamedParameter) {
  selectedMappersParametersRow.value.data.mapperParameters.parameters[val.name] = val;
}

function onChangeMapper(row: SelectedMappersParametersRow) {
  if (row.data.mapperParameters && row.data.mapperParameters.parameters) {
    row.data.mapperParameters["parameters"] = {};
  }
}

function onUpdateMappersParameters(val: NamedParameter) {
  let parameters = selectedMappersParametersRow.value.data.mapperParameters.parameters;
  let str = JSON.stringify(parameters);
  const regexStr = `"${val.oldName}":`;
  const re = new RegExp(regexStr);

  str = str.replace(re, `"${val.name}":`);
  const obj = JSON.parse(str);
  delete val.oldName;
  obj[val.name] = val;
  selectedMappersParametersRow.value.data.mapperParameters["parameters"] = obj;
}

function getKeyForType(str: string) {
  return str.replace(/\./g, "_");
}

function getMapperForCurrentEl(type: string) {
  if (!allMappersByTypes[getKeyForType(type)]) return [];

  return allMappersByTypes[getKeyForType(type)].map((el) => {
    return {
      value: el.mapperClass,
      label: el.shortName
    };
  });
}
</script>

<style lang="scss">
.cyoda-modelling-pop-up-alias-mappers {
  .icon-trash-remove {
    color: #dedede;
    font-size: 14px;
    margin-left: 5px;
    cursor: pointer;
    vertical-align: middle;

    &:hover {
      color: #b8b8b8;
    }
  }

  .not-possible {
    color: #b8b8b8;
  }
}
</style>

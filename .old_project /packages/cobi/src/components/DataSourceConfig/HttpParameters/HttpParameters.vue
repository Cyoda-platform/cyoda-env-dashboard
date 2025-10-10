<template>
  <div class="http-parameters">
    <div class="endpoint-actions">
      <el-button v-if="!isDisabledTest" @click="onRunTest" type="warning">
        Test
        <font-awesome-icon icon="microscope"/>
      </el-button>
      <el-button @click="addNewParameter" type="primary">
        Add New Parameter
        <font-awesome-icon icon="plus"/>
      </el-button>
    </div>

    <CyodaDataTablesDraggable :animate="300" handle=".handle">
      <el-table :data="parameters" stripe style="width: 100%">
        <el-table-column v-if="parameters.length > 1" label="" align="center" width="50">
          <template>
            <font-awesome-icon class="handle" icon="align-justify"/>
          </template>
        </el-table-column>
        <el-table-column prop="name" label="Name"></el-table-column>
        <el-table-column prop="type" label="Type">
          <template v-slot:default="{ row }">
            {{ getParameterName(row.type) }}
          </template>
        </el-table-column>
        <el-table-column prop="required" label="Required">
          <template v-slot:default="{ row }">
            {{ row.required ? "Yes" : "No" }}
          </template>
        </el-table-column>
        <el-table-column prop="defaultValue" label="Default Value"></el-table-column>
        <el-table-column v-if="isExistTemplatesColumn" prop="templateValue" label="Template Value"></el-table-column>
        <el-table-column label="Actions">
          <template v-slot:default="{ row }">
            <el-button @click="onEditParameter(row)" size="default" type="primary">
              <font-awesome-icon icon="pencil-alt"></font-awesome-icon>
            </el-button>
            <el-button @click="onDeleteParameter(row)" size="default" type="danger">
              <font-awesome-icon icon="trash"></font-awesome-icon>
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </CyodaDataTablesDraggable>

    <el-form-item class="check-parameters" :rules="[{ validator: checkParameters }]" prop="parameters"></el-form-item>

    <DialogEndpointParametersHttp ref="dialogEndpointParametersRef" :parameters="parameters"
                                  :placeholders="placeholders"/>
    <DialogEndpointTest ref="dialogEndpointTestRef" :httpEndpointDto="httpEndpointDto" :placeholders="placeholders"/>
  </div>
</template>

<script setup lang="ts">
import {ref, computed} from "vue";

import HelperContent from "../../../helpers/HelperContent";
import type {HttpParameterDto} from "../DataSourceConfig";
import DialogEndpointParametersHttp
  from "../../../components/DataSourceConfig/DialogEndpointParameters/DialogEndpointParametersHttp.vue";
import DialogEndpointTest from "../DialogEndpointTest/DialogEndpointTest.vue";
import HelperDataSourceConfig from "../../../helpers/HelperDataSourceConfig";
import CyodaDataTablesDraggable
  from "@cyoda/ui-lib/src/components-library/elements/CyodaDataTables/CyodaDataTablesDraggable.vue";
import {ElMessageBox} from "element-plus";

const props = defineProps({
  query: {default: ""},
  bodyTemplate: {default: ""},
  isDisabledTest: {default: true},
  httpEndpointDto: {
    default: () => {
      return {};
    }
  },
  parameters: {
    default: function () {
      return [];
    }
  }
});
const placeholders = computed(() => {
  const placeholdersForQuery = HelperContent.getPlaceholdersFromString(props.query).map((el) => {
    return {
      type: "PATH_VARIABLE",
      label: el
    };
  });
  const placeholdersForBodyTemplate = HelperContent.getPlaceholdersFromString(props.bodyTemplate).map((el) => {
    return {
      type: "REQUEST_BODY_VARIABLE",
      label: el
    };
  });
  return [...placeholdersForQuery, ...placeholdersForBodyTemplate];
});
const isExistTemplatesColumn = computed(() => {
  return props.parameters.some((el) => el.templateValue);
});

const dialogEndpointTestRef = ref(null);

const dialogEndpointParametersRef = ref(null);

function addNewParameter() {
  dialogEndpointParametersRef.value.openDialogAndCreateNew();
}

function onRunTest() {
  dialogEndpointTestRef.value.dialogVisible = true;
}

function onEditParameter(row: HttpParameterDto) {
  dialogEndpointParametersRef.value.openDialogAndEditRecord(row);
}

function onDeleteParameter(row: HttpParameterDto) {
  ElMessageBox.confirm("Do you really want to remove parameter?", "Confirm!", {
    callback: async (action) => {
      if (action === "confirm") {
        const index = props.parameters.indexOf(row);
        if (index !== -1) {
          props.parameters.splice(index, 1);
        }
      }
    }
  });
}

function checkParameters(rule: any, value: any, callback: any) {
  const placeholdersQuery = HelperContent.getPlaceholdersFromString(props.query);
  const placeholdersBodyTemplate = HelperContent.getPlaceholdersFromString(props.bodyTemplate);

  const parametersPathVariables = props.parameters.filter((el) => el.type == "PATH_VARIABLE").map((el) => el.name.toLowerCase());
  const parametersBodyTemplatesVariables = props.parameters.filter((el) => el.type == "REQUEST_BODY_VARIABLE").map((el) => el.name.toLowerCase());

  const notFoundQuery = getNotUsedPlaceholders(parametersPathVariables, placeholdersQuery);
  const notFoundBodyTemplatesVariables = getNotUsedPlaceholders(parametersBodyTemplatesVariables, placeholdersBodyTemplate);

  if (notFoundQuery.length > 0) {
    return callback(new Error(`Please add 'Path Variable' to parameters for placeholders: ${notFoundQuery.join(", ")}`));
  }

  if (notFoundBodyTemplatesVariables.length > 0) {
    return callback(new Error(`Please add 'Request Body Variable' parameters for placeholders: ${notFoundBodyTemplatesVariables.join(", ")}`));
  }

  callback();
}

function getNotUsedPlaceholders(parameters: string[], placeholders: string[]) {
  let notFound: string[] = [];
  const parametersTmp = parameters.map((el) => el.toString().toLowerCase());
  const placeholdersTmp = placeholders.map((el) => el.toString().toLowerCase());
  if (placeholders.length > 0) {
    placeholdersTmp.forEach((placeholder, index) => {
      if (parametersTmp.indexOf(placeholder) == -1) {
        notFound.push(placeholders[index]);
      }
    });
  }
  return notFound;
}

function getParameterName(val: string) {
  return HelperDataSourceConfig.getNameFromEndpointParameterTypeOptions(val);
}
</script>

<style lang="scss">
.http-parameters {
  .endpoint-actions {
    margin-bottom: 10px;
    text-align: right;
  }
}
</style>

<template>
  <div class="http-parameters">
    <div class="endpoint-actions">
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
        <el-table-column prop="required" label="Required">
          <template v-slot:default="{ row }">
            {{ row.required ? "Yes" : "No" }}
          </template>
        </el-table-column>
        <el-table-column prop="defaultValue" label="Default Value"></el-table-column>
        <el-table-column v-if="isExistTemplatesColumn" prop="templateValue" label="Template Value"></el-table-column>
        <el-table-column label="Actions">
          <template v-slot="{ row }">
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

    <DialogEndpointParametersBlobStorage ref="dialogEndpointParametersBlobStorageRef" :parameters="parameters"/>
  </div>
</template>

<script setup lang="ts">
import {ref, computed} from "vue";

import type {BlobStorageParameterDto} from "../DataSourceConfig";
import DialogEndpointParametersBlobStorage
  from "../../../components/DataSourceConfig/DialogEndpointParameters/DialogEndpointParametersBlobStorage.vue";
import CyodaDataTablesDraggable
  from "@cyoda/ui-lib/src/components-library/elements/CyodaDataTables/CyodaDataTablesDraggable.vue";
import {ElMessageBox} from "element-plus";

const props = defineProps({
  parameters: {
    default: function () {
      return [];
    }
  }
});
const isExistTemplatesColumn = computed(() => {
  return props.parameters.some((el) => el.templateValue);
});

const dialogEndpointParametersBlobStorageRef = ref(null);

function addNewParameter() {
  dialogEndpointParametersBlobStorageRef.value.openDialogAndCreateNew();
}

function onEditParameter(row: BlobStorageParameterDto) {
  dialogEndpointParametersBlobStorageRef.value.openDialogAndEditRecord(row);
}

function onDeleteParameter(row: BlobStorageParameterDto) {
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
</script>

<style lang="scss">
.http-parameters {
  .endpoint-actions {
    margin-bottom: 10px;
    text-align: right;
  }
}
</style>

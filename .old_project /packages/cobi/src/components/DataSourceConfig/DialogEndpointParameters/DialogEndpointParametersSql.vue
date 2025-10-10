<template>
  <div class="dialog-endpoint-parameters">
    <el-dialog append-to-body :close-on-click-modal="false" title="Endpoint Parameters" v-model="dialogVisible" width="90%">
      <el-form :model="sqlParameterDto" :rules="rules" ref="formRef" label-width="180px">
        <el-form-item label="Secure">
          <el-switch v-model="sqlParameterDto.secure" />
        </el-form-item>

        <el-form-item label="Is Array">
          <el-switch v-model="sqlParameterDto.isArray" />
        </el-form-item>

        <el-form-item label="Name" prop="name">
          <el-autocomplete placeholder="Name" clearable value-key="label" :fetch-suggestions="suggestionsForName" v-model="sqlParameterDto.name">
            <template v-slot:default="{ item }">{{ item.label }}</template>
          </el-autocomplete>
        </el-form-item>

        <el-form-item label="Sql Type" prop="sqlType">
          <el-select filterable clearable v-model="sqlParameterDto.sqlType" placeholder="Select">
            <el-option v-for="item in sqlTypeOptions" :key="item.value" :label="item.label" :value="item.value"> </el-option>
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
      <span class="dialog-footer">
        <el-button @click="dialogVisible = false">Close</el-button>
        <template v-if="sqlParameterDtoBefore">
          <el-button type="success" @click="onEdit">Edit</el-button>
        </template>
        <template v-else>
          <el-button type="primary" @click="onSave">Apply</el-button>
        </template>
      </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, nextTick, watch } from "vue";

import  type { SqlParameterDto } from "../DataSourceConfig";
import HelperDataSourceConfig from "../../../helpers/HelperDataSourceConfig";

const props = defineProps({
  endpointDto: {
    default: () => {
      return {};
    }
  },
  placeholders: {
    default: () => {
      return [];
    }
  }
});

const formRef = ref(null);

const dialogVisible = ref<boolean>(false);

let rules = ref({
  name: [{ required: true, message: "Please input name", trigger: "change" }]
});
//

//
let sqlParameterDto = ref({
  name: "",

  defaultValue: "",
  secure: false,

  sqlType: null,
  isArray: false
});
//

//

const sqlParameterDtoBefore = ref(null);

let sqlTypeOptions = ref(HelperDataSourceConfig.endpointParameterSqlTypeOptions);

function openDialogAndCreateNew() {
  dialogVisible.value = true;

  sqlParameterDtoBefore.value = null;
  sqlParameterDto.value = JSON.parse(JSON.stringify(sqlParameterDtoDefault.value));
}

function openDialogAndEditRecord(data: SqlParameterDto) {
  dialogVisible.value = true;
  sqlParameterDtoBefore.value = data;
  sqlParameterDto.value = JSON.parse(JSON.stringify(data));
}

let sqlParameterDtoDefault = ref(JSON.parse(JSON.stringify(sqlParameterDto.value)));

function onSave() {
  formRef.value.validate((valid) => {
    if (valid) {
      props.endpointDto.parameters.push(sqlParameterDto.value);
      dialogVisible.value = false;
    }
  });
}

function onEdit() {
  formRef.value.validate((valid) => {
    if (valid) {
      const index = props.endpointDto.parameters.indexOf(sqlParameterDtoBefore.value);
      if (index > -1) {
        props.endpointDto.parameters[index] = sqlParameterDto.value;

        dialogVisible.value = false;
      }
    }
  });
}

function suggestionsForName(queryString: string, cb: any) {
  let results: any[] = [];
  if (queryString) {
    results = props.placeholders.filter((el) => el.label.toLowerCase().indexOf(queryString.toLowerCase()));
  } else {
    results = props.placeholders;
  }
  cb(results);
}

watch(
  dialogVisible,
  async (val: boolean) => {
    if (val) {
      await nextTick();

      formRef.value.clearValidate();
    }
  }
);

//

defineExpose({ dialogVisible, openDialogAndCreateNew, openDialogAndEditRecord });
</script>

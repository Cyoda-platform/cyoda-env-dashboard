<template>
  <div class="dialog-endpoint-parameters">
    <el-dialog append-to-body :close-on-click-modal="false" title="Endpoint Parameters" v-model="dialogVisible" width="90%">
      <el-form :model="httpParameterDto" :rules="rules" ref="formRef" label-width="180px">
        <el-form-item label="Required" prop="required">
          <el-switch v-model="httpParameterDto.required" />
        </el-form-item>

        <el-form-item label="Secure" prop="secure">
          <el-switch v-model="httpParameterDto.secure" />
        </el-form-item>

        <el-form-item label="Exclude From Cache Key" prop="excludeFromCacheKey">
          <el-switch :disabled="httpParameterDto.secure" v-model="httpParameterDto.excludeFromCacheKey"/>
        </el-form-item>

        <el-form-item label="Template" prop="template">
          <el-switch v-model="httpParameterDto.template" />
        </el-form-item>

        <el-form-item label="Name" prop="name">
          <el-autocomplete placeholder="Name" @select="onChangeName" clearable value-key="label" :fetch-suggestions="suggestionsForName" v-model="httpParameterDto.name">
            <template v-slot:default="{ item }">{{ item.label }}</template>
          </el-autocomplete>
        </el-form-item>

        <el-form-item label="Type" prop="type">
          <el-select filterable clearable v-model="httpParameterDto.type" placeholder="Select">
            <el-option v-for="item in typeOptions" :key="item.value" :label="item.label" :value="item.value"></el-option>
          </el-select>
        </el-form-item>

        <el-form-item :rules="[{ required: !httpParameterDto.required, message: 'Please select Default Value', trigger: 'change' }]" label="Default Value" prop="defaultValue">
          <el-input v-model="httpParameterDto.defaultValue" />
        </el-form-item>

        <template v-if="httpParameterDto.optionValues && httpParameterDto.optionValues.length > 0">
          <el-form-item>
            <el-radio-group v-model="httpParameterDto.defaultValue">
              <el-radio-button v-for="(value, index) in httpParameterDto.optionValues" :key="index" :label="value"></el-radio-button>
            </el-radio-group>
          </el-form-item>
        </template>

        <el-form-item v-if="httpParameterDto.template" :rules="[{ required: httpParameterDto.template, message: 'Please input Template Value', trigger: 'blur' }]" label="Template Value" prop="templateValue">
          <el-input v-model="httpParameterDto.templateValue" />
        </el-form-item>
      </el-form>
      <template #footer>
      <span class="dialog-footer">
        <el-button @click="dialogVisible = false">Close</el-button>
        <template v-if="httpParameterDtoBefore">
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

import type { HttpParameterDto } from "../DataSourceConfig";
import HelperDataSourceConfig from "../../../helpers/HelperDataSourceConfig";

const props = defineProps({
  parameters: {
    default: function () {
      return [];
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

const displaySelectValue = ref<string>("");

let rules = ref({
  name: [{ required: true, message: "Please input name", trigger: "change" }],
  type: [{ required: true, message: "Please select type", trigger: "change" }]
});

let typeOptions = ref(HelperDataSourceConfig.endpointParameterTypeOptions);

let httpParameterDto = ref({
  type: "",
  name: "",
  required: false,
  defaultValue: "",
  secure: false,
  excludeFromCacheKey: false,
  template: false,
  templateValue: "",
  optionValues: []
});

let httpParameterDtoDefault = ref(JSON.parse(JSON.stringify(httpParameterDto.value)));

const httpParameterDtoBefore = ref(null);

function openDialogAndCreateNew() {
  dialogVisible.value = true;

  httpParameterDtoBefore.value = null;
  httpParameterDto.value = JSON.parse(JSON.stringify(httpParameterDtoDefault.value));
}

function openDialogAndEditRecord(data: HttpParameterDto) {
  dialogVisible.value = true;
  httpParameterDtoBefore.value = data;
  httpParameterDto.value = JSON.parse(JSON.stringify(data));
}

function onSave() {
  formRef.value.validate((valid) => {
    if (valid) {
      props.parameters.push(httpParameterDto.value);
      dialogVisible.value = false;
    }
  });
}

function onEdit() {
  formRef.value.validate((valid) => {
    if (valid) {
      const index = props.parameters.indexOf(httpParameterDtoBefore.value);
      if (index > -1) {
        props.parameters[index] = httpParameterDto.value;

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

function onChangeName(val: any) {
  httpParameterDto.value.type = val.type;
}

function addNewSelectValue() {
  httpParameterDto.value.optionValues.push("");
}

function removeNewSelectValue(index: number) {
  httpParameterDto.value.optionValues.splice(index, 1);
}

watch(
  dialogVisible,
  async (val: boolean) => {
    if (val) {
      await nextTick();
      await nextTick();

      formRef.value.clearValidate();
    }
  }
);

watch(
  () => httpParameterDto.value.template,
  (val: boolean) => {
    if (!val) {
      httpParameterDto.value.templateValue = "";
    }
  }
);

watch(
  () => httpParameterDto.value.secure,
  (val: boolean) => {
    if (val) {
      httpParameterDto.value.excludeFromCacheKey = false;
    }
  }
);

defineExpose({ dialogVisible, openDialogAndCreateNew, openDialogAndEditRecord });
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
.action-display-select-values {
  margin-bottom: 10px;
}

.display-select-row {
  margin-bottom: 10px;
}
</style>

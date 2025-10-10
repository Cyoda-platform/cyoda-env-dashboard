<template>
  <div class="dialog-endpoint-parameters">
    <el-dialog append-to-body :close-on-click-modal="false" title="Endpoint Parameters" v-model="dialogVisible" width="90%">
      <el-form :model="blobStorageParameterDto" :rules="rules" ref="formRef" label-width="180px">
        <el-form-item label="Required" prop="required">
          <el-switch v-model="blobStorageParameterDto.required" />
        </el-form-item>

        <el-form-item label="Secure" prop="required">
          <el-switch v-model="blobStorageParameterDto.secure" />
        </el-form-item>

        <el-form-item label="Template" prop="required">
          <el-switch v-model="blobStorageParameterDto.template" />
        </el-form-item>

        <el-form-item label="Name" prop="name">
          <el-input v-model="blobStorageParameterDto.name" />
        </el-form-item>

        <el-form-item :rules="[{ required: !blobStorageParameterDto.required, message: 'Please select Default Value', trigger: 'change' }]" label="Default Value" prop="defaultValue">
          <el-input v-model="blobStorageParameterDto.defaultValue" />
        </el-form-item>

        <el-form-item v-if="blobStorageParameterDto.template" :rules="[{ required: blobStorageParameterDto.template, message: 'Please input Template Value', trigger: 'blur' }]" label="Template Value" prop="templateValue">
          <el-input v-model="blobStorageParameterDto.templateValue" />
        </el-form-item>
      </el-form>
      <template #footer>
      <span class="dialog-footer">
        <el-button @click="dialogVisible = false">Close</el-button>
        <template v-if="blobStorageParameterDtoBefore">
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

import type { BlobStorageParameterDto } from "../DataSourceConfig";

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

let rules = ref({
  name: [{ required: true, message: "Please input name", trigger: "change" }]
});

let blobStorageParameterDto = ref({
  name: "",
  required: false,
  defaultValue: "",
  secure: false,
  template: false,
  templateValue: ""
});

let blobStorageParameterDtoDefault = ref(JSON.parse(JSON.stringify(blobStorageParameterDto.value)));

const blobStorageParameterDtoBefore = ref(null);

function openDialogAndCreateNew() {
  dialogVisible.value = true;

  blobStorageParameterDtoBefore.value = null;
  blobStorageParameterDto.value = JSON.parse(JSON.stringify(blobStorageParameterDtoDefault.value));
}

function openDialogAndEditRecord(data: BlobStorageParameterDto) {
  dialogVisible.value = true;
  blobStorageParameterDtoBefore.value = data;
  blobStorageParameterDto.value = JSON.parse(JSON.stringify(data));
}

function onSave() {
  formRef.value.validate((valid) => {
    if (valid) {
      props.parameters.push(blobStorageParameterDto.value);
      dialogVisible.value = false;
    }
  });
}

function onEdit() {
  formRef.value.validate((valid) => {
    if (valid) {
      const index = props.parameters.indexOf(blobStorageParameterDtoBefore.value);
      if (index > -1) {
        props.parameters[index] = blobStorageParameterDto.value;

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

watch(
  () => blobStorageParameterDto.value.template,
  (val: boolean) => {
    if (!val) {
      blobStorageParameterDto.value.templateValue = "";
    }
  }
);

defineExpose({ dialogVisible, openDialogAndCreateNew, openDialogAndEditRecord });
</script>

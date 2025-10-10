<template>
  <el-dialog :close-on-click-modal="false" append-to-body title="Mapper Parameter" v-model="dialogVisible" width="700px" class="cyodaModellingPopUpAliasMappersParameters">
    <el-form :rules="rules" :model="form" ref="elFormRef" :inline="true" label-position="top" label-width="120px">
      <el-form-item prop="name" label="Name">
        <el-input v-model="form.name"></el-input>
      </el-form-item>
      <el-form-item prop="parameterType" label="Parameter Type">
        <el-select v-model="form.parameterType" placeholder="Select">
          <el-option v-for="item in options" :key="item.value" :label="item.label" :value="item.value"> </el-option>
        </el-select>
      </el-form-item>
      <el-form-item prop="value" label="Value">
        <el-input v-model="form.value"></el-input>
      </el-form-item>
    </el-form>
    <template #footer>
      <span class="dialog-footer">
      <el-button @click="dialogVisible = false">Cancel</el-button>
      <el-button @click="onUpdate" v-if="Object.keys(mapperParameterEdit).length > 0" type="primary">Update</el-button>
      <el-button @click="onAdd" v-if="Object.keys(mapperParameterEdit).length === 0" type="primary">Add</el-button>
    </span>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, nextTick, computed, watch } from "vue";

import type { NamedParameter } from "@cyoda/ui-lib/src/types/types";
import { ElForm } from "element-plus";

const emit = defineEmits(["add", "update"]);
const options = computed(() => {
  return types.value.map((el) => {
    return {
      label: el.split(".").pop(),
      value: el
    };
  });
});

let mapperParameterEdit = ref({});
const dialogVisible = ref<boolean>(false);
const elFormRef = ref(null);

let rules = ref({
  name: [{ required: true, message: "Please input name", trigger: "blur" }],
  value: [{ required: true, message: "Please input value", trigger: "blur" }],
  parameterType: [
    {
      required: true,
      message: "Please select parameter type",
      trigger: "change"
    }
  ]
});

let types = ref(["java.lang.Integer", "java.lang.Double", "java.lang.String"]);

let form = ref({
  "@bean": "com.cyoda.core.namedparameters.NamedParameter",
  name: "",
  value: "",
  parameterType: ""
});

function onAdd() {
  elFormRef.value.validate((valid) => {
    if (valid) {
      emit("add", JSON.parse(JSON.stringify(form.value)));
      dialogVisible.value = false;
    }
  });
}

function onUpdate() {
  elFormRef.value.validate((valid) => {
    if (valid) {
      emit("update", JSON.parse(JSON.stringify(form.value)));
      dialogVisible.value = false;
    }
  });
}

watch(mapperParameterEdit, (val: NamedParameter) => {
  if (Object.keys(val).length > 0) {
    form.value = JSON.parse(JSON.stringify(val));
  }
});

watch(dialogVisible, async (val: boolean) => {
  if (val) {
    await nextTick();

    if (Object.keys(mapperParameterEdit.value).length === 0) {
      elFormRef.value.resetFields();
    }
  }
});

defineExpose({ dialogVisible, mapperParameterEdit });
</script>

<style lang="scss">
.cyodaModellingPopUpAliasMappersParameters {
  .el-dialog__body,
  .el-form-item__label {
    padding-top: 0;
    padding-bottom: 0 !important;
  }
}
</style>

<template>
  <el-dialog :append-to-body="true" :close-on-click-modal="false" title="Add New Element"
             v-model="dialogVisible"
             width="600px">
    <el-form :model="form" ref="formRef" label-width="auto" :rules="rules">
      <el-form-item prop="key" label="Key">
        <el-input @input="onChangeKey" v-model="form.key" placeholder="Please input"/>
      </el-form-item>
      <el-form-item prop="element" label="Class">
        <el-select v-model="form.element" :disabled="mode==='edit'" value-key="reportClass" placeholder="Select">
          <el-option v-for="item in allRequestParams" :key="item.reportClassShort" :label="item.reportClassShort"
                     :value="item"></el-option>
        </el-select>
      </el-form-item>
    </el-form>
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="dialogVisible = false">Close</el-button>
        <el-button @click="onSave" type="primary">
          {{ mode === 'create' ? 'Add' : 'Edit' }}
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import {ref, watch, nextTick, reactive} from "vue";

import "prismjs/themes/prism.css";

const emit = defineEmits(["save"]);
const mode = ref<'create' | 'edit'>('create');
const props = defineProps({
  allRequestParams: {
    default: () => {
      return [];
    }
  },
  requestParamsComputed: {default: () => []},
});

const dialogVisible = ref<boolean>(false);

let formRef = ref(null);
let form = ref({
  element: null,
  key: null,
});

const rules = reactive({
  key: [
    {required: true, message: 'Please input key', trigger: 'blur'},
  ],
  element: [
    {required: true, message: 'Please select class', trigger: 'change'},
  ],
})

let dataBefore = null;

function onSave() {
  formRef.value.validate(async (valid) => {
    if (!valid) return;
    const elementTmp = JSON.parse(JSON.stringify(form.value.element));
    elementTmp.columnPath = `${elementTmp.baseColumnPath}.[${form.value.key}]@${elementTmp.reportClass.replaceAll('.', '#')}`
    elementTmp.key = form.value.key;
    if (mode.value === 'create') {
      emit("save", elementTmp);
    } else {
      const oldPartColumnName = `${form.value.element.baseColumnPath}.[${dataBefore.key}]`;
      const newPartColumnName = `${form.value.element.baseColumnPath}.[${form.value.key}]`;
      dataBefore.columnPath = form.value.element.columnPath;
      dataBefore.key = form.value.key;
      emit("edit", {oldPartColumnName, newPartColumnName});
    }
    dialogVisible.value = false;
    form.value.element = null;
  })
}

watch(dialogVisible, (value) => {
  if (!value) {
    formRef.value.resetFields();
    return;
  }
  form.value.key = `key${props.requestParamsComputed.length + 1}`;
})

function createNew() {
  dialogVisible.value = true;
  mode.value = 'create';
}

async function editExist(elementData) {
  dialogVisible.value = true;
  await nextTick();
  dataBefore = elementData
  form.value.element = JSON.parse(JSON.stringify(elementData));
  form.value.key = elementData.key;
  mode.value = 'edit';
}

function onChangeKey(value) {
  form.value.key = form.value.key.replaceAll('*', '').replaceAll('.', '').replaceAll('&', '');
}

defineExpose({dialogVisible, createNew, editExist});
</script>

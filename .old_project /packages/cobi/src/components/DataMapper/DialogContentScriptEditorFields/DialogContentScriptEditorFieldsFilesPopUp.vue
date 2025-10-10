<template>
  <el-dialog destroy-on-close class="dialog-content-script-editor-fields-files-pop-up" append-to-body :model="form"
             :close-on-click-modal="false" :title="computedTitle" v-model="dialogVisible" width="80%">
    <el-form :model="form" :rules="rules" ref="formRefRef">
      <div class="row-fields">
        <el-form-item class="name-field" label="Name" prop="scriptName">
          <el-input @input="onChangeScriptName" :disabled="mode === 'edit'" v-model="form.scriptName"></el-input>
          <span class="hint">You can use "." for name of folders. Example: node.subnode.scriptName</span>
        </el-form-item>
        <el-form-item class="version-field" label="Version" prop="scriptVersion">
          <el-input v-model="form.scriptVersion"></el-input>
        </el-form-item>
      </div>
      <template v-if="typeContent === 'editor'">
        <el-form-item label="Content">
          <CyodaEditor :key="dialogVisible" :editable="!isDisabled" v-model="form.script" language="js"
                      style="min-height: 100%"/>
        </el-form-item>
      </template>
      <template v-if="typeContent === 'upload'">
        <DialogContentScriptEditorFieldsUpload ref="dialogContentScriptEditorFieldsUploadRef"/>
      </template>
      <div class="row-flex">
        <div class="toggles">
          <el-button @click="onSetAsActiveForAll" :disabled="isSetForAllDisabled" type="success"> Set as active for
            all
          </el-button>
        </div>
        <div class="actions">
          <template v-if="mode === 'view'">
            <el-button @click="dialogVisible = false">Close</el-button>
          </template>
          <template v-else>
            <el-button @click="dialogVisible = false">Cancel</el-button>
          </template>
          <el-button @click="onClickSave" v-if="!isDisabled" :loading="isLoading" type="primary">Save</el-button>
          <el-button @click="onRenameVersion" v-if="mode === 'view'" :loading="isLoading" type="primary">Rename
          </el-button>
        </div>
      </div>
    </el-form>
  </el-dialog>
</template>

<script setup lang="ts">
import {ElNotification} from "element-plus";
import {ref, nextTick, computed, watch} from "vue";

import CyodaEditor from "@cyoda/ui-lib/src/components-library/elements/CyodaEditor/CyodaEditor.vue";

import DialogContentScriptEditorFieldsUpload from "./DialogContentScriptEditorFieldsUpload.vue";
import eventBus from "@cyoda/ui-lib/src/plugins/eventBus";
import {useScriptsStore} from "../../../stores/scripts";

const scriptsStore = useScriptsStore();
const rules = computed(() => {
  return {
    scriptName: [{required: true, message: "Please fill name field"}],
    scriptVersion: [{required: typeContent.value === "upload", message: "Please fill version field"}],
  };
})
const isDisabled = computed(() => {
  return mode.value === 'view';
})
const computedTitle = computed(() => {
  if (mode.value == 'view') {
    return 'Editor: View';
  }
  return 'Editor: Add'
})
const isSetForAllDisabled = computed(() => {
  return mode.value !== 'view' && usageCount.value === 0;
})

function putVersion(form) {
  return scriptsStore.putVersion(form);
}

function setActiveForAll(id) {
  return scriptsStore.setActiveForAll(id);
}

function renameVersion(form) {
  return scriptsStore.renameVersion(form);
}

function putImport(form) {
  return scriptsStore.putImport(form);
}

const dialogContentScriptEditorFieldsUploadRef = ref(null);

const formRefRef = ref(null);


const isLoading = ref<boolean>(false);
const usageCount = ref(0);
let scriptData = ref({});

const dialogVisible = ref<boolean>(false);
const mode = ref<string>("edit");
const typeContent = ref<string>("editor");
const emit = defineEmits(['created', 'renameVersion', 'updated']);


let defaultForm = ref({
  id: null,
  scriptName: '',
  scriptVersion: '',
  script: '',
});

let form = ref(JSON.parse(JSON.stringify(defaultForm.value)));

function onClickSave() {
  formRefRef.value.validate(async (valid) => {
    if (valid) {
      try {
        isLoading.value = true;
        if (typeContent.value == "editor") {
          await putVersion(form.value);
        } else if (typeContent.value == "upload") {
          // @ts-ignore
          form.value.script = await dialogContentScriptEditorFieldsUploadRef.value.getContent();
          await putImport(form.value);
        }
        dialogVisible.value = false;
        emit('created');
      } finally {
        isLoading.value = false;
      }
    }
  })
}

async function onRenameVersion() {
  try {
    isLoading.value = true;
    await renameVersion(form.value);
    dialogVisible.value = false;
    emit('renameVersion');
  } finally {
    isLoading.value = false;
  }
}

async function onSetAsActiveForAll() {
  await setActiveForAll(scriptData.value.version.id);
  ElNotification({
    title: 'Success',
    message: "The operation 'Set as active for all' has been successfully completed",
    type: 'success'
  })
  emit('updated');
  eventBus.$emit('scripts:check-box', scriptData.value.version.id);
}

function resetForm() {
  form.value = JSON.parse(JSON.stringify(defaultForm.value));
  usageCount.value = 0;
  scriptData.value = {};
  typeContent.value = "editor";
}


// Actions
function createAction(params) {
  dialogVisible.value = true;
  typeContent.value = params.typeContent || 'editor';
  mode.value = 'create';
}

function viewAction(data) {
  dialogVisible.value = true;
  mode.value = 'view';
  scriptData.value = data;
  nextTick(() => {
    usageCount.value = data.version.usageCount;
    form.value = {
      id: data.version.id,
      scriptName: data.script.name,
      scriptVersion: data.version.scriptVersion,
      script: data.contentScriptData.script,
      isDefault: false,
    }
  })
}

function copyAction(data) {
  dialogVisible.value = true;
  mode.value = 'copy';
  nextTick(() => {
    form.value = {
      id: null,
      scriptName: `${data.script.name} copy`,
      scriptVersion: data.version.scriptVersion,
      script: data.contentScriptData.script,
      isDefault: false,
    }
  })
}

function editAction(data) {
  dialogVisible.value = true;
  mode.value = 'edit';
  nextTick(() => {
    form.value = {
      id: data.script.id,
      scriptName: `${data.script.name}`,
      scriptVersion: null,
      script: data.contentScriptData.script,
      isDefault: true,
    }
  })
}

function onChangeScriptName() {
  form.value.scriptName = form.value.scriptName.replaceAll('/', '-');
}


watch(dialogVisible, async (val) => {

  if (val) {
    nextTick(() => {
      formRefRef.value.clearValidate();
    })
  } else {
    resetForm();
  }
});


defineExpose({dialogVisible, form, createAction, viewAction, copyAction, editAction});
</script>

<style>
.dialog-content-script-editor-fields-files-pop-up {
  .row-flex {
    display: flex;
    white-space: nowrap;

    .toggles {
      display: flex;
    }

    .set-as-default {
      width: 145px;
    }

    .el-form-item {
      margin-right: 30px;
      margin-bottom: 0;
    }

    .actions {
      margin-left: auto;
    }
  }

  .editor {
    border: 1px solid #dcdfe6;
  }

  .row-fields {
    display: flex;
    white-space: nowrap;

    .el-form-item__label {
      float: none;
      display: flex;
    }

    .el-form-item__content {
      display: inline-block;
      vertical-align: top;
      flex-grow: 1;
    }

    .el-form-item {
      display: flex;
      white-space: nowrap;
      margin-right: 30px;
      width: 50%;
    }
  }
}
</style>

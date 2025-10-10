<template>
  <el-dialog :close-on-click-modal="false" :title="title" v-model="dialogVisible" width="80%">
    <el-steps align-center :active="active" finish-status="success">
      <el-step title="Step 1" description="Please Enter Name and Description" />
      <el-step title="Step 2" description="Please Select Class" />
    </el-steps>

    <el-form class="config-editor-new-form" ref="formConfigEditorRef" :rules="rules" :model="form" label-width="180px">
      <div v-if="active == 0">
        <el-form-item label="Name" prop="name">
          <el-input @input="onChangeForm" v-model="form.name"></el-input>
        </el-form-item>
        <el-form-item v-if="hideFields.description" prop="description" label="Description">
          <el-input rows="4" type="textarea" v-model="form.description"></el-input>
        </el-form-item>
      </div>

      <div v-if="active == 1">
        <el-form-item label="Entity Class">
          <el-select v-model="form.requestClass" filterable placeholder="Entity Class">
            <el-option v-for="item in requestClassOptions" :key="item.value" :label="item.label" :value="item.value"></el-option>
          </el-select>
        </el-form-item>
      </div>
    </el-form>

    <template #footer>
      <span class="dialog-footer">
        <el-button :disabled="active === 0" @click="onPrev">Previous step</el-button>
        <el-button :disabled="active === 1" @click="onNext">Next step</el-button>
        <el-button @click="dialogVisible = false">Cancel</el-button>
        <el-button :loading="loading" :disabled="!form.requestClass" type="primary" @click="onConfirm">Confirm</el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, nextTick, watch, computed } from "vue";

import * as api from "@cyoda/ui-lib/src/api";
import { ElNotification } from "element-plus";
import HelperEntities from "@cyoda/ui-lib/src/helpers/HelperEntities.ts";
import HelperStorage from "@cyoda/ui-lib/src/helpers/HelperStorage.ts";
import { useGlobalUiSettingsStore } from "@cyoda/ui-lib/src/stores/globalUiSettings";

const ENTITY_TYPE_KEY = "ConfigEditorNew:entityType";
const helperStorage = new HelperStorage();
const emit = defineEmits(["create"]);
const props = defineProps({
  hideFields: {
    default: () => {
      return {
        name: true,
        description: true,
        requestClass: true
      };
    }
  },
  title: {
    default: ""
  }
});

const dialogVisible = ref<boolean>(false);
const loading = ref<boolean>(false);
const active = ref(0);

const formConfigEditorRef = ref(null);

let form = ref({
  name: "",
  description: "",
  requestClass: ""
});

let defaultForm = ref(JSON.parse(JSON.stringify(form.value)));

const globalUiSettings = useGlobalUiSettingsStore();

const entityType = computed(() => {
  return globalUiSettings.entityType;
});

let rules = ref({
  name: [{ required: true, message: "Please input Name", trigger: "blur" }],
  description: [{ required: true, message: "Please input Description", trigger: "blur" }]
});

const entityData = ref([]);

(async function () {
  const { data } = await api.getReportingFetchTypes(true);
  entityData.value = data;
})();

const requestClassOptions = computed(() => {
  return HelperEntities.getOptionsFromData(entityData.value, entityType.value);
});

function onPrev() {
  active.value -= 1;
}

async function onNext() {
  if (active.value === 0) {
    formConfigEditorRef.value.validateField(["name", "description"], (valid) => {
      if (valid) {
        active.value += 1;
      }
      if (active.value > 1) {
        active.value = 1;
      }
    });
  }
}

async function onConfirm() {
  if (!form.value.requestClass) {
    ElNotification({ type: "error", title: "Error", message: "Please select class" });
    return false;
  }
  emit("create", JSON.parse(JSON.stringify(form.value)));
  dialogVisible.value = false;
}

function onChangeForm() {
  form.value.name = form.value.name.replaceAll("/", "-");
}

watch(dialogVisible, async (val: boolean) => {
  if (val) {
    await nextTick();

    form.value = JSON.parse(JSON.stringify(defaultForm.value));
  }
});

watch(entityType, (val: string) => {
  helperStorage.set(ENTITY_TYPE_KEY, val);
});

defineExpose({ dialogVisible, loading, active });
</script>

<style lang="scss">
.config-editor-new-form {
  margin-top: 15px;

  .el-select {
    width: 100%;
  }
}
</style>

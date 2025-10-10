<template>
  <el-dialog :close-on-click-modal="false" append-to-body title="Settings" v-model="dialogVisible" width="800px">
    <template #header>
    <div>
      <h4 class="dialog-title">Meta Data</h4>
      <div class="dialog-title-info">
        <div><strong>Destination Path:</strong> {{ shortNamePath(dstCyodaColumnPath) }}<br /></div>
        <div><strong>Final Type:</strong> {{ dstCyodaColumnPathType.split(".").pop().toLowerCase() }}</div>
      </div>
    </div>
    </template>

    <el-alert class="error-alerts" v-if="allErrorMessages.length > 0" title="Errors" type="error" :closable="false" show-icon>
      <div>
        <ol>
          <li v-for="(allErrorMessage, index) in allErrorMessages" :key="index">{{ allErrorMessage }}</li>
        </ol>
      </div>
    </el-alert>

    <el-form ref="formRef" :rules="rules" label-position="top" :model="meta" label-width="120px">
      <el-form-item label="Parameter Name" prop="name">
        <el-input v-model="meta.name"></el-input>
      </el-form-item>
      <el-form-item label="Default Value" prop="defaultValue">
        <el-input v-model="meta.defaultValue"></el-input>
      </el-form-item>
      <Transformers :column="meta" :addFirst="true" ref="transformers" :transformer="meta.transformer" />
    </el-form>
    <template #footer>
    <span class="dialog-footer">
      <el-button @click="dialogVisible = false">Close</el-button>
      <el-button v-if="isEdit" @click="onDelete" type="danger">Delete</el-button>
      <el-button :type="isEdit ? 'primary' : 'success'" @click="onClickSave">{{ isEdit ? "Edit" : "Apply" }}</el-button>
    </span>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ElNotification, ElMessageBox } from "element-plus";
import { usePlatformMappingStore } from "../../../stores/platform-mapping";
import { ref, computed, watch } from "vue";

import Transformers from "../Transformers/Transformers.vue";
import HelperFormat from "../../../helpers/HelperFormat";

import HelperContent from "../../../helpers/HelperContent";

const props = defineProps({
  dstCyodaColumnPath: {
    default: ""
  },
  dstCyodaColumnPathType: {
    default: ""
  },
  selectedEntityMapping: {
    default: () => {
      return {};
    }
  },
  entityClass: {
    default: ""
  }
});
const platformMappingStore = usePlatformMappingStore();
const sourceDataComputed = computed(() => {
  return platformMappingStore.sourceDataComputed;
});
const listAllTransformers = computed(() => {
  return platformMappingStore.listAllTransformers;
});
const dataType = computed(() => {
  return platformMappingStore.dataType;
});
const currentMeta = computed(() => {
  return props.selectedEntityMapping.metadata.find((el) => el.dstCyodaColumnPath === props.dstCyodaColumnPath);
});
const isEdit = computed(() => {
  return !!currentMeta.value;
});
const allErrorMessages = ref([]);

const formRef = ref(null);

const activeForm = ref(null);

let rules = ref({
  name: [{ required: true, message: "Please fill Parameter Name", trigger: "blur" }]
});

let meta = ref({
  name: "",
  dstCyodaColumnPath: "",
  dstCyodaColumnPathType: "",
  defaultValue: "",
  transformer: {
    children: [],
    type: "COMPOSITE"
  }
});

let metaDefault = ref(JSON.parse(JSON.stringify(meta.value)));

const showErrorLastTransform = ref<boolean>(false);

const dialogVisible = ref<boolean>(false);

async function onClickSave() {
  showErrorLastTransform.value = false;
  formRef.value.validate((valid, invalidFields) => {
    allErrorMessages.value = HelperContent.getAllErrorMessagesFromForm(invalidFields);
    if (valid) {
      if (isEdit.value) {
        const index = props.selectedEntityMapping.metadata.indexOf(currentMeta.value);

        props.selectedEntityMapping.metadata[index] = meta.value;
      } else {
        props.selectedEntityMapping.metadata.push(meta.value);
      }
      dialogVisible.value = false;
    } else {
      activeForm.value = formRef.value;
      ElNotification({ type: "error", title: "Error", message: "Form have errors. Please check form." });
    }
  });
}

function resetForm() {
  activeForm.value = null;
  meta.value = JSON.parse(JSON.stringify(metaDefault.value));

  meta.value.dstCyodaColumnPathType = props.dstCyodaColumnPathType;
  meta.value.dstCyodaColumnPath = props.dstCyodaColumnPath;
}

function onDelete() {
  ElMessageBox.confirm("Do you really want to remove metadata?", "Confirm!", {
    callback: async (action) => {
      if (action === "confirm") {
        const index = props.selectedEntityMapping.metadata.indexOf(currentMeta.value);
        if (index !== -1) {
          props.selectedEntityMapping.metadata.splice(index, 1);
        }
        dialogVisible.value = false;
      }
    }
  });
}

watch(
  dialogVisible,
  (val: boolean) => {
    if (val) {
      resetForm();
      if (isEdit.value) {
        meta.value = JSON.parse(JSON.stringify(currentMeta.value));
      }
    }
  }
);

function shortNamePath(name: string) {
  return HelperFormat.shortNamePath(name);
}

defineExpose({ dialogVisible, rules });
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
.dialog-title {
  margin-top: 0;
  margin-bottom: 10px;
}

.dialog-title-info {
  overflow-wrap: break-word;

  div {
    margin-bottom: 5px;
  }
}

h3 {
  margin: 40px 0 0;
}

ol {
  padding-left: 15px;
}
</style>

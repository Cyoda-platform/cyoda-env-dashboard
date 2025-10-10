<template>
  <el-dialog :close-on-click-modal="false" append-to-body title="Settings" v-model="dialogVisible" width="800px">
    <el-alert class="error-alerts" v-if="allErrorMessages.length > 0" title="Errors" type="error" :closable="false" show-icon>
      <div>
        <ol>
          <li v-for="(allErrorMessage, index) in allErrorMessages" :key="index">{{ allErrorMessage }}</li>
        </ol>
      </div>
    </el-alert>

    <el-form ref="formRef" label-position="top" :model="{ transformer }" label-width="120px">
      <Transformers :column="column" :transformer="transformer" />
    </el-form>
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="dialogVisible = false">Close</el-button>
        <el-button :disabled="isDisabledSaveBtn" type="primary" @click="onClickSave">OK</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ElNotification } from "element-plus";
import { usePlatformMappingStore } from "../../../stores/platform-mapping";
import { ref, computed, watch } from "vue";

import Transformers from "../Transformers/Transformers.vue";

import HelperContent from "../../../helpers/HelperContent";
import ColumnMappingSettings from "../../../components/DataMapper/ColumnMappingSettings/ColumnMappingSettings.vue";
// import CyodaDialog from "../../../extends/elementui/dialog/main.vue";

const props = defineProps({
  column: {
    default: () => {
      return {
        transformer: {
          type: "COMPOSITE",
          children: []
        }
      };
    }
  },
  entityClass: {
    default: ""
  }
});
const platformMappingStore = usePlatformMappingStore();
const listAllTransformers = computed(() => {
  return platformMappingStore.listAllTransformers;
});
const dataType = computed(() => {
  return platformMappingStore.dataType;
});
const isEdit = computed(() => {
  return props.column.transformer && props.column.transformer.children && props.column.transformer.children.length > 0;
});
const isDisabledSaveBtn = computed(() => {
  return false;
});

const allErrorMessages = ref([]);

const formRef = ref(null);

const checkLastTransformRef = ref(null);

const activeForm = ref(null);

let transformer = ref({
  type: "COMPOSITE",
  children: []
});

const showErrorLastTransform = ref<boolean>(false);

const dialogVisible = ref<boolean>(false);

async function onClickSave() {
  showErrorLastTransform.value = false;
  formRef.value.validate((valid, invalidFields) => {
    allErrorMessages.value = HelperContent.getAllErrorMessagesFromForm(invalidFields);
    if (valid) {
      props.column.transformer = JSON.parse(JSON.stringify(transformer.value));
      resetForm();
      dialogVisible.value = false;
    } else {
      activeForm.value = formRef.value;
      ElNotification({ type: "error", title: "Error", message: "Form have errors. Please check form." });
    }
  });
}

function resetForm() {
  transformer.value.children = [];
}

watch(
  dialogVisible,
  (val: boolean) => {
    if (val) {
      if (isEdit.value) {
        transformer.value.children = JSON.parse(JSON.stringify(props.column.transformer.children));
      }
    }
  }
);

defineExpose({ dialogVisible });
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

<template>
  <el-dialog :close-on-click-modal="false" class="report-ui-settings-pop-up" title="Settings" v-model="dialogVisible" width="600px">
    <el-form ref="form" label-position="top" :model="form" label-width="120px">
      <el-form-item label="Id Field">
        <el-select @change="onChange" clearable v-model="form.idField" placeholder="Select">
          <el-option v-for="item in idFieldList" :key="item.value" :label="item.label" :value="item.value"> </el-option>
        </el-select>
      </el-form-item>
    </el-form>
    <template #footer>
      <span class="dialog-footer">
      <el-button @click="dialogVisible = false">Close</el-button>
    </span>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, watch } from "vue";
import {useReportsStore} from "../../stores/reports";

const props = defineProps({
  configDefinition: {
    default: () => {
      return {};
    }
  },
  storedSettings: {
    default: () => {
      return {};
    }
  },
  idFieldList: {
    default: () => {
      return {};
    }
  },
  reportDefinitionId: {
    default: ""
  }
});
const reportsStore = useReportsStore();
function setReportsSettings(value) {
  return reportsStore.setReportsSettings(value);
}

const dialogVisible = ref<boolean>(false);

let form = ref({
  idField: ""
});

function onChange() {
  setReportsSettings({
    id: props.reportDefinitionId,
    settings: JSON.parse(JSON.stringify(form.value))
  });
}

watch(dialogVisible, (val) => {
  if (val && props.storedSettings && props.storedSettings.settings) {
    form.value = JSON.parse(JSON.stringify(props.storedSettings.settings));
  }
});

defineExpose({ dialogVisible });
</script>

<style lang="scss">
.report-ui-settings-pop-up {
  .el-dialog__body {
    padding-top: 0;

    .el-select {
      width: 100%;
    }

    .el-form-item__label {
      padding-bottom: 0;
    }
  }
}
</style>

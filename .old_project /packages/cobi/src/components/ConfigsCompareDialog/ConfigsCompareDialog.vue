<template>
  <div class="configs-compare-dialog">
    <el-dialog :close-on-click-modal="false" appendToBody title="Resolve conflicts" v-model="dialogVisible" width="90%">
      <div class="configs-compare-dialog-title">
        <h2>Theirs (From server)</h2>
        <h2>Yours</h2>
      </div>
      <CyodaEditor v-if="dialogVisible" v-model="newData" :old-string="oldString" :new-string="newString" :diff="true" :diffReadonly="false" />
      <template #footer>
        <div class="dialog-footer">
          <el-button type="danger" @click="onAcceptTheirs">Accept theirs</el-button>
          <el-button type="success" @click="onAcceptYours">Accept yours</el-button>
          <el-button type="success" @click="onSave">Save Data from Editor</el-button>
          <el-button @click="dialogVisible = false">Close</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import {ElMessage, ElMessageBox} from "element-plus";
import { ref } from "vue";
import CyodaEditor from "@cyoda/ui-lib/src/components-library/elements/CyodaEditor/CyodaEditor.vue";

import HelperContent from "../../helpers/HelperContent";

const emit = defineEmits(["acceptTheirs", "acceptYours", "save"]);
const props = defineProps({
  acceptTheirsMessage: { default: "We cancel your changes and you will return to main screen. Confirm?" },
  acceptYoursMessage: { default: "We will store your data on server. Confirm?" }
});

const dialogVisible = ref<boolean>(false);

const oldString = ref<string>("");

const newString = ref<string>("");

const newData = ref<string>("");

function openDialog(oldStringValue, newStringValue) {
  oldString.value = oldStringValue;
  newString.value = newStringValue;
  newData.value = newStringValue;
  dialogVisible.value = true;
}

function onAcceptTheirs() {
  ElMessageBox.confirm(props.acceptTheirsMessage, "Confirm!", {
    callback: async (action) => {
      if (action === "confirm") {
        const oldData = JSON.parse(oldString.value);
        emit("acceptTheirs", {
          success: true,
          configId: oldData.id
        });
        dialogVisible.value = false;
      }
    }
  });
}

function onAcceptYours() {
  ElMessageBox.confirm(props.acceptYoursMessage, "Confirm!", {
    callback: async (action) => {
      if (action === "confirm") {
        const oldData = JSON.parse(oldString.value);
        const newStringData = JSON.parse(newString.value);
        newStringData.lastUpdated = oldData.lastUpdated;
        dialogVisible.value = false;
        emit("acceptYours", newStringData);
      }
    }
  });
}

function onSave() {
  ElMessageBox.confirm("Do you confirm what you ready for save data?", "Confirm!", {
    callback: async (action) => {
      if (action === "confirm") {
        if (!HelperContent.isJsonValid(newData.value)) {
          ElMessage.error(`Data in editor is not valid, please, fix JSON data!`);
          return;
        }

        const oldData = JSON.parse(oldString.value);
        const newDataValue = JSON.parse(newData.value);
        newDataValue.lastUpdated = oldData.lastUpdated;

        dialogVisible.value = false;
        emit("save", newDataValue);
      }
    }
  });
}

defineExpose({ dialogVisible, openDialog, onAcceptTheirs, onAcceptYours, onSave });
</script>

<style scoped lang="scss">
.configs-compare-dialog-title {
  display: flex;
  margin-bottom: 5px;

  h2 {
    width: 50%;
  }

  h2 + h2 {
    padding-left: 10px;
  }
}
</style>

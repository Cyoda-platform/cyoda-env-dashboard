<template>
  <div class="state-machine-consistency-dialog">
    <el-dialog title="State Machine Consistency" v-model="dialogVisible" width="50%">
      <div class="header-wrapper">
        <h4>For Automatic Fix</h4>
      </div>
      <template v-if="data.processResults && data.processResults.length === 0 && data.transitionResults && data.transitionResults.length === 0 && data.workflowResults && data.workflowResults.length === 0"> State Machine have not any errors </template>
      <template v-else>
        <div>
          <el-button @click="onClickFix" :loading="isLoading" type="success">Fix</el-button>
        </div>
        <el-tabs>
          <el-tab-pane label="Process Results" v-if="data.processResults && data.processResults.length > 0">
            <StateMachineConsistencyDialogTable :rows="data.processResults" />
          </el-tab-pane>
          <el-tab-pane label="Transition Results" v-if="data.transitionResults && data.transitionResults.length > 0">
            <StateMachineConsistencyDialogTable v-if="data.transitionResults.length > 0" :rows="data.transitionResults" />
          </el-tab-pane>
          <el-tab-pane v-if="data.workflowResults && data.workflowResults.length > 0" label="Workflow Results">
            <StateMachineConsistencyDialogTable :rows="data.workflowResults" />
          </el-tab-pane>
        </el-tabs>
      </template>
      <template #footer>
      <span class="dialog-footer">
        <el-button @click="dialogVisible = false">Close</el-button>
      </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ElNotification, ElMessageBox } from "element-plus";
import { ref } from "vue";

import StateMachineConsistencyDialogTable from "./StateMachineConsistencyDialogTable.vue";

import * as api from "../../../api";

const props = defineProps({
  data: {
    default: () => {
      return {};
    }
  }
});

const dialogVisible = ref<boolean>(false);

const isLoading = ref<boolean>(false);

async function onClickFix() {
  ElMessageBox.confirm("Do you really want to fix?", "Confirm!", {
    callback: async (action) => {
      if (action === "confirm") {
        try {
          isLoading.value = true;
          api.postStatemachineFix();
          dialogVisible.value = false;
          ElNotification({
            title: "Success",
            message: "All errors was fixed!",
            type: "success"
          });
        } finally {
          isLoading.value = false;
        }
      }
    }
  });
}

defineExpose({ dialogVisible });
</script>

<style lang="scss">
.state-machine-consistency-dialog {
  h4 {
    font-size: 18px;
    color: #000;
    margin-bottom: 15px;
    margin-top: 15px;
  }
  //hr {

  //}

  .el-dialog__body {
    padding-bottom: 0;
    padding-top: 0;
  }
  .header-wrapper {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
}
</style>

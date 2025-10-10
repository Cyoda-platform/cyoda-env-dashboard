<template>
  <div class="bulk-update-form">
    <el-form ref="formRef" :inline="true" :model="form">
      <el-form-item label="Priority">
        <el-select :disabled="isLoading" clearable v-model="form.priority" placeholder="-- Select --">
          <el-option v-for="item in optionsPriority" :key="item.key" :label="item.value" :value="item.key"> </el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="Assigned To">
        <el-select :disabled="isLoading" clearable v-model="form.assignee" placeholder="-- Select --">
          <el-option v-for="item in optionsAssignee" :key="item.name" :label="item.name" :value="item.name"> </el-option>
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button :loading="isLoading" type="primary" @click="onSubmit">Submit</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script setup lang="ts">
import { ElNotification, ElMessageBox } from "element-plus";
import { ref } from "vue";

import HelperDictionary from "@cyoda/ui-lib/src/helpers/HelperDictionary";
import {useTasksStore} from "../../../stores/tasks";

const props = defineProps({
  multipleSelection: {
    default: () => {
      return {};
    }
  }
});
const emit=defineEmits(['updated']);
const tasksStore = useTasksStore();
function updateTask(value) {
  return tasksStore.updateTask(value);
}

let form = ref({
  priority: "",
  assignee: ""
});

let optionsAssignee = ref(HelperDictionary.users);

let optionsPriority = ref(HelperDictionary.priorities);

const isLoading = ref<boolean>(false);

function onSubmit() {
  ElMessageBox.confirm("Do you really want to update task(s)?", "Confirm", {
    callback: async (action) => {
      if (action === "confirm") {
        isLoading.value = true;
        try {
          await Promise.all(
            props.multipleSelection.map((el) => {
              if (form.value.priority) {
                el.task.priority = form.value.priority;
              }
              if (form.value.assignee) {
                el.task.assignee = form.value.assignee;
              }
              return updateTask({
                transition: "AMEND",
                task: el.task
              });
            })
          );
          emit("updated");
          ElNotification({
            title: "Success",
            message: "Bulk updates is done!",
            type: "success"
          });
        } finally {
          isLoading.value = false;
        }
      }
    }
  });
}
</script>

<style lang="scss">
.bulk-update-form {
  margin-top: 15px;

  .el-form-item__content{
    width: 220px;
  }
}
</style>

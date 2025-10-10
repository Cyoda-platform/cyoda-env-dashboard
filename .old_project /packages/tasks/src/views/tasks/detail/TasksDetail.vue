<template>
  <div class="tasks-detail">
    <div class="row">
      <div class="col-md-12">
        <div class="card">
          <div class="card-header">
            <h2>Detail Task</h2>
          </div>
          <div v-loading="loading" class="card-body">
            <el-row :gutter="30">
              <el-col class="wrap-form" :span="16">
                <el-form :rules="rules" ref="formRef" :model="form" label-width="150px">
                  <el-form-item prop="transition" label="Transition">
                    <el-select :disabled="!isEdit" clearable v-model="form.transition" placeholder="-- Select --">
                      <el-option v-for="transition in transitionsOptions" :key="transition" :label="toLowerCase(transition)" :value="transition"> </el-option>
                    </el-select>
                  </el-form-item>

                  <el-form-item prop="task.priority" label="Priority">
                    <el-select :disabled="!isEdit" clearable v-model="form.task.priority" placeholder="-- Select --">
                      <el-option v-for="item in optionsPriority" :key="item.key" :label="item.value" :value="item.key"> </el-option>
                    </el-select>
                  </el-form-item>

                  <el-form-item prop="task.assignee" label="Assigned To">
                    <el-select :disabled="!isEdit" clearable v-model="form.task.assignee" placeholder="-- Select --">
                      <el-option v-for="item in optionsAssignee" :key="item.name" :label="item.name" :value="item.name"> </el-option>
                    </el-select>
                  </el-form-item>

                  <el-form-item label="Message">
                    <el-input type="textarea" :disabled="true" :autosize="{ minRows: 6, maxRows: 10 }" placeholder="Please input" v-model="form.task.message"> </el-input>
                  </el-form-item>

                  <el-form-item>
                    <el-button @click="onBack">
                      <font-awesome-icon icon="long-arrow-alt-left" />
                      Back
                    </el-button>
                    <template v-if="isEdit">
                      <el-button type="success" @click="onUpdate">Update</el-button>
                      <el-button type="info" @click="onCancel">Cancel</el-button>
                    </template>
                    <template v-else>
                      <el-button type="primary" @click="onEdit">Edit</el-button>
                    </template>
                  </el-form-item>
                </el-form>
              </el-col>
              <el-col :span="8" class="wrap-information">
                <h2>Information</h2>
                <p><strong>Title:</strong> {{ form.task.title }}</p>
                <p><strong>Status:</strong> {{ form.task.state }}</p>
                <p><strong>Created at:</strong> {{ form.createdDatetime | date }}</p>
                <p><strong>Entity:</strong> {{ form.task && form.task.srcEntityClass && HelperEntities.getShortNameOfEntity(form.task.srcEntityClass) }}</p>
                <p><strong>Id:</strong> {{ form.task.srcEntityId }}</p>

                <el-button @click="onOpenDetailEntity" type="primary">
                  <font-awesome-icon icon="search" />
                  Detail Entity
                </el-button>
              </el-col>
            </el-row>
          </div>
        </div>
      </div>
    </div>
    <AdaptableBlotterEntity :isEditable="true" :reportDefinitionId="reportDefinitionId" :configDefinition="configDefinition" :selectedRow="selectedRow" />
  </div>
</template>

<script setup lang="ts">
import { ElNotification, ElMessageBox } from "element-plus";
import { useRouter, useRoute } from "vue-router";
import { ref, nextTick, computed, watch } from "vue";

import AdaptableBlotterEntity from "@cyoda/ui-lib/src/components-library/patterns/AdaptableBlotter/AdaptableBlotterEntity.vue";
import type { Task } from "../../../views/tasks/types";
import HelperDictionary from "@cyoda/ui-lib/src/helpers/HelperDictionary";
import HelperFormat from "@cyoda/ui-lib/src/helpers/HelperFormat";
import {useTasksStore} from "../../../stores/tasks";
import HelperEntities from "@cyoda/ui-lib/src/helpers/HelperEntities.ts";

const route = useRoute();
const router = useRouter();
const tasksStore = useTasksStore();
const configDefinition = computed(() => {
  return {
    requestClass: form.value.task.srcEntityClass
  };
});
const reportDefinitionId = computed(() => {
  return `${form.value.task.srcEntityClass}_detail_task`;
});
function getTask(id) {
  return tasksStore.getTask(id);
}

function updateTask(value) {
  return tasksStore.updateTask(value);
}

function getStats() {
  return tasksStore.getStats();
}

function addReadedId(id) {
  return tasksStore.addReadedId(id);
}
const formRef = ref(null);

let transitionsOptions = ref([]);

let optionsStatus = ref(HelperDictionary.statuses);

let optionsAssignee = ref(HelperDictionary.users);

let optionsPriority = ref(HelperDictionary.priorities);

const isEdit = ref<boolean>(false);

const loading = ref<boolean>(false);

let form = ref({
  transition: "",
  task: {} as Task
});

let selectedRow = ref({});

let rules = ref({
  transition: [{ required: true, message: "Please select Transition" }],
  task: {
    priority: [{ required: true, message: "Please select Priority" }],
    assignee: [{ required: true, message: "Please select Assignee" }]
  }
});
async function loadTask(id: string) {
  try {
    loading.value = true;
    const { alertTask, transitions } = await getTask(id);
    if (alertTask) {
      transitionsOptions.value = transitions;
      form.value.task = alertTask;
      await nextTick();

      formRef.value.clearValidate();

      addReadedId(id);
    }
  } finally {
    loading.value = false;
  }
}
function onBack() {
  router.push("/tasks");
}
function onEdit() {
  isEdit.value = true;
}
function onUpdate() {
  formRef.value.validate((valid: boolean) => {
    if (valid) {
      ElMessageBox.confirm("Do you really want to update task?", "Confirm", {
        callback: async (action) => {
          if (action === "confirm") {
            isEdit.value = false;
            await updateTask({
              transition: form.value.transition,
              task: form.value.task
            });
            router.push("/tasks");
            ElNotification({
              title: "Success",
              message: "Task was updated",
              type: "success"
            });
          }
        }
      });
    }
  });
}
function onCancel() {
  isEdit.value = false;
}
function toLowerCase(str: string) {
  return HelperFormat.toLowerCase(str);
}

function onOpenDetailEntity() {
  selectedRow.value = { id: form.value.task.srcEntityId };
}

watch(
  ()=>route.params.id,
  (val: string) => {
    loadTask(val);
  },
  { immediate: true }
);
</script>

<style lang="scss">
.tasks-detail {
  h1 {
    margin-bottom: 25px;
  }

  h2 {
    margin-bottom: 15px;
  }

  .wrap-information {
    strong {
      display: inline-block;
      margin-right: 10px;
    }
  }

  .wrap-form {
    border-right: 1px solid #e4e7ed;
  }
}
</style>

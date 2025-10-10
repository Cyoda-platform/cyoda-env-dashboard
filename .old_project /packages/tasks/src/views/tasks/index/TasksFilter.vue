<template>
  <div class="tasks-filters">
    <el-form label-position="top" class="demo-form-inline">
      <el-row :gutter="20">
        <el-col :span="8">
          <el-form-item label="By Status">
            <el-select clearable class="full-width" v-model="filter.status_id" placeholder="-- Select --">
              <el-option v-for="item in optionsStatus" :key="item.key" :label="item.value" :value="item.key"> </el-option>
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="By Assignee">
            <el-select clearable class="full-width" v-model="filter.assignee_id" placeholder="-- Select --">
              <el-option v-for="item in optionsAssignee" :key="item.name" :label="item.name" :value="item.name"> </el-option>
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="By Priority">
            <el-select clearable class="full-width" v-model="filter.priority_id" placeholder="-- Select --">
              <el-option v-for="item in optionsPriority" :key="item.key" :label="item.value" :value="item.key"> </el-option>
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>
    <hr />
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from "vue";

import type { TaskFilterType } from "../types";
import HelperDictionary from "@cyoda/ui-lib/src/helpers/HelperDictionary";
import HelperStorage from "@cyoda/ui-lib/src/helpers/HelperStorage";

const helperStorage = new HelperStorage();

const defaultFilter: TaskFilterType = {
  status_id: undefined,
  assignee_id: undefined,
  priority_id: undefined,
};

const emit = defineEmits(["changeFilter"]);

let filter = ref(defaultFilter);

let optionsStatus = ref(HelperDictionary.statuses);

let optionsAssignee = ref(HelperDictionary.users);

let optionsPriority = ref(HelperDictionary.priorities);
filter.value = helperStorage.get("TasksFilter", defaultFilter);
applyFilter(filter.value);
function applyFilter(filter: TaskFilterType) {
  helperStorage.set("TasksFilter", filter);
  emit("changeFilter", filter);
}

watch(
  filter,
  (val: any) => {
    applyFilter(val);
  },
  { deep: true }
);
</script>

<style lang="scss">
.tasks-filters {
  .el-form-item__label {
    margin-bottom: 0;
    padding-bottom: 0;
    font-size: 14px;
  }
}
</style>

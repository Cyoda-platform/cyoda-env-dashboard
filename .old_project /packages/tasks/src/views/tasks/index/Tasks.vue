<template>
  <div>
    <div class="row">
      <div class="col-md-12">
        <div class="card">
          <div class="card-body">
            <div class="actions">
              <div>
                <h2>Filters</h2>
              </div>
              <div class="text-right">
                <el-button @click="toggleApplyRealData" v-if="isApplyRealData" key="applyRealDataTrue" type="warning">
                  Unsubscribe to live data
                  <font-awesome-icon icon="times"/>
                </el-button>
                <el-button @click="toggleApplyRealData" v-else key="applyRealDataFalse" type="primary">
                  Subscribe to live data
                  <font-awesome-icon icon="satellite"/>
                </el-button>
              </div>
            </div>
            <TasksFilter @changeFilter="onChangeFilter"/>
            <keep-alive>
              <TasksGrid :isApplyRealData="isApplyRealData" :filter="filter"/>
            </keep-alive>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {ref, computed} from "vue";

import TasksFilter from "./TasksFilter.vue";
import TasksGrid from "./TasksGrid.vue";
import type {TaskFilterType} from "../types";
import {useTasksStore} from "../../../stores/tasks";


const tasksStore = useTasksStore();
const isApplyRealData = computed(() => {
  return tasksStore.isApplyRealData;
})

function setIsApplyRealData(isApplyRealData: boolean) {
  return tasksStore.setIsApplyRealData(isApplyRealData);
}

let filter = ref({});

function onChangeFilter(filterValue: TaskFilterType) {
  filter.value = filterValue;
}

function toggleApplyRealData() {
  setIsApplyRealData(!isApplyRealData.value);
}
</script>

<style lang="scss" scoped>
.actions {
  display: flex;
  justify-content: space-between;
  align-items: center;

  .text-right {
    text-align: right;
  }
}
</style>

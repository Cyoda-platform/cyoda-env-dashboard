<template>
  <div class="tasks-grid">
    <div>
      <h2>Tasks</h2>
    </div>
    <div class="wrap-table">
      <el-table ref="multipleTableRef" v-loading="loading" :data="tableData"
                :pagination-props="{ pageSizes: [5, 10, 15, 20, 25] }" @selection-change="handleSelectionChange"
                style="width: 100%">
        <el-table-column type="selection" width="55"></el-table-column>
        <el-table-column sortable prop="title" label="Title" width="180"></el-table-column>
        <el-table-column sortable prop="state" label="Status" width="180"></el-table-column>
        <el-table-column sortable sort-by="priority_id" prop="priority_name" label="Priority" width="180">
          <template v-slot:default="scope">
            {{ scope.row.priority_name }}
            <font-awesome-icon :style="{ color: priorityArrowColor(scope.row.priority) }"
                               :icon="priorityArrow(scope.row.priority)"/>
          </template>
        </el-table-column>
        <el-table-column sortable sort-by="assigned_to_id" prop="assigned_to_name"
                         label="Assigned To"></el-table-column>
        <el-table-column sortable sort-by="timestamp" prop="timestamp_name" label="Created"></el-table-column>
        <el-table-column label="Operations">
          <template v-slot:default="scope">
            <el-tooltip class="item" effect="dark" content="Edit" placement="top">
              <el-button @click="onView(scope.row)" size="default" type="warning" rel="tooltip" data-original-title=""
                         title="">
                <font-awesome-icon icon="pencil-alt"/>
              </el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>

      <BulkUpdateForm v-if="multipleSelection.length > 0" @updated="onUpdatedBulk"
                      :multipleSelection="multipleSelection"/>

      <el-pagination @size-change="onSizeChange" @current-change="onCurrentChange" class="wrap-pagination"
                     :page-size="currentPageSize" :current-page="currentPage" :pager-count="5" :page-sizes="[5, 10, 20]"
                     layout="prev, pager, next, sizes, total" :total="totalRows"></el-pagination>
    </div>
    <TasksNotifications/>
  </div>
</template>

<script setup lang="ts">
import {useRouter} from "vue-router";
import {ref, computed, watch, onBeforeUnmount} from "vue";


import type {TableRow, Task, TasksRequestParams} from "../types";
import BulkUpdateForm from "./BulkUpdateForm.vue";
import {ElTable} from "element-plus";
import HelperDictionary from "@cyoda/ui-lib/src/helpers/HelperDictionary";
import HelperFormat from "@cyoda/ui-lib/src/helpers/HelperFormat";
import HelperConstants from "@cyoda/ui-lib/src/helpers/HelperConstants";
import eventBus from "@cyoda/ui-lib/src/plugins/eventBus";
import {useTasksStore} from "../../../stores/tasks";

const props = defineProps({
  filter: {
    default: () => ({})
  },
  isApplyRealData: {
    default: false
  }
});
const tasksStore = useTasksStore();
const router = useRouter();
const tableData = computed(() => {
  return tasks.value.map(
    (el: Task): TableRow => ({
      title: el.title,
      id: el.id,
      state: HelperFormat.toLowerCase(el.state),
      priority: el.priority,
      priority_name: HelperDictionary.getLabel("priorities", el.priority),
      assigned_to_name: el.assignee,

      timestamp: 0,
      timestamp_name: HelperFormat.date(el.createdDatetime),
      agent_event: el.message,
      task: el
    })
  );
})

const multipleTableRef = ref(null);


function loadTasksPerPage(params: TasksRequestParams) {
  return tasksStore.getTasksPerPage(params);
}

const loading = ref<boolean>(false);

let tasks = ref([]);

const totalRows = ref(0);

const currentPageSize = ref(5);

const currentPage = ref(0);

let multipleSelection = ref([]);
loadTasks();
eventBus.$on(HelperConstants.NEWTASKS, addTask);

onBeforeUnmount(() => {
  eventBus.$off(HelperConstants.NEWTASKS, addTask);
});

function addTask({alertTask: data}: any) {
  if (props.isApplyRealData) {
    if (props.filter.status_id !== "" && props.filter.status_id !== data.state) {
      data = false;
    }
    if (props.filter.assignee_id !== "" && props.filter.assignee_id !== data.assignee) {
      data = false;
    }

    if (props.filter.priority_id !== "" && props.filter.priority_id !== data.priority) {
      data = false;
    }

    if (data) {
      const task = tasks.value.find((el) => el.id === data.id);
      if (task) {
        const index = tasks.value.indexOf(task);
        if (index !== -1) {
          tasks.value[index] = data

        }
      } else {
        tasks.value.unshift(data);
        if (tasks.value.length > currentPageSize.value) {
          tasks.value.pop();
        }
        totalRows.value += 1;
      }
    }
  }
}

async function loadTasks() {
  try {
    let page = currentPage.value - 1;
    if (page < 0) {
      page = 0;
    }
    loading.value = true;
    const data = await loadTasksPerPage({
      page,
      size: currentPageSize.value,
      state: props.filter.status_id,
      assignee: props.filter.assignee_id,
      priority: props.filter.priority_id
    });

    tasks.value = [];
    totalRows.value = 0;

    if (data.length > 0) {
      tasks.value = data.map((el) => el.task);
      totalRows.value = data[0].taskCount;
    }
  } finally {
    loading.value = false;
  }
}


function priorityArrow(priorityId: number) {
  if (priorityId === 2 || priorityId === 1) {
    return "arrow-down";
  }
  return "arrow-up";
}

function priorityArrowColor(priorityId: number) {
  if (priorityId === 0) {
    return "#dd4b39";
  }
  if (priorityId === 1) {
    return "#ef8157";
  }
  if (priorityId === 2) {
    return "#6bd098";
  }
  return "#ef8157";
}

function onSizeChange(val: number) {
  currentPageSize.value = val;
  onCurrentChange(1);
}

function onCurrentChange(val: number) {
  currentPage.value = val;
}

function onView(row: TableRow) {
  router.push(`/tasks/${row.id}`);
}

function onUpdatedBulk() {
  multipleTableRef.value.clearSelection();
  multipleSelection.value = [];
  loadTasks();
}

function handleSelectionChange(val) {
  multipleSelection.value = val;
}


watch(currentPageSize, () => {

  loadTasks();
});


watch(currentPage, () => {

  loadTasks();
});


watch(() => props.filter, () => {

  loadTasks();
}, {deep: true});
</script>

<style scoped>
.wrap-table {
  margin-bottom: 20px;
}

.wrap-pagination {
  justify-content: center;
  margin-top: 20px;
}

h2 {
  margin-bottom: 10px;
}
</style>
<style lang="scss">
.circle-status {
  width: 20px;
  height: 20px;
  border-radius: 20px;
}

.tasks-grid {
  .el-table-column--selection .cell {
    padding-left: 10px !important;
  }
}
</style>

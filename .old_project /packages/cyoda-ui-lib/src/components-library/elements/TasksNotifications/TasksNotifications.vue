<template>
  <div></div>
</template>

<script setup lang="ts">
import {useAuthStore} from "@cyoda/ui-lib/src/stores/auth";
import {ElNotification} from "element-plus";
import {useRoute} from "vue-router";
import {ref, computed, watch, onBeforeUnmount} from "vue";

import _ from "lodash";
import HelperConstants from "../../../helpers/HelperConstants";
import {EventSourcePolyfill} from "event-source-polyfill";
import eventBus from "../../../plugins/eventBus";
import {useTasksStore} from "@cyoda/tasks/src/stores/tasks";

const route = useRoute();
const tasksStore = useTasksStore();
const authStore = useAuthStore();
const isApplyRealData = computed(() => {
  return tasksStore.isApplyRealData;
});
const token = computed(() => {
  return authStore.token;
});

function getAllTasks(value) {
  return tasksStore.getAllTasks(value);
}

const allTasks = ref(undefined);
const intervalId = ref(undefined);
const source = ref(undefined);
const lastTaskTime = ref(undefined);
const isLoading = ref<boolean>(false);

onBeforeUnmount(() => {
  stopAjaxEventSource();
  stopEventSource();
});

async function runAjaxEventSource() {
  if (intervalId.value === undefined) {
    await getAllTasksRequests();

    intervalId.value = setInterval(async () => {
      if (isLoading.value) return;

      isLoading.value = true;
      await getAllTasksRequests();
      isLoading.value = false;
    }, 5000);
  }
}

async function getAllTasksRequests() {
  const data = await getAllTasks({from: lastTaskTime.value});
  if (data.length === 0) return;
  lastTaskTime.value = data[data.length - 1].createdDatetime;
  if (allTasks.value === undefined) {
    allTasks.value = data;
  } else {
    const differences = _.differenceBy(data, allTasks.value, "id");
    allTasks.value = data;
    if (differences.length > 0) {
      ElNotification({
        title: "Tasks",
        dangerouslyUseHTMLString: true,
        onClick: () => {
          window.open(`/tasks`, "_blank");
        },
        message: `Was added ${differences.length} new task(s)<br/>
                    <strong class="task-strong-link-notification">Open All Tasks</strong>`,
        type: "success"
      });
      differences.forEach((el) => {
        eventBus.$emit(HelperConstants.NEWTASKS, {alertTask: el});
      });
    }
  }
}

function stopAjaxEventSource() {
  if (!intervalId.value) return;
  clearInterval(intervalId.value);
  intervalId.value = undefined;
}

watch(
  isApplyRealData,
  (val) => {
    if (val) {
      runEventSource();
    } else {
      stopEventSource();
      stopAjaxEventSource();
    }
  },
  {immediate: true}
);

function runEventSource() {
  if (token.value) {
    source.value = new EventSourcePolyfill(`${_.trimEnd(import.meta.env.VITE_APP_API_BASE, "/")}/alerts/tasks/emit`, {
      headers: {
        Authorization: `Bearer ${token.value}`,
        Accept: "*/*"
      }
    });

    source.value.addEventListener("error", (e) => {
      if (source.value) source.value.close();
      runAjaxEventSource();
    });

    const debounceMethod = _.debounce((task) => {
      if (route.params.id === task.alertTask.id) return;

      ElNotification({
        title: "Tasks",
        dangerouslyUseHTMLString: true,
        onClick: () => {
          window.open(`/tasks/${task.alertTask.id}`, "_blank");
        },
        message: `Was added new task(s)<br/>
                    <strong class="task-strong-link-notification">Open task</strong>`,
        type: "success"
      });
    }, 500);

    source.value.addEventListener(
      "message",
      (event: any) => {
        const task = JSON.parse(event.data);
        if (task.previousState === "None") {
          debounceMethod(task);
        }
        eventBus.$emit(HelperConstants.NEWTASKS, task);
      },
      false
    );
  }
}

function stopEventSource() {
  if (source.value) source.value.close();
  source.value = undefined;
}

function throttleNewTasksMessages() {
  return _.throttle(() => {
    ElNotification({
      title: "Tasks",
      message: `Was added new task(s)`,
      type: "success"
    });
  }, 5000);
}
</script>

<style lang="scss">
.task-strong-link-notification {
  color: #606266;
  cursor: pointer;

  &:hover {
    border-bottom: 1px solid #606266 !important;
  }
}
</style>

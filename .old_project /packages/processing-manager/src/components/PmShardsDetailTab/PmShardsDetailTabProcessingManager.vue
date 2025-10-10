<template>
  <div>
    <div class="row">
      <div class="col-sm-9">
        <PmActualShards :actualShardsTable="actualShardsTable" />
        <PmTasks :tasksByEntity="tasksByEntity" :runningTaskCount="runningTaskCount" :lastTaskFinishTime="lastTaskFinishTime" />
      </div>
      <div class="col-sm-3">
        <PmPendingTasksCount :pendingTaskCount="pendingTaskCount" />
        <PmResources :poolInfo="poolInfo" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onBeforeUnmount } from "vue";

import PmBarChartStacked from "../../components/PmCharts/PmBarChartStacked.vue";
import PmActualShards from "../../components/PmShardsDetailTab/ProcessingManagers/PmActualShards.vue";
import PmTasks from "../../components/PmShardsDetailTab/ProcessingManagers/PmTasks.vue";
import PmPendingTasksCount from "../../components/PmShardsDetailTab/ProcessingManagers/PmPendingTasksCount.vue";
import PmResources from "../../components/PmShardsDetailTab/ProcessingManagers/PmResources.vue";
import {useProcessingStore} from "../../stores/processing";

const processingStore = useProcessingStore();
function loadSummary() {
  return processingStore.loadSummary();
}

let actualShardsTable = ref([]);

let poolInfo = ref([]);

let tasksByEntity = ref([]);

const pendingTaskCount = ref(0);

const runningTaskCount = ref(0);

const intervalId = ref(0);

const lastTaskFinishTime = ref<string>("");
(async function () {
  const { data } = await loadSummary();
  actualShardsTable.value = data.actualShards.map((el) => {
    return {
      ...el,
      shardId: parseInt(el.shardId, 10)
    };
  });
  poolInfo.value = data.poolInfo;
  pendingTaskCount.value = data.pendingTaskCount;
  runningTaskCount.value = data.runningTaskCount;
  lastTaskFinishTime.value = data.lastTaskFinishTime;
  tasksByEntity.value = data.tasksByEntity || [];
})();

onBeforeUnmount(() => {
  if (intervalId.value) {
    clearInterval(intervalId.value);
  }
});
</script>

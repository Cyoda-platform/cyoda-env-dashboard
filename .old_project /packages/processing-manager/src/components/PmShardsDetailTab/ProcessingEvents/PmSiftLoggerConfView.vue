<template>
  <div class="pm-sift-logger-conf-view">
    <h3>Sift logger</h3>
    <el-form ref="formRef" label-position="left" :model="form" label-width="auto">
      <div class="flex-row">
        <div class="flex-col">
          <el-form-item label="Sift logger configured:">
            <el-switch :disabled="true" v-model="form.loggerConfigured"></el-switch>
          </el-form-item>
        </div>
        <div class="flex-col">
          <el-form-item label="Sift logger enabled:">
            <el-switch v-model="form.loggerEnabled"></el-switch>
          </el-form-item>
        </div>
      </div>
    </el-form>

    <el-transfer filterable :titles="['Exclude Queues', 'Include Queues']"
                 filter-placeholder="Filter Queues" v-model="form.queues"
                 :data="dataQueues"></el-transfer>
    <el-divider/>
    <div class="actions">
      <el-button @click="onSubmit" :loading="isLoading" type="primary">Submit</el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import {ElNotification} from "element-plus";
import {useRoute} from "vue-router";
import {ref} from "vue";

import HelperFormat from "@cyoda/ui-lib/src/helpers/HelperFormat";
import {useProcessingStore} from "../../../stores/processing";

const route = useRoute();
const processingStore = useProcessingStore();

function loadSiftLogger() {
  return processingStore.loadSiftLogger();
}

function updateSiftLogger(value) {
  return processingStore.updateSiftLogger(value);
}

let form = ref({
  loggerConfigured: true,
  loggerEnabled: false,
  queues: []
});

const isLoading = ref<boolean>(false);

let dataQueues = ref([]);
(async function () {
  const {data} = await loadSiftLogger();
  dataQueues.value = data.queuesAll.map((el: any) => ({
    key: el,
    label: HelperFormat.shortNamePath(el)
  }));
  form.value.queues = data.queuesInclude;
  form.value.loggerEnabled = data.loggerEnabled;
})();

async function onSubmit() {
  try {
    isLoading.value = true;
    const queuesExclude = dataQueues.value.map((el: any) => el.label).filter((el: any) => (form.value.queues as any).indexOf(el) === -1);
    const data = {
      loggerEnabled: form.value.loggerEnabled,
      queuesExclude,
      queuesInclude: form.value.queues
    };
    await updateSiftLogger({node: route.params.name, data});
    ElNotification({
      title: "Success",
      message: "Data was updated",
      type: "success"
    });
  } finally {
    isLoading.value = false;
  }
}
</script>

<style lang="scss">
.pm-sift-logger-conf-view {
  .el-transfer-panel {
    width: calc((100% - 200px) / 2);
  }

  .actions {
    margin-top: 20px;
    text-align: center;
  }

  .flex-row {
    display: flex;
    gap: 10px 40px;
    flex-wrap: wrap;
    margin-bottom: 15px;
  }

  .flex-col {
    .el-form-item {
      margin-bottom: 0;
    }
  }
}
</style>

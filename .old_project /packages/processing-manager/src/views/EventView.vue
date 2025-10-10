<template>
  <ViewWrapper>
    <div class="card">
      <div class="card-body">
        <div class="wrap-title flex">
          <h3>Event view</h3>
          <span>
            <ErrorViewActions @reload="onReload" v-if="!data.done" />
          </span>
        </div>
        <el-divider></el-divider>
        <ul>
          <li class="name">Create Time</li>
          <li>{{ data.event.createTime }}</li>
          <li class="name">Queue</li>
          <li>{{ data.event.queueName }}</li>
          <li class="name">Shard</li>
          <li>{{ data.event.shardId }}</li>
          <li class="name">Status</li>
          <li>{{ data.event.status }}</li>
          <li class="name">Time-UUID</li>
          <li>{{ data.event.timeUUID }}</li>
          <li class="name">Entity-Class</li>
          <li>{{ data.event.queueName }}</li>
          <li class="name">Entity-ID</li>
          <li>{{ data.event.entityId }}</li>
          <li class="name">Has Errors</li>
          <li>{{ $filters.boolean(data.event.entityHasErrors) }}</li>
          <li class="name">Error Event Time-UUID</li>
          <li>{{ data.event.errorEventTimeUUID }}</li>
          <li class="name">Core event data</li>
          <li>
            <pre :class="codeObj.class">
            <code :class="codeObj.class" v-html="codeObj.code"></code>
          </pre>
          </li>
          <li class="name">Client event data</li>
          <li>{{ data.event.clientDataClassName || "-" }}</li>
        </ul>
      </div>
    </div>
  </ViewWrapper>
</template>

<script setup lang="ts">
import { useRoute } from "vue-router";
import { ref, computed } from "vue";

import ErrorViewActions from "../components/ErrorViewActions/ErrorViewActions.vue";
import Prism from "prismjs";
import "prismjs/themes/prism.css";

import beautify from "js-beautify";
import ViewWrapper from "../components/ViewWrapper.vue";
import {useProcessingStore} from "../stores/processing";

const route = useRoute();
const processingStore = useProcessingStore();
let data = ref({event: {}});

const codeObj = computed(() => {
  const dataTmp = data.value.event.coreData && beautify.js(JSON.stringify(data.value.event.coreData).trim(), {
    indent_size: 2,
    space_in_empty_paren: true,
    wrap_line_length: 50
  }) || "{}";
  return {
    class: "language-javascript",
    code: Prism.highlight(dataTmp, Prism.languages.javascript, "javascript")
  };
});

function processingQueueErrorEventByEntity(value) {
  return processingStore.processingQueueErrorEventByEntity(value);
}

loadData();

async function loadData() {
  const { data:dataValue } = await processingQueueErrorEventByEntity({
    ...route.query
  });
  data.value = dataValue;
}

function onReload() {
  loadData();
}
</script>

<style scoped lang="scss">
.card-body ul {
  list-style: none;
  margin: 0;
  padding: 0;

  li.name {
    font-weight: bold;
    margin-top: 10px;
  }
}

.wrap-title {
  margin-bottom: 15px;

  h3 {
    display: inline;
  }
}

.flex {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>

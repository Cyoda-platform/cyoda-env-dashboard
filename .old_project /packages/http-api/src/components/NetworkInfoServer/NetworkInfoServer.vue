<template>
  <div class="network-info-server">
    <div>
      <h1 class="label">Server</h1>
      <div class="wrap-box">
        <div class="title">
          <span class="type-class">Type:</span>&nbsp;
          <span class="green">{{ serverInfo.type }}</span>
        </div>
        <div class="row-flex">
          <div>
            <strong>id:</strong><br/>
            {{ serverInfo.id || "-" }}
          </div>
          <div>
            <strong>Node Type:</strong><br/>
            {{ serverInfo.nodeType || "-" }}
          </div>
          <div>
            <strong>Host:</strong><br/>
            {{ serverInfo.host || "-" }}
          </div>
          <div>
            <strong>Port:</strong><br/>
            {{ serverInfo.port || "-" }}
          </div>
          <div>
            <strong>Running:</strong><br/>
            {{ $filters.boolean(serverInfo.running) }}
          </div>
          <div>
            <strong>Binded:</strong><br/>
            {{ $filters.boolean(serverInfo.binded) }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {ref} from "vue";

import * as api from "@cyoda/ui-lib/src/api";

let serverInfo = ref({});
const props = defineProps({
  getNetInfoServerRequestFn: {
    default: null
  }
})

function getNetInfoServerRequest() {
  if (props.getNetInfoServerRequestFn) return props.getNetInfoServerRequestFn();
  return api.getNetInfoServer();
}

loadData();

async function loadData() {
  const {data} = await getNetInfoServerRequest();
  serverInfo.value = data;
}

defineExpose({getNetInfoServerRequest});
</script>

<style lang="scss">
.network-info-server {
  h1.label {
    font-size: 22px;
    margin-bottom: 10px;
    padding-left: 0;
  }

  .title {
    margin-bottom: 10px;
  }

  .row-flex {
    display: flex;
    justify-content: space-between;
  }

  .green {
    color: #148751;
    font-weight: bold;
  }

  .type-class {
    text-transform: uppercase;
    color: #595959;
    font-size: 14px;
    font-family: "Work Sans", sans-serif;
    font-weight: 500;
  }
}
</style>

<template>
  <div class="curr-node-info">
    <div>
      <h1 class="label">Node info</h1>
      <div class="wrap-box">
        <div class="title">
          <span class="type-class">Type:</span>&nbsp;
          <span class="green">{{ nodeInfo.type }}</span>
          <CurrNodeInfoCheckState :nodeInfo="nodeInfo" :clusterStateCurrentNode="clusterStateCurrentNode" field="type"/>
        </div>
        <div class="row-flex">
          <div>
            <strong>BaseUrl:</strong><br/>
            {{ nodeInfo.baseUrl || "-" }}
            <CurrNodeInfoCheckState :nodeInfo="nodeInfo" :clusterStateCurrentNode="clusterStateCurrentNode"
                                    field="baseUrl"/>
          </div>
          <div>
            <strong>Host:</strong><br/>
            {{ nodeInfo.host || "-" }}
            <CurrNodeInfoCheckState :nodeInfo="nodeInfo" :clusterStateCurrentNode="clusterStateCurrentNode"
                                    field="host"/>
          </div>
          <div>
            <strong>Notifications Port:</strong><br/>
            {{ nodeInfo.notificationsPort || "-" }}
            <CurrNodeInfoCheckState :nodeInfo="nodeInfo" :clusterStateCurrentNode="clusterStateCurrentNode"
                                    field="notificationsPort"/>
          </div>
          <div>
            <strong>Processing Node:</strong><br/>
            {{ $filters.boolean(nodeInfo.processingNode) }}
            <CurrNodeInfoCheckState :nodeInfo="nodeInfo" :clusterStateCurrentNode="clusterStateCurrentNode"
                                    field="processingNode"/>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {ref} from "vue";

import * as api from "@cyoda/ui-lib/src/api";
import CurrNodeInfoCheckState from "./CurrNodeInfoCheckState.vue";

const props = defineProps({
  clusterStateCurrentNode: {
    default: () => {
      return {};
    }
  },
  getZkInfoCurrNodeInfoRequestFn: {
    default: null
  }
});

let nodeInfo = ref({});

function getZkInfoCurrNodeInfoRequest() {
  if (props.getZkInfoCurrNodeInfoRequestFn) return props.getZkInfoCurrNodeInfoRequestFn();
  return api.getZkInfoCurrNodeInfo();
}

loadData();

async function loadData() {
  const {data} = await getZkInfoCurrNodeInfoRequest();
  nodeInfo.value = data;
}

defineExpose({getZkInfoCurrNodeInfoRequest});
</script>

<style lang="scss">
.curr-node-info {
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

    div {
      width: 25%;
    }
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

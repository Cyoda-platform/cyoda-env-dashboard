<template>
  <div class="pm-header-proxy-request">
    Proxy mode
    <el-switch @change="onChange" v-model="proxyRequest"></el-switch>
    <el-popover class="info" placement="bottom" title="Proxy mode" trigger="click">
      - <strong>on</strong>, requests to a processing manager is done via the main (delegating) endpoint. <br />
      - <strong>off</strong>, requests are made directly to a processing manager node, which may not work in certain environments
      <template #reference>
        <i class="el-icon-warning icon-popover"></i>
      </template>
    </el-popover>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";

import HelperStorage from "@cyoda/ui-lib/src/helpers/HelperStorage";

const helperStorage = new HelperStorage();
const KEY = "proxyRequest";

let proxyRequest = ref(helperStorage.get(KEY, true));

function onChange(val: boolean) {
  helperStorage.set(KEY, val);
  setTimeout(() => {
    window.location.reload();
  }, 1000);
}
</script>

<style lang="scss">
.pm-header-proxy-request {
  display: flex;
  align-items: center;

  .el-switch {
    margin: 0 5px;
  }

  .icon-popover {
    cursor: pointer;
  }
}
</style>

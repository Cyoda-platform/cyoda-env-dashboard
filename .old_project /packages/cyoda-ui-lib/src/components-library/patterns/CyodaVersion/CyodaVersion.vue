<template>
  <div class="cyoda-version">
    <el-link @click.prevent="onClick" type="info">
      <slot name="icon" />
      Version App
    </el-link>

    <el-dialog :close-on-click-modal="false" append-to-body v-model="dialogVisible" width="50%">
      <h2>Platform</h2>
      <div class="detail-tree-item">
        <div class="title-value">
          <div class="name">Version:</div>
          <div class="value">{{ platform.version || "-" }}</div>
        </div>
      </div>
      <div class="detail-tree-item">
        <div class="title-value">
          <div class="name">Build Time:</div>
          <div class="value">{{ platform.buildTime || "-" }}</div>
        </div>
      </div>
      <div class="detail-tree-item">
        <div class="title-value">
          <div class="name">Branch Name:</div>
          <div class="value">{{ platform.gitBranchName || "-" }}</div>
        </div>
      </div>

      <hr />
      <h2>Client</h2>
      <div class="detail-tree-item">
        <div class="title-value">
          <div class="name">Version:</div>
          <div class="value">{{ client.version || "-" }}</div>
        </div>
      </div>
      <div class="detail-tree-item">
        <div class="title-value">
          <div class="name">Build Time:</div>
          <div class="value">{{ client.buildTime || "-" }}</div>
        </div>
      </div>
      <div class="detail-tree-item">
        <div class="title-value">
          <div class="name">Branch Name:</div>
          <div class="value">{{ client.gitBranchName || "-" }}</div>
        </div>
      </div>

      <hr />
      <h2>UI</h2>
      <div class="detail-tree-item">
        <div class="title-value">
          <div class="name">Version:</div>
          <div class="value">{{ uiVersion || "-" }}</div>
        </div>
      </div>
      <div class="detail-tree-item">
        <div class="title-value">
          <div class="name">Build Time:</div>
          <div class="value">{{ uiBuildTime || "-" }}</div>
        </div>
      </div>
      <div class="detail-tree-item">
        <div class="title-value">
          <div class="name">Branch Name:</div>
          <div class="value">{{ uiBranchName || "-" }}</div>
        </div>
      </div>

      <template #footer>
      <span class="dialog-footer">
        <el-button @click="dialogVisible = false">Close</el-button>
      </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";

import * as api from "../../../api";
import { useAuthStore } from "../../../stores/auth";

const authStore = useAuthStore();

const dialogVisible = ref<boolean>(false);

let client = ref({});
let platform = ref({});
let uiVersion = ref(import.meta.env.VITE_APP_UI_VERSION);
let uiBuildTime = ref(import.meta.env.VITE_APP_UI_BUILD_TIME);
let uiBranchName = ref(import.meta.env.VITE_APP_UI_BRANCH_NAME);

if (authStore.isLoggedIn) {
  loadPlatform();
  loadClient();
}

function onClick() {
  dialogVisible.value = true;
}

async function loadPlatform() {
  const { data } = await api.versionPlatform();
  platform.value = data;
}

async function loadClient() {
  const { data } = await api.versionClient();
  client.value = data;
}
</script>

<style lang="scss">
.cyoda-version {
  .el-dialog__header {
    border-bottom: 0;
  }

  .el-dialog__body {
    padding-top: 0;
  }

  h2 {
    margin-bottom: 5px;
  }

  .detail-tree-item {
    line-height: 1;
    margin-bottom: 5px;
    padding: 0;
    border: 1px solid #dfe6ec;

    .title-value {
      display: flex;
      align-items: center;
    }

    .name {
      font-size: 16px;
      font-weight: bold;
      padding: 5px;
      margin-right: 10px;
      background: #eef1f6;
      min-width: 200px;
    }

    .title {
      background: #eef1f6;
      padding: 5px 10px;
      position: relative;
      cursor: pointer;
    }
  }
}
</style>

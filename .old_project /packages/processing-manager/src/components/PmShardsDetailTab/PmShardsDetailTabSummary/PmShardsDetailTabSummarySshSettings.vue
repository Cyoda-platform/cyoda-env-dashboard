<template>
  <el-dialog :close-on-click-modal="false" class="pm-shards-detail-tab-summary-ssh-settings" title="Ssh settings" v-model="dialogVisible" width="50%">
    <el-form class="el-form-ssh-settings" ref="ruleForm" label-width="120px">
      <el-form-item label="Host name">
        <el-input v-model="form.hostname"></el-input>
      </el-form-item>
      <el-form-item label="Username">
        <el-input v-model="form.username"></el-input>
      </el-form-item>
      <el-form-item label="Password">
        <el-input v-model="form.password" show-password>></el-input>
      </el-form-item>
    </el-form>
    <template #footer>
      <span class="dialog-footer">
      <el-button type="primary" @click="onSubmit">Submit</el-button>
      <el-button @click="dialogVisible = false">Close</el-button>
    </span>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { useRoute } from "vue-router";
import { ref, computed } from "vue";
import {useSshStore} from "../../../stores/ssh";

const route = useRoute();
const sshStore = useSshStore();
const settings = computed(() => {
  return sshStore.settings;
});
function setSettings(value) {
  return sshStore.setSettings(value);
}

const dialogVisible = ref<boolean>(false);

let form = ref({
  hostname: "",
  username: "",
  password: ""
});

if (settings.value && settings.value.length > 0) {
  const existSettings = settings.value.find((el: any) => el.name === route.params.name);
  if (existSettings) {
    form.value = existSettings.form;
  }
}

function onSubmit() {
  dialogVisible.value = false;
  setSettings({ form: form.value, name: route.params.name });
}
defineExpose({dialogVisible});
</script>

<style scoped>
svg {
  margin-right: 5px;
}

.flex {
  display: flex;
  justify-content: space-between;
}
</style>

<style lang="scss">
.pm-shards-detail-tab-summary-ssh-settings {
  .el-form-ssh-settings {
    .el-form-item__content {
      width: auto !important;
    }
  }
  .el-dialog__header {
    border-bottom: none;
  }
}
</style>

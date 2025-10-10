<template>
  <el-dialog :title="title" v-model="dialogVisible" width="70%">
    <div v-if="Object.keys(error).length > 0">
      <div class="row">
        <div class="name">Last error</div>
        <div class="text">{{ $filters.mktimeToDateTime(parseInt(error.createdAt, 10)) }}</div>
      </div>
      <div class="row">
        <div class="name">Events</div>
        <div class="text">{{ eventsCount }}</div>
      </div>
      <div class="row">
        <div class="name">Info</div>
        <div class="text">{{ error.info }}</div>
      </div>
      <div v-if="error.pageUrl" class="row">
        <div class="name">Page</div>
        <div class="text">{{ error.pageUrl }}</div>
      </div>
      <div v-if="error.uiVersion" class="row">
        <div class="name">UI version</div>
        <div class="text">{{ error.uiVersion }}</div>
      </div>
      <div class="row">
        <div class="name">Stack</div>
        <div class="text">{{ error.stack }}</div>
      </div>
    </div>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="dialogVisible = false">Close</el-button>
        <el-button @click="onExport" type="primary">Export</el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import {ref, computed} from "vue";
import useErrorHandlerStore from "../../../stores/error-handler";

const emit = defineEmits(["export"]);
const errorHandlerStore = useErrorHandlerStore();
const errors = computed(() => {
  return errorHandlerStore.errors;
});
const eventsCount = computed(() => {
  return errors.value.filter((el) => el.message === error.value.message).length;
});
const title = computed(() => {
  if (!error.value) return "";
  return `Error: ${error.value.message}`;
});

const dialogVisible = ref<boolean>(false);
let error = ref({});

function open(value) {
  dialogVisible.value = true;
  error.value = value;
}

function onExport() {
  emit("export", error.value);
}

defineExpose({open});
</script>

<style lang="scss" scoped>
.row {
  display: flex;
  margin-bottom: 5px;
  padding: 0;
  border: 1px solid #dfe6ec;
  align-items: start;

  .name {
    padding: 5px;
    margin-right: 10px;
    background: #eef1f6;
    width: 200px;
    white-space: nowrap;
  }

  .text {
    flex: 1;
    padding: 5px 0;
  }
}
</style>

<template>
  <div class="card transition-state-machine-form">
    <div class="card-header">Form</div>
    <div class="card-body">
      <el-form :inline="true" :model="form" class="demo-form-inline">
        <el-form-item label="Try transition">
          <el-select v-model="form.state" placeholder="Select state">
            <el-option v-for="option in stateOptions" :key="option.value" :label="option.label"
                       :value="option.value"/>
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button :loading="isLoadingButton" :disabled="!form.state" type="primary" @click="onSubmit">Submit</el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script setup lang="ts">
import {useRoute} from "vue-router";
import {ref, computed} from "vue";
import {useProcessingStore} from "../../stores/processing";

const props = defineProps({possibleTransitions: {default: () => []}});
const emit = defineEmits(['updated']);
const route = useRoute();
const processingStore = useProcessingStore();
const stateOptions = computed(() => {
  return props.possibleTransitions.map((el) => ({
    value: el,
    label: el
  }));
});

function doManualTransition(value) {
  return processingStore.doManualTransition(value);
}

const isLoadingButton = ref<boolean>(false);

let form = ref({
  state: ""
});

async function onSubmit() {
  isLoadingButton.value = true;
  try {
    await doManualTransition({
      entityClass: route.query.type,
      entityId: route.query.entityId,
      transition: form.value.state,
      transactional: false,
      async: false,
      values: []
    });
    form.value.state = "";
    emit("updated");
  } finally {
    isLoadingButton.value = false;
  }
}
</script>

<style lang="scss">
.transition-state-machine-form {
  .el-form .el-input,
  .el-form .el-select {
    width: 300px !important;
  }
}
</style>

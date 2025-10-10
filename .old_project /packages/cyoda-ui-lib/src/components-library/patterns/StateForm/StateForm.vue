<template>
  <transition name="fade" mode="out-in">
    <el-form :model="form" ref="formRef" :rules="rules" label-width="auto" label-position="top">
      <div class="wrap-title">
        <h2>{{ pageTitle }}</h2>
      </div>
      <el-form-item label="Name" prop="name">
        <el-input v-model="form.name"/>
      </el-form-item>
      <el-form-item label="Description" prop="description">
        <el-input
            v-model="form.description"
            :autosize="{ minRows: 3, maxRows: 6 }"
            type="textarea"
        />
      </el-form-item>

      <el-button type="primary" @click="onSubmit">
        Update State
      </el-button>
    </el-form>
  </transition>
</template>

<script setup lang="ts">
import {computed, watch, reactive, ref, onMounted} from "vue";

import {useStatemachineStore} from "@cyoda/statemachine/src/stores/statemachine";
import type {FormRules} from "element-plus";

const formRef = ref(null);
const props = defineProps({
  workflowId: {
    default: null,
  },
  stateId: {
    default: "",
  },
  entityClassName: {
    default: "",
  },
  persistedType: {
    default: "",
  }
});


const form = ref({
  name: "",
  description: "",
  entityClassName: props.entityClassName
})

const rules = reactive<FormRules<RuleForm>>({
  name: [
    {required: true, message: 'Please input name', trigger: 'blur'},
  ],
});

async function loadState(stateId) {
  const {data} = await statemachineStore.getState(props.persistedType, props.workflowId, stateId);
  form.value = data.Data;
}

onMounted(() => {
  loadState(props.stateId);
})

const emit = defineEmits(["update:stateTitle", "update:workflowTitle", "submitted"]);
const statemachineStore = useStatemachineStore();

const pageTitle = computed(() => {
  return `State ${form.name}`;
});

const workflowTitle = computed(() => {
  return "Workflow";
  // return meta.value.transition.workflowname || (workflow.value && workflow.value.name) || "Workflow";
});

async function onSubmit() {
  try {
    await formRef.value.validate();
    await statemachineStore.putState(props.persistedType, props.workflowId, props.stateId, form.value);
    emit("submitted");
  } catch (e) {
  }
}

watch(
    workflowTitle,
    (val: string) => {
      emit("update:workflowTitle", val);
    },
    {immediate: true}
);
</script>

<style lang="scss" scoped>
</style>

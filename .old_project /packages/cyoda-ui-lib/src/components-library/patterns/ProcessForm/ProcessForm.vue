<template>
  <div class="process-form">
    <el-form v-loading="isAnyLoading" :model="form" ref="formRef" :rules="rules" label-width="auto"
             label-position="top">
      <div class="wrap-title">
        <h2>{{ pageTitle }}</h2>
        <div class="wrap-toggle">
          <el-switch :disabled="isRuntime" v-model="form.syncProcess" active-text="Sync Process"/>
        </div>
        <el-divider direction="vertical"/>
        <div class="wrap-toggle">
          <el-switch
              :disabled="isRuntime"
              v-model="form.newTransactionForAsync"
              active-text="New Transaction for Async"
          />
        </div>
        <el-divider direction="vertical"/>
        <div class="wrap-toggle">
          <el-switch
              :disabled="!isNew || isRuntime"
              v-model="form.isTemplate"
              active-text="Template"
          />
        </div>
      </div>

      <div class="formgroup">
        <el-form-item label="Name" prop="name">
          <el-input :disabled="isRuntime" v-model="form.name"/>
        </el-form-item>

        <el-form-item label="Description" prop="description">
          <el-input
              :disabled="isRuntime"
              v-model="form.description"
              :autosize="{ minRows: 3, maxRows: 6 }"
              type="textarea"
          />
        </el-form-item>

        <template v-if="form.isTemplate">
          <el-form-item label="Processor" prop="processorClassName">
            <el-input :disabled="isRuntime" v-model="form.processorClassName"/>
          </el-form-item>
        </template>

        <template v-else>
          <el-form-item label="Processor" prop="processorClassName">
            <el-select
                :disabled="isRuntime"
                v-model="form.processorClassName"
                filterable
                clearable
            >
              <el-option
                  v-for="item in processorsListComputed"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
              />
            </el-select>
          </el-form-item>
        </template>
        <div v-if="form.parameters.length">
          <h2>Process parameters</h2>
          <div v-for="(item, index) in form.parameters">
            <template v-if="item.availableValues">
              <el-form-item :label="item.name" :prop="`parameters.${index}.value.value`" :rules="{
                 required: true, message: 'Please fill field', trigger: 'change'
              }">
                <el-select
                    v-model="item.value.value"
                    :disabled="isRuntime"
                    filterable
                    placeholder="Select"
                    clearable
                >
                  <el-option
                      v-for="item in item.availableValues"
                      :key="item.value.value"
                      :label="item.displayValue"
                      :value="item.value.value"
                  />
                </el-select>
              </el-form-item>
            </template>
            <template v-else>
              <el-form-item :prop="`parameters.${index}.value.value`" :rules="{
                 required: true, message: 'Please fill field', trigger: 'blur'
              }">
                <template #label>
                  <span>
                    {{ item.name }} <small>{{ item.value["@type"] }}</small>
                  </span>
                </template>
                <el-input :disabled="isRuntime" v-model.trim="item.value.value"/>
              </el-form-item>
            </template>
          </div>
        </div>

        <temlate v-if="mode === 'embedded'">
          <template v-if="!isNew">
            <el-button :disabled="isRuntime" :loading="isLoading" @click="onSubmit" type="primary">
              Update
            </el-button>
          </template>
          <template v-else>
            <el-button :disabled="isRuntime" :loading="isLoading" type="primary" @click="onSubmit">
              Create
            </el-button>
          </template>
        </temlate>

        <template v-else>
          <el-button :disabled="isRuntime" @click="onCancel">
            Cancel
          </el-button>

          <template v-if="!isNew">
            <el-button :disabled="isRuntime" :loading="isLoading" @click="onSubmit"
                       type="primary">
              Update & Continue Editing
            </el-button>
            <el-button :disabled="isRuntime" :loading="isLoadingUpdate" @click="onUpdate" type="primary">
              Update
            </el-button>
          </template>
          <template v-else>
            <el-button :disabled="isRuntime" :loading="isLoadingCreateAddAnother" type="primary"
                       @click="onCreateAddAnother">
              Create & Add Another
            </el-button>
            <el-button :disabled="isRuntime" :loading="isLoading" type="primary" @click="onCreate">
              Create
            </el-button>
          </template>
        </template>
      </div>
    </el-form>
  </div>
</template>

<script setup lang="ts">
import {ref, computed, watch, reactive, nextTick} from "vue";

import {useStatemachineStore} from "@cyoda/statemachine/src/stores/statemachine";
import type {FormRules} from "element-plus";
import {useRouter} from "vue-router";
import HelperProcesses from "../../../helpers/HelperProcesses";

const formRef = ref(null);
const props = defineProps({
  entityClassName: {type: String, required: true},
  persistedType: {type: String, required: true},
  workflowPersistedType: {type: String, required: false},
  processId: {type: String, default: ""},
  workflowId: {type: String, default: ""},
  mode: {type: String, default: ""},
});

const defaultForm = {
  "@bean": "com.cyoda.core.model.stateMachine.dto.ProcessDto",
  name: "",
  description: "",
  newTransactionForAsync: false,
  syncProcess: false,
  processorClassName: "",
  isTemplate: false,
  parameters: [],
  entityClassName: props.entityClassName,
}

const form = ref(JSON.parse(JSON.stringify(defaultForm)));

const rules = reactive<FormRules<RuleForm>>({
  name: [
    {required: true, message: 'Please input name', trigger: 'blur'},
  ],
  processorClassName: [
    {required: true, message: 'Processor Class Name is required', trigger: 'change'},
  ]
});

// @TODO Mixins: Validation(adapterSchema, validationRules), ErrorPopupMixin
const emit = defineEmits(["submitted", "update:processTitle"]);

const statemachineStore = useStatemachineStore();
const processorsList = ref([]);
const isLoading = ref(false);
const isLoadingCreateAddAnother = ref(false);
const isLoadingCreate = ref(false);
const isLoadingUpdate = ref(false);
const router = useRouter();

const isAnyLoading = computed(() => {
  return isLoading.value || isLoadingCreateAddAnother.value || isLoadingUpdate.value || isLoadingCreate.value;
})

async function loadProcessors() {
  const {data} = await statemachineStore.getProcessorsList();
  processorsList.value = data;
}

(async function () {
  loadProcessors();
})();

const isNew = computed(() => {
  return !props.processId || props.processId === 'new';
});

const pageTitle = computed(() => {
  return isNew.value ? `New process ${form.value.name}` : `Process ${form.value.name}`;
});

const processorsListComputed = computed(() => {
  const allClasses = [...entityParentClassesAndInterfaces.value, props.entityClassName];
  return processorsList.value
      .filter((p) => {
        return allClasses.indexOf(p.entityClass) > -1;
      })
      .map((p) => ({value: p.name, label: p.name.split(".").pop()}));
});

let entityParentClassesAndInterfaces = ref([]);

(async function () {
  const {data} = await statemachineStore.getEntityParentClassesAndInterfaces(props.entityClassName);
  entityParentClassesAndInterfaces.value = data;
})();

async function save() {
  try {
    await formRef.value.validate();
  } catch (error) {
    throw error;
  }

  if (form.value?.parameters.length > 0) {
    form.value?.parameters.forEach((el) => {
      if (el.value['@type'].toLowerCase() === 'integer') el.value.value = parseInt(el.value.value, 10);
    })
  }

  if (isNew.value) {
    let id = "";
    if (form.value.isTemplate) {
      const {data} = await statemachineStore.postProcessesTemplate(props.persistedType, form.value);
      id = data.id;
    } else {
      const {data} = await statemachineStore.postProcesses(props.persistedType, form.value);
      id = data.id.persistedId;
    }
    return id;
  }

  if (form.value.isTemplate) {
    await statemachineStore.putProcessesTemplate(props.persistedType, props.processId, form.value);
  } else {
    await statemachineStore.putProcesses(props.persistedType, props.processId, form.value);
  }
}

async function onSubmit() {
  try {
    isLoading.value = true;
    const id = await save();

    if (isNew.value) {
      emit("submitted", {
        url: `/statemachine/process/${id}?workflowId=${props.workflowId}&persistedType=${props.persistedType}&entityClassName=${props.entityClassName}&workflowPersistedType=${props.workflowPersistedType}`,
        id
      });
    } else {
      emit("submitted");
    }
  } finally {
    isLoading.value = false;
  }
}

async function onUpdate() {
  try {
    isLoadingUpdate.value = true;
    await save();
    emit("submitted", {
      url: backLink.value,
    });
  } finally {
    isLoadingUpdate.value = false;
  }
}

async function onCreate() {
  try {
    isLoadingCreate.value = true;
    await save();
    emit("submitted", {
      url: backLink.value,
    });
  } finally {
    isLoadingCreate.value = false;
  }
}

async function onCreateAddAnother() {
  try {
    isLoadingCreateAddAnother.value = true;
    await save();
    reset();
    emit("submitted");
  } finally {
    isLoadingCreateAddAnother.value = false;
  }
}

const backLink = computed(() => {
  return `/statemachine/workflow/${props.workflowId}?persistedType=${props.workflowPersistedType}&entityClassName=${props.entityClassName}#processes-list`;
});

function onCancel() {
  router.push(backLink.value)
}

function reset() {
  form.value = JSON.parse(JSON.stringify(defaultForm));
  setTimeout(() => {
    formRef.value!.clearValidate();
  }, 100);
}

function getParameters() {
  const processor = processorsList.value.find((item) => {
    return item.name === form.value.processorClassName;
  });

  if (processor) {
    return processor.parameters.map((p: any) => {
      const parameter: any = {
        name: p.name,
        valueType: p.type,
        value: {
          "@type": p.type.charAt(0).toUpperCase() + p.type.slice(1).toLowerCase(),
          value: null
        }
      };
      if (p.availableValues) {
        parameter.availableValues = p.availableValues;
      }
      return parameter;
    });
  } else {
    return [];
  }
}

const isRuntime = computed(() => {
  return props.persistedType === 'runtime';
});


watch(() => props.processId, async () => {
  if (isNew.value) return;

  try {
    isLoading.value = true;
    const entityClassName = isRuntime.value ? props.entityClassName : undefined;
    const {data} = await statemachineStore.getProcesses(props.persistedType, props.processId, entityClassName);
    form.value = data;
  } finally {
    isLoading.value = false;
  }
}, {immediate: true});

watch(
    () => form.value.processorClassName,
    (newValue, oldValue) => {
      if (oldValue && newValue && oldValue !== newValue) {
        form.value.parameters = [];
      }

      const newParams = getParameters();

      form.value.parameters = form.value.parameters.filter((p: any) =>
          newParams.find(param => param.name === p.name)
      );

      newParams.forEach((param: any) => {
        const exists = form.value.parameters.some((p: any) => p.name === param.name);
        if (!exists) {
          form.value.parameters.push(param);
        }
      });
    },
    { immediate: true }
);

watch(() => form.value.parameters, () => {
  form.value = HelperProcesses.format(form.value);
});
</script>

<style lang="scss" scoped>
.process-form {
  .wrap-title {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .wrap-toggle {
    margin-left: 10px;
    position: relative;
    top: 2px;

    span {
      margin-right: 5px;
    }
  }
}
</style>

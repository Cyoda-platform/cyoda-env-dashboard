<template>
  <transition name="fade" mode="out-in">
    <el-form v-loading="isAnyLoading" :model="form" :key="form.id" ref="formRef" :rules="rules" label-width="auto"
             label-position="top">
      <div class="wrap-title">
        <h2>{{ pageTitle }}</h2>
      </div>

      <el-form-item style="max-width: 600px" label="Name" prop="name">
        <el-input :disabled="isRuntime" v-model="form.name"/>
      </el-form-item>

      <el-form-item style="max-width: 600px" label="Description" prop="description">
        <el-input
          :disabled="isRuntime"
          v-model="form.description"
          :autosize="{ minRows: 3, maxRows: 6 }"
          type="textarea"
        />
      </el-form-item>

      <el-form-item label="Criteria">
        <template #label>
          <div class="wrapper-title">
            <label class="el-form-item__label">Criteria</label>
            <div class="wrap-toggle">
              <el-switch
                :value="!isCodeCriteria"
                :disabled="true"
                active-text="Built in UI"
                inactive-text="Developer Coded"
              />
            </div>
          </div>
        </template>
        <div class="wrapper-criteria">
          <template v-if="isCodeCriteria">
            <el-alert :closable="false" title="Criteria is coded. No filter builder available" type="info"
                      show-icon></el-alert>
          </template>
          <template v-else>
            <el-tabs type="border-card">
              <el-tab-pane>
                <template #label>
                  <span :class="{ 'has-error': showErrors }">FilterBuilder</span>
                </template>
                <FilterBuilderGroup :readOnly="isRuntime" :showErrors="showErrors" :level="0" :cols="cols"
                                    :condition="form.condition"/>
              </el-tab-pane>
              <el-tab-pane label="Fields">
                <ConfigEditorReportsTabModelling :aria-readonly="isRuntime" :configDefinition="configDefinition"/>
              </el-tab-pane>
            </el-tabs>
          </template>
        </div>
      </el-form-item>

      <el-form-item label="Criteria Checker" prop="criteriaChecker">
        <el-select
          :disabled="isRuntime"
          v-model="form.criteriaChecker"
          filterable
          clearable
        >
          <el-option
            v-for="item in criteriacheckersListComputed"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </el-form-item>

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
    </el-form>
  </transition>
</template>

<script setup lang="ts">
import {useRoute, useRouter} from "vue-router";
import {ref, computed, watch, reactive, onMounted} from "vue";
import FilterBuilderGroup from "@cyoda/ui-lib/src/components-library/patterns/FilterBuilder/FilterBuilderGroup.vue";

import HelperFilter from "../FilterBuilder/HelperFilter";
import HelperReportDefinition from "../../../../../http-api/src/helpers/HelperReportDefinition";
import ConfigEditorReportsTabModelling
  from "../../../../../http-api/src/views/ConfigEditor/tabs/ConfigEditorReportsTabModelling.vue";
import {useStatemachineStore} from "@cyoda/statemachine/src/stores/statemachine";
import {useCriteriaMixin} from "@cyoda/statemachine/src/mixins/criteriaMixin";
import HelperProcesses from "../../../helpers/HelperProcesses";

const emit = defineEmits(["submitted", "update:criteriaTitle", "submitted", "update:criteriaTitle"]);
const formRef = ref(null);
const showErrors = ref<boolean>(false);
const props = defineProps({
  entityClassName: {type: String, required: true},
  persistedType: {type: String, required: true},
  criteriaId: {type: String, default: ""},
  workflowId: {type: String, default: ""},
  workflowPersistedType: {type: String, required: false},
  mode: {type: String, default: ""},
});
const isLoading = ref(false);
const isLoadingCreateAddAnother = ref(false);
const isLoadingCreate = ref(false);
const isLoadingUpdate = ref(false);
const router = useRouter();

const isAnyLoading = computed(() => {
  return isLoading.value || isLoadingCreateAddAnother.value || isLoadingUpdate.value || isLoadingCreate.value;
})

const defaultForm = {
  "@bean": "com.cyoda.core.model.stateMachine.dto.CriteriaDto",
  name: "",
  description: "",
  condition: HelperFilter.getGroup(),
  colDefs: [],
  aliasDefs: [],
  entityClassName: props.entityClassName,
  parameters: [],
  criteriaChecker: "",
}

const form = ref(JSON.parse(JSON.stringify(defaultForm)));

const rules = reactive({
  name: [
    {required: true, message: 'Please input name', trigger: 'blur'},
  ]
});

const route = useRoute();
const statemachineStore = useStatemachineStore();
const {isCodeCriteria} = useCriteriaMixin(form.value);
const criteriacheckersList = ref([]);
let entityParentClassesAndInterfaces = ref([]);

onMounted(() => {
  loadCriteriacheckers();
  // loadEntityParentClassesAndInterfaces();
})

const isNew = computed(() => {
  return !props.criteriaId || props.criteriaId === 'new';
});

const pageTitle = computed(() => {
  return isNew.value ? `New criteria ${form.value.name}` : `Criteria ${form.value.name}`;
});

function updateCriteria(arg: object) {
  // return statemachineStore.updateCriteria(arg);
}

let configDefinition = reactive({
  requestClass: props.entityClassName,
  colDefs: form.value.colDefs,
  aliasDefs: form.value.aliasDefs
});

const cols = computed(() => {
  return HelperReportDefinition.buildCols(configDefinition);
});

async function save() {
  let formValidate = false;
  try {
    await formRef.value.validate();
    formValidate = true;
  } catch (error) {
    throw error;
  }

  if (form.value?.parameters.length > 0) {
    form.value?.parameters.forEach((el) => {
      if (el.value['@type'].toLowerCase() === 'integer') el.value.value = parseInt(el.value.value, 10);
    })
  }

  const validate = form.value.condition.conditions ? HelperReportDefinition.validateConfigDefinition(form.value.condition.conditions) : true;
  showErrors.value = !validate;

  if (!validate || !formValidate) throw new Error('validation error');

  const criteriaTmp = JSON.parse(JSON.stringify(form.value));
  delete criteriaTmp.colDefs;
  try {
    isLoading.value = true;
    if (isNew.value) {
      const {data} = await statemachineStore.postCriteria(props.persistedType, criteriaTmp);

      formRef.value.resetFields();
      return data.id;
    }

    await statemachineStore.putCriteria(props.persistedType, criteriaTmp.id, criteriaTmp);
  } catch (error) {
    throw error;
  } finally {
    isLoading.value = false;
  }
}

async function onSubmit() {
  try {
    isLoading.value = true;
    const id = await save();

    if (isNew.value) {
      emit("submitted", {
        // Need to replace
        url: `/statemachine/criteria/${id}?persistedType=${props.persistedType}&entityClassName=${props.entityClassName}&workflowPersistedType=${props.workflowPersistedType}`,
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
      url: backLink.value
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
      url: backLink.value
    });
  } finally {
    isLoadingCreate.value = false;
  }
}

async function onCreateAddAnother() {
  try {
    isLoadingCreateAddAnother.value = true;
    await save();
    emit("submitted");
    reset();
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

// watch(
//   form,
//   () => {
//     configDefinition.colDefs = form.value.colDefs;
//     configDefinition.aliasDefs = form.value.aliasDefs;
//   },
//   {immediate: true, deep: true}
// );

watch(() => configDefinition, () => {
  form.value.colDefs = configDefinition.colDefs;
  form.value.aliasDefs = configDefinition.aliasDefs;
}, {deep: true})

function functionGetAllPathsFromCriteria(conditions, aliasesArr) {
  let colPaths: string[] = [];
  conditions.forEach((el) => {
    if ("conditions" in el) {
      colPaths = [...colPaths, ...functionGetAllPathsFromCriteria(el.conditions, aliasesArr)];
    } else {
      if (!aliasesArr.includes(el.fieldName) && !colPaths.includes(el.fieldName)) {
        colPaths.push(el.fieldName);
      }
    }
  });
  return colPaths;
}

const isRuntime = computed(() => {
  return props.persistedType === 'runtime';
});


async function loadCriteriacheckers() {
  const {data} = await statemachineStore.getCriteriacheckers(props.entityClassName);
  criteriacheckersList.value = data;
}

// async function loadEntityParentClassesAndInterfaces() {
//   const {data} = await statemachineStore.getEntityParentClassesAndInterfaces(props.entityClassName);
//   entityParentClassesAndInterfaces.value = data;
// }


function getParameters() {
  const criteriaChecker = criteriacheckersList.value.find((item) => {
    return item.name === form.value.criteriaChecker;
  });

  if (criteriaChecker) {
    return criteriaChecker.parameters.map((p: any) => {
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


const criteriacheckersListComputed = computed(() => {
  return criteriacheckersList.value
    .map((p) => ({value: p.name, label: p.name.split(".").pop()}));
});

watch(() => props.criteriaId, async () => {
  if (isNew.value) return;
  try {
    isLoading.value = true;
    const entityClassName = isRuntime.value ? props.entityClassName : undefined;
    const {data} = await statemachineStore.getCriteria(props.persistedType, props.criteriaId, entityClassName);
    form.value = data;

    configDefinition.aliasDefs = form.value.aliasDefs;

    if (form.value && form.value.condition && form.value.condition.conditions) {
      const aliasesArr = form.value.aliasDefs.map((el) => el.name);
      let colPaths: string[] = [];
      colPaths = functionGetAllPathsFromCriteria(form.value.condition.conditions, aliasesArr);
      if (colPaths.length > 0) {
        const {data: colDefs} = await statemachineStore.getCriteriaDefs({
          rootClass: props.entityClassName,
          colPaths
        });
        form.value.colDefs = colDefs;
        configDefinition.colDefs = form.value.colDefs;
      }
    }
  } finally {
    isLoading.value = false;
  }
}, {immediate: true});

watch(
  () => form.value.criteriaChecker,
  () => {
    if (isNew.value) {
      form.value.parameters = getParameters();
    }
  },
  {immediate: true, deep: true}
);

watch(() => form.value.parameters, () => {
  form.value = HelperProcesses.format(form.value);
});
</script>

<style lang="scss" scoped>
.wrapper-criteria {
  width: 100%;
}

.wrapper-title {
  display: flex;
  align-items: center;

  label {
    margin: 0 !important;
  }
}
</style>

<template>
  <div class="transition-form">
    <el-form :model="form" ref="formRef" :rules="rules" label-width="auto" label-position="top">
      <div class="wrap-title">
        <h2>{{ pageTitle }}</h2>
        <div class="wrap-toggle">
          <span>Active</span>
          <el-switch :disabled="isRuntime" v-model="form.active"/>
        </div>
        <div class="wrap-toggle">
          <el-switch
            :disabled="isRuntime"
            v-model="form.automated"
            active-text="Automated"
            inactive-text="Manual"
          />
        </div>
      </div>
      <el-row :gutter="100">
        <el-col :span="12">
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

          <el-form-item v-if="workflow" label="Documentation Link">
            <template v-if="workflow.metaData && workflow.metaData.documentLink">
              <div>
                <a :href="workflow.metaData.documentLink" target="_blank">{{ workflow.metaData.documentLink }}</a>
              </div>
            </template>
            <template v-else> -</template>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item prop="startStateId" label="Start State">
            <el-select
              filterable
              :disabled="isRuntime"
              v-model="form.startStateId"
              placeholder="Select"
              size="large"
            >
              <el-option
                v-for="item in startStatesList"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
            <div class="hint" v-if="form.startStateId">
              {{ startStateDescription }}
            </div>
          </el-form-item>

          <template v-if="isAddNewState">

            <el-form-item prop="newStateFrom.name" :rules="[
                          {
                            required: true,
                            message: 'Please input new state name',
                            trigger: 'blur',
                          },
                          {
                            validator: checkUniqNameForState,
                            trigger: 'blur'
                          },
                          ]"
                          label="New state name">
              <el-input :disabled="isRuntime" v-model="form.newStateFrom.name"/>
            </el-form-item>

            <el-form-item label="New state description">
              <el-input
                :disabled="isRuntime"
                v-model="form.newStateFrom.description"
                :autosize="{ minRows: 3, maxRows: 6 }"
                type="textarea"
              />
            </el-form-item>

            <div class="create-new-box">
              <div class="description">or</div>
              <div class="action">
                <el-button :disabled="isRuntime" @click="cancelAddNewState" type="danger">
                  Discard and go back to selection
                </el-button>
              </div>
            </div>
          </template>
          <template v-else>
            <el-form-item prop="endStateId" :rules="{
                            required: true,
                            message: 'Please select end state name',
                            trigger: 'blur',
                          }" label="End State">
              <el-select
                filterable
                :disabled="isRuntime"
                v-model="form.endStateId"
                placeholder="Select"
                size="large"
              >
                <el-option
                  v-for="item in endStatesList"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                />
              </el-select>
            </el-form-item>

            <div class="create-new-box">
              <div class="description">or</div>
              <div class="action">
                <el-button :disabled="isRuntime" @click="addNewState">
                  <font-awesome-icon icon="plus"/>
                  Create new State
                </el-button>
              </div>
            </div>
          </template>

        </el-col>
      </el-row>

      <el-row :gutter="10">
        <el-col :span="12">
          <el-form-item class="wrap-criteria" label="Criteria">
            <el-select
              :disabled="isRuntime"
              v-model="form.criteriaIds"
              multiple
              filterable
              placeholder="Select"
              clearable
            >
              <el-option
                v-for="item in criteriaList"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col v-if="!isRuntime" :span="12">
          <div class="actions">
            <div>
              <el-button :disabled="isRuntime" @click="addNewCriteria" size="large" type="primary">
                Add new
                <font-awesome-icon icon="plus"/>
              </el-button>
            </div>
            <div class="wrapper-selected-items-link" v-if="form.criteriaIds.length > 0">
              <span class="edit-title">Edit: </span>
              <el-popover v-for="(criteriaId, index) in form.criteriaIds" placement="top-start"
                          :title="getCriteriaById(criteriaId).label"
                          trigger="hover"
                          :content="getCriteriaById(criteriaId).description || '-'">
                <template #reference>
                  <span>
                  <el-link @click="onViewSelectedCriteria(criteriaId)" class="selected-items-link"
                           type="primary">
                    {{ getCriteriaById(criteriaId).label }}
                  </el-link>
                  <span v-if="form.criteriaIds.length - 1 !== index" class="delimiter"> | </span>
                  </span>
                </template>
              </el-popover>
            </div>
          </div>
        </el-col>
      </el-row>

      <el-row :gutter="10">
        <el-col :span="12">
          <el-form-item class="wrap-process" label="Process">
            <el-select
              :disabled="isRuntime"
              v-model="form.endProcessesIds"
              multiple
              filterable
              placeholder="Select"
              clearable
              value-key="persistedId"
            >
              <el-option
                v-for="item in processesList"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col v-if="!isRuntime" :span="12">
          <div class="actions">
            <div>
              <el-button :disabled="isRuntime" @click="addNewProcess" size="large" type="primary">
                Add new
                <font-awesome-icon icon="plus"/>
              </el-button>
            </div>
            <div class="wrapper-selected-items-link" v-if="form.endProcessesIds.length > 0">
              <span class="edit-title">Edit: </span>
              <el-popover v-for="(processId, index) in form.endProcessesIds" placement="top-start"
                          :title="getProcessById(processId).label"
                          trigger="hover"
                          :content="getProcessById(processId).description || '-'">
                <template #reference>
                  <span>
                  <el-link @click="onViewSelectedProcess(processId)" class="selected-items-link"
                           type="primary">
                    {{ getProcessById(processId).label }}
                  </el-link>
                  <span v-if="form.endProcessesIds.length - 1 !== index" class="delimiter"> | </span>
                  </span>
                </template>
              </el-popover>
            </div>
          </div>
        </el-col>
      </el-row>

      <el-button @click="onCancel">
        Cancel
      </el-button>
      <template v-if="!isNew">
        <el-button :disabled="isRuntime" :loading="isLoadingUpdateContinue" @click="onUpdateContinueEditing" type="primary">
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
        <el-button :disabled="isRuntime" :loading="isLoadingCreate" type="primary" @click="onCreate">
          Create
        </el-button>
      </template>

    </el-form>

    <!--    New Criteria-->
    <el-dialog :close-on-click-modal="false" append-to-body title="Criteria" v-model="dialogVisibleCriteria"
               width="90%">
      <CriteriaForm v-if="dialogVisibleCriteria && props.entityClassName"
                    :criteriaId="selectedCriteriaId"
                    :entityClassName="props.entityClassName"
                    :persistedType="persistedType"
                    mode="embedded"
                    @submitted="onSubmittedCriteria"
      />
    </el-dialog>

    <!--    New Process-->
    <el-dialog :close-on-click-modal="false" append-to-body title="Process" v-model="dialogVisibleProcess" width="90%">
      <ProcessForm v-if="dialogVisibleProcess"
                   :processId="selectedProcessId"
                   :entityClassName="props.entityClassName"
                   :persistedType="persistedType"
                   mode="embedded"
                   @submitted="onSubmittedProcess"/>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import {computed, ref, reactive, watch, onMounted} from "vue";
import CriteriaForm from "@cyoda/ui-lib/src/components-library/patterns/CriteriaForm/CriteriaForm.vue";
import ProcessForm from "@cyoda/ui-lib/src/components-library/patterns/ProcessForm/ProcessForm.vue";
import {ElNotification, FormRules} from "element-plus";
import {useStatemachineStore} from "@cyoda/statemachine/src/stores/statemachine";

const newStateDefault = {
  "description": "",
  "entityClassName": "",
  "name": "",
}

const rules = reactive<FormRules<RuleForm>>({
  name: [
    {required: true, message: 'Please input name', trigger: 'blur'},
  ],
  startStateId: [
    {required: true, message: 'Please select start state name', trigger: 'blur'},
  ]
});

const defaultForm = {
  "@bean": "com.cyoda.core.model.stateMachine.dto.TransitionDto",
  "name": "",
  "description": "",
  "startStateId": null,
  "endStateId": null,
  "active": true,
  "automated": true,
  "criteriaIds": [],
  "endProcessesIds": [],
  "entityClassName": null,
  "workflowId": null,
};
const form = ref(JSON.parse(JSON.stringify(defaultForm)));

const props = defineProps({
  workflowId: {
    default: null,
  },
  persistedType: {
    default: "",
  },
  transitionId: {
    default: null,
  },
  entityClassName: {
    default: "",
  }
})

const emit = defineEmits(["update:transitionTitle", "update:workflowTitle", "submitted", "submitted", "submitted", "canceled"]);
const criteriaList = ref([]);
const processesList = ref([]);
const statesList = ref([]);
const statemachineStore = useStatemachineStore();
const dialogVisibleCriteria = ref<boolean>(false);
const selectedCriteriaId = ref<string>("");
const dialogVisibleProcess = ref(false);
const selectedProcessId = ref<string>("");
const formRef = ref(null);
const isRuntime = computed(() => {
  return props.persistedType === 'runtime';
});
const isLoadingCreateAddAnother = ref(false);
const isLoadingUpdateContinue = ref(false);
const isLoadingUpdate = ref(false);
const isLoadingCreate = ref(false);

async function loadCriterias() {
  const {data} = await statemachineStore.getCriteriaList(props.entityClassName);
  criteriaList.value = data.map((el) => {
    return {
      value: el.id,
      label: el.name,
      description: el.description,
    }
  })
}

async function loadProcesses() {
  const {data} = await statemachineStore.getProcessesList(props.entityClassName);
  processesList.value = data.map((el) => {
    return {
      value: el.id,
      label: el.name,
      description: el.description,
    }
  }).filter((el) => el.value.persistedId)
}

function getCriteriaById(id) {
  return criteriaList.value.find((el) => el.value === id) || {};
}

function getProcessById(idObj) {
  let id = typeof idObj === "object" ? idObj.persistedId : idObj;
  return processesList.value.find((el) => el.value.persistedId === id) || {};
}


async function loadStates() {
  const {data} = await statemachineStore.getStatesList(props.persistedType, props.workflowId);
  statesList.value = data.Data;
}

onMounted(() => {
  loadCriterias();
  loadProcesses();
  if (!isRuntime.value) {
    loadStates();
  }
})

const isNew = computed(() => {
  return props.transitionId === 'new' || props.transitionId === '';
});
const isAddNewState = ref(false);
const pageTitle = computed(() => {
  return isNew.value ? `New transition ${form.value.name}` : `Transition ${form.value.name}`;
});

const startStateDescription = computed((el) => {
  const state = statesList.value.find((el) => el.id === form.value.startStateId);
  if (!state) return;
  return state.description;
});

const startStatesList = computed(() => {
  const data = statesList.value.map((el) => {
    return {
      value: el.id,
      label: el.name
    };
  });

  if (!data.find((el) => el.value === "noneState")) {
    data.unshift({
      value: "noneState",
      label: "NONE"
    });
  }

  return data;
});

const endStatesList = computed(() => {
  return statesList.value.map((el) => {
    return {
      value: el.id,
      label: el.name
    };
  });
});


const backLink = computed(() => {
  return `/statemachine/workflow/${props.workflowId}?persistedType=${props.persistedType}&entityClassName=${props.entityClassName}#transitions-list`;
});


function addNewCriteria() {
  selectedCriteriaId.value = "";
  dialogVisibleCriteria.value = true;

}

function onViewSelectedCriteria(criteriaId: any) {
  selectedCriteriaId.value = criteriaId;
  dialogVisibleCriteria.value = true;
}

function onViewSelectedProcess(idObj) {
  const id = typeof idObj === "object" ? idObj.persistedId : idObj;
  selectedProcessId.value = id;
  dialogVisibleProcess.value = true;
}

function addNewProcess() {
  selectedProcessId.value = "";
  dialogVisibleProcess.value = true;
}

async function onSubmittedCriteria(params: any) {
  dialogVisibleCriteria.value = false;
  await loadCriterias();
  if (params && params.id) {
    form.value.criteriaIds.push(params.id);
  }
}

async function onSubmittedProcess(params: any) {
  dialogVisibleProcess.value = false;
  await loadProcesses();
  if (params && params.id) {
    const obj = getProcessById(params.id);
    form.value.endProcessesIds.push(obj.value);
  }
}

function addNewState() {
  isAddNewState.value = true;
  form.value.endStateId = "noneState";
  form.value.newStateFrom = JSON.parse(JSON.stringify(newStateDefault));
  form.value.newStateFrom.entityClassName = props.entityClassName;
}

function cancelAddNewState() {
  form.value.endStateId = null;
  isAddNewState.value = false;
}

function onCancel() {
  emit("canceled", {
    url: backLink.value
  });
}

async function onUpdateContinueEditing() {
  try {
    isLoadingUpdateContinue.value = true;
    await update();
    ElNotification({
      title: 'Success',
      message: 'Data was successfully saved',
      type: 'success',
    })
    emit("submitted");
  } finally {
    isLoadingUpdateContinue.value = false;
  }
}

async function onUpdate() {
  try {
    isLoadingUpdate.value = true;
    if (await update()) {
      emit("submitted", {
        action: "update",
        url: backLink.value
      });
    }
  } finally {
    isLoadingUpdate.value = false;
  }
}

const formData = computed(() => {
  const formData = JSON.parse(JSON.stringify(form.value));
  formData.entityClassName = props.entityClassName;
  formData.workflowId = props.workflowId;
  delete formData.newStateFrom;
  return formData;
});

const newStateFromData = computed(() => {
  return JSON.parse(JSON.stringify(form.value.newStateFrom));
});

async function onCreateAddAnother() {
  try {
    isLoadingCreateAddAnother.value = true;
    const id = await create();
    if (id) {
      ElNotification({
        title: 'Success',
        message: 'The new transition has been successfully created',
        type: 'success',
      })

      reset();

      emit("submitted", {
        refreshChart: true,
        action: "сreate-add-another",
        id
      });
      loadStates();
    }
  } finally {
    isLoadingCreateAddAnother.value = false;
  }
}

function reset() {
  form.value = JSON.parse(JSON.stringify(defaultForm));
  isAddNewState.value = false;
}

async function createNewState(id) {
  await statemachineStore.postState(props.persistedType, props.workflowId, id, newStateFromData.value)
}

async function create() {
  try {
    await formRef.value.validate();
    const {data} = await statemachineStore.postTransition(props.persistedType, props.workflowId, formData.value);
    const id = data.Data.id;
    if (id) {
      if (isAddNewState.value) {
        await createNewState(id);
      }
      return id;
    }
  } catch (e) {
  }
}


async function update() {
  try {
    await formRef.value.validate();
    const {data} = await statemachineStore.putTransition(props.persistedType, props.workflowId, formData.value.id, formData.value);
    const id = data.Data.id;
    if (id) {
      if (isAddNewState.value) {
        await createNewState(id);
      }
      return id;
    }
  } catch (e) {
  }
}

async function onCreate() {
  try {
    isLoadingCreate.value = true;
    const id = await create();
    if (id) {
      emit("submitted", {
        refreshChart: true,
        action: "create",
        url: backLink.value,
        id
      });
    }
  } finally {
    isLoadingCreate.value = false;
  }
}

async function checkUniqNameForState(rule: any, value: any, callback: any) {
  const {data} = await statemachineStore.getStatesList(props.persistedType, props.workflowId);
  const names = data.Data.map((el: any) => el.name);
  if (names.indexOf(value.trim()) > -1) {
    return callback(new Error(`This name is not unique`));
  }
  callback();
}

watch(() => props.transitionId, async () => {
  if (!isNew.value) {
    const {data} = await statemachineStore.getTransition(props.persistedType, props.workflowId, props.transitionId);
    form.value = data.Data;
  }
}, {immediate: true});

</script>

<style lang="scss">
.transition-form {
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

  .actions {
    margin-top: 30px;
  }

  .wrap-criteria, .wrap-process {
    .inner-item {
      flex: 1;
      margin-right: 10px;
    }

    .el-form-item__content {
      display: flex;
      flex-wrap: nowrap;
      margin-right: 10px;
      align-items: start;
    }
  }

  .create-new-box {
    display: flex;
    width: 100%;
    align-items: center;

    .description {
      margin-left: auto;
      margin-right: 10px;
    }
  }

  .hint {
    margin-top: 10px;
    color: #a1a0a0;
    font-size: 12px;
    line-height: 12px;
  }

  .wrapper-selected-items-link {
    margin-top: 5px;

    .edit-title, .el-link__inner {
      font-size: 16px;
      font-weight: normal;
    }

    .el-link__inner {
      position: relative;
      top: -2px;
    }
  }
}
</style>

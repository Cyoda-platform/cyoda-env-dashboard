<template>
  <div class="workflow-form">
    <el-form :model="form" ref="formRef" :rules="rules" label-width="auto" label-position="top"
             style="max-width: 600px">
      <div class="wrap-title">
        <h2>{{ pageTitle }}</h2>
        <div class="wrap-toggle">
          <span>Active</span>
          <el-switch :disabled="isRuntime" v-model="form.active"/>
        </div>
        <template v-if="false">
          |
          <div class="wrap-toggle">
            <span>Decision Tree</span>
            <el-switch :disabled="isRuntime" v-model="form.useDecisionTree"/>
          </div>
        </template>
      </div>
      <el-tabs v-model="activeTab" v-loading="isLoading">
        <el-tab-pane label="Settings" name="settings">
          <el-form-item label="Entity Class Name" prop="entityClassName">
            <el-select @change="onChangeEntityClassName" :disabled="!isNew" clearable filterable
                       v-model="form.entityClassName"
                       placeholder="Select entity">
              <el-option
                  v-for="workflowEnabledType in workflowEnabledTypesOptions"
                  :key="workflowEnabledType.value"
                  :label="workflowEnabledType.label"
                  :value="workflowEnabledType.value"
              />
            </el-select>
          </el-form-item>
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

          <el-form-item label="Documentation Link" prop="documentLink">
            <el-input :disabled="isRuntime" v-model="form.documentLink"/>
          </el-form-item>

          <el-form-item label="Criteria" prop="criteriaIds">
            <el-select
                :disabled="isRuntime"
                filterable
                clearable
                v-model="form.criteriaIds"
                multiple
                placeholder="Select"
                :loading="isLoadingCriteriaList"
            >
              <el-option
                  v-for="item in criteriaList"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
              />
            </el-select>
          </el-form-item>
        </el-tab-pane>

        <el-tab-pane v-if="form.useDecisionTree" label="Decision Tree" name="decisionTree">
          <div class="actions">
            <el-button @click="onAddNewDecisionTree" :disabled="isRuntime" :loading="isLoading" type="primary">
              <font-awesome-icon icon="plus"/>
              Add
            </el-button>
          </div>

          <!--          <TransitionDecisionTree-->
          <!--            v-for="(decisionTree, index) in form.decisionTrees"-->
          <!--            :key="index"-->
          <!--            :index="index"-->
          <!--            @delete="onDelete(index)"-->
          <!--            :workflowType="form.entityClassName"-->
          <!--            :workflowId="workflowId"-->
          <!--            :workflowTypePersisted="persistedType"-->
          <!--            :decisionTree="decisionTree"/>-->
        </el-tab-pane>
      </el-tabs>

      <el-button :disabled="isRuntime" :loading="isLoading" @click="onClickSave" type="primary" class="submit-btn">
        Save
      </el-button>
      <AIChatBot
          v-if="isChatBotEnabled"
          :disabled="isNew"
          v-model:ready="isChatBotReady"
          ref="aIChatBotRef"
          :id="chatBotId"
          :disabledReturnObject="disabledReturnObject"
          :initialFn="initialFn"
          :submitMessageFn="submitMessageFn"
          :axiosChatBotController="axiosChatBotController"
          defaultReturnObject="random"
          category="workflows"
      />

    </el-form>
  </div>
</template>

<script setup lang="ts">
import {onBeforeUnmount, onMounted, reactive, ref, watch} from "vue";
import {computed} from "vue";
import {useRoute, useRouter} from "vue-router";
import {useStatemachineStore} from "../stores/statemachine";
import {getPersistedType} from "../helpers/HelperData";
import type {FormRules} from "element-plus";
import eventBus from "@cyoda/ui-lib/src/plugins/eventBus";
import AIChatBot from "@cyoda/ui-lib/src/components-library/elements/AIChatBot/AIChatBot.vue";
import HelperFeatureFlags from "@cyoda/ui-lib/src/helpers/HelperFeatureFlags";
import {handlerError} from "@cyoda/ui-lib/src/helpers/HelperChatbot";
import {v4 as uuidv4, validate as isValidUUID} from "uuid";
import {useChatbotStore} from "@cyoda/ui-lib/src/stores/chatbot";
import HelperEntities from "@cyoda/ui-lib/src/helpers/HelperEntities.ts";

const isChatBotEnabled = HelperFeatureFlags.isChatBotEnabled();
const statemachineStore = useStatemachineStore();
const chatbotStore = useChatbotStore();

const props = defineProps({
  workflowId: {
    default: null,
  },
  persistedType: {
    default: "",
  }
})

const route = useRoute();
const router = useRouter();
const isLoading = ref(false);
const workflowEnabledTypes = ref([]);
const aIChatBotRef = ref(null);
const isChatBotReady = ref(false);
const isLoadingCriteriaList = ref(false);

async function loadWorkflowsData() {
  const {data} = await statemachineStore.getWorkflowEnabledTypes();
  workflowEnabledTypes.value = data;
}

loadWorkflowsData();

const workflowEnabledTypesOptions = computed(() => {
  return HelperEntities.getOptionsFromData(workflowEnabledTypes.value);
})

onMounted(() => {
  eventBus.$on('workflow:reload', loadWorkflow);
  if (route.query.entityClassName) loadCriteriaList(route.query.entityClassName);
})

onBeforeUnmount(() => {
  eventBus.$off('workflow:reload', loadWorkflow)
})


const form = ref({
  "@bean": "com.cyoda.core.model.stateMachine.dto.WorkflowDto",
  "name": "",
  "metaData": {"documentLink": ""},
  "description": "",
  "active": false,
  "useDecisionTree": false,
  "decisionTrees": [],
  "criteriaIds": [],
  "entityClassName": route.query.entityClassName,
});

const formRef = ref(null);

const rules = reactive({
  name: [
    {required: true, message: 'Name is required', trigger: 'blur'},
  ],
  entityClassName: [
    {required: true, message: 'Entity Class Name is required', trigger: 'blur'},
  ],
  documentLink: [
    {type: 'url', message: 'Documentation Link must be valid URL', trigger: 'blur'},
  ],
})

const activeTab = ref<string>("settings");

const isNew = computed(() => {
  return !props.workflowId;
})

const pageTitle = computed(() => {
  return isNew.value ? `New workflow ${form.value.name}` : `Workflow ${form.value.name}`;
});

const isRuntime = computed(() => {
  return props.persistedType === 'runtime';
});

const criteriaList = ref([]);

async function loadCriteriaList(entityClassName: string) {
  try {
    isLoadingCriteriaList.value = true;
    const {data} = await statemachineStore.getCriteriaList(entityClassName);
    criteriaList.value = data.map((el) => {
      return {
        value: el.id,
        label: el.name,
      }
    })
  } finally {
    isLoadingCriteriaList.value = false;
  }
}

function onAddNewDecisionTree() {
  form.decisionTrees.value.push({
    "@bean": "com.cyoda.core.model.stateMachine.dto.TransitionDecisionTreeDto",
    startState: "",
    node: {
      type: "LEAF"
    }
  });
}

function onClickSave() {
  formRef.value.validate(async (isValid) => {
    if (isValid) {
      isLoading.value = true;
      try {
        if (isNew.value) {
          const {data} = await statemachineStore.postWorkflow(form.value);
          if (isChatBotReady.value) {
            await aIChatBotRef.value.updateId(chatBotId.value, data.id);
            aIChatBotRef.value.saveChat(data.id);
          }
          router.push(`/statemachine/workflow/${data.id}?persistedType=${getPersistedType(data.persisted)}&entityClassName=${form.value.entityClassName}`);
        } else {
          if (isChatBotReady.value) aIChatBotRef.value.saveChat(chatBotId.value);
          await statemachineStore.putWorkflow(form.value);
        }
      } finally {
        isLoading.value = false;
      }
    }
  })
}

function onDelete(index: number) {
  form.value.decisionTrees.splice(index, 1);
}

async function loadWorkflow() {
  const {data} = await statemachineStore.getWorkflow(props.persistedType, props.workflowId);
  if (!data.decisionTrees) data.decisionTrees = [];
  form.value = data;
}

// Chatbot
const chatBotId = computed(() => {
  return props.workflowId || uuidv4();
});

function initialFn() {
  return chatbotStore.getWorkflowsInitial(chatBotId.value);
}

const disabledReturnObject = computed(() => {
  const list = [];
  if (!form.value.entityClassName) {
    list.push('workflow');
    list.push('workflow-from-url');
    list.push('sources');
    list.push('random');
  }

  if (!form.value.id) {
    list.push('transitions');
  }

  return list;
})

let axiosChatBotController = ref(null);


async function submitMessageFn({message, key, file}, element) {
  try {
    axiosChatBotController.value = new AbortController();

    let request = {}
    if (['workflow', 'workflow-from-url', 'sources', 'random', 'save'].includes(key)) {
      request = {
        question: message,
        return_object: key,
        chat_id: chatBotId.value,
        class_name: form.value.entityClassName,
      }
    } else if (['transitions'].includes(key)) {
      request = {
        question: message,
        return_object: key,
        chat_id: chatBotId.value,
        class_name: form.value.entityClassName,
        workflow_id: form.value.id,
      }
    } else if (['workflow-from-image'].includes(key)) {
      request['json_data'] = JSON.stringify({
        question: message,
        return_object: key,
        chat_id: chatBotId.value,
        class_name: form.value.entityClassName,
      });
      if (file) request['file'] = file;
    }

    let {data} = await chatbotStore.getWorkflowsAiChat(request, axiosChatBotController.value.signal);

    if (!data.success) {
      element.repeats.push([{
        type: 'text',
        text: data.message,
      }])
      return;
    }


    if (['random', 'sources'].includes(key)) {
      element.repeats.push([{
        type: 'text',
        text: data.message,
      }])
    }
    if (['workflow', 'workflow-from-url', 'save'].includes(key)) {
      data = await workflowAnswerHandler(data);
      element.repeats.push([{
        type: 'text',
        text: data.message,
      }])
    } else if (['transitions'].includes(key)) {
      eventBus.$emit('transitions:reload');
      data = await workflowAnswerHandler(data);
      element.repeats.push([{
        type: 'text',
        text: data.message,
      }])
    } else if (['workflow-from-image'].includes(key)) {
      data = await workflowAnswerHandler(data);
      element.repeats.push([{
        type: 'text',
        text: data.message,
      }])
    }

  } catch (e) {
    handlerError(e, element);
  } finally {
    axiosChatBotController.value = null;
  }
}

async function workflowAnswerHandler(data) {
  const uuidPattern = /= (((.*)-?){5})$/;
  const match = data.message.match(uuidPattern);
  const uuid = match && match[1];
  if (uuid && isValidUUID(uuid)) {
    const {data: workflow} = await statemachineStore.getWorkflow('persisted', uuid);
    const link = `[${uuid}](/statemachine/workflow/${workflow.id}?persistedType=${getPersistedType(workflow.persisted)}&entityClassName=${workflow.entityClassName})`;
    data.message = data.message.replace(uuid, link);
  }
  return data;
}

function onChangeEntityClassName() {
  form.value.criteriaIds = [];
  criteriaList.value = [];
  if (form.value.entityClassName) loadCriteriaList(form.value.entityClassName);
}


watch(isNew, () => {
  if (isNew.value) return;
  loadWorkflow();
}, {immediate: true});

watch(
    () => form.value.useDecisionTree,
    (val: boolean) => {
      if (val && form.value.decisionTrees.length === 0) {
        form.value.decisionTrees.push({
          "@bean": "com.cyoda.core.model.stateMachine.dto.TransitionDecisionTreeDto",
          startState: "",
          node: {
            type: "LEAF"
          }
        });
      }
    },
    {immediate: true, deep: true}
);

</script>

<style lang="scss">
.workflow-form {
  .wrap-title {
    display: flex;
    align-items: center;
    gap: 10px;

    h2 {
      margin: 0;
    }

    .wrap-toggle {
      margin-left: 10px;
      position: relative;
      top: 2px;

      span {
        margin-right: 5px;
      }
    }

    .el-form-item {
      margin: 0;
    }
  }
}
</style>

<template>
  <div class="trino-edit">
    <div class="card">
      <div class="card-body">
        <h4>Edit Schema</h4>
        <el-alert
          v-if="isError"
          class="error-alerts"
          title="Errors"
          type="error"
          :closable="false"
          show-icon>
          Please check the tables. There is an error in one of the fields.
        </el-alert>
        <el-form ref="formRef" :model="schemaConfigDto" :rules="rules" label-width="120px">
          <el-form-item
            label="Schema Name"
            prop="schemaName"
          >
            <div class="inner-box">
              <div class="input">
                <el-input @input="toLowerCaseField(schemaConfigDto, 'schemaName')"
                          v-model="schemaConfigDto.schemaName"/>
              </div>
              <div>
                <el-button @click="onAddTables" type="warning">
                  Manage tables
                  <font-awesome-icon icon="table"/>
                </el-button>
              </div>
            </div>
          </el-form-item>

          <el-divider/>

          <div v-show="isExistTables" ref="actionFilterRef" class="action-filter">
            <el-input v-model="form.filter" style="width: 250px" placeholder="Filter"/>
            <el-badge :value="hiddenTablesCount" :hidden="!hiddenTablesCount" class="item">
              <el-button @click="onOpenTablesHidden">
                <font-awesome-icon icon="eye"/>
              </el-button>
            </el-badge>
          </div>

          <el-tabs v-show="tablesComputed.length>0" v-model="activeTab" tab-position="left">
            <template v-for="(table, index) in tablesComputed" :key="index">
              <el-tab-pane :label="table.tableName">
                <el-form-item label="Table Name">
                  <div class="inner-box">
                    <div class="input">
                      <el-form-item
                        label-width="auto"
                        :prop="'tables.'+index+'.tableName'"
                        :error="validateTableNameField(table.tableName)"
                        :show-message="!!validateTableNameField(table.tableName)"
                      >
                        <el-input @input="toLowerCaseField(table, 'tableName')" v-model="table.tableName"/>
                      </el-form-item>
                    </div>
                    <div class="actions-buttons">
                      <el-button type="danger" @click="onClickHideTable(table)">
                        <font-awesome-icon type="danger" icon="trash"/>
                      </el-button>

                      <el-badge :value="hiddenFieldsCount(allFields(table.fields))"
                                :hidden="!hiddenFieldsCount(allFields(table.fields))" class="item">
                        <el-button class="hidden-btn-table" @click="onOpenFieldsHidden(allFields(table.fields))">
                          <font-awesome-icon icon="eye"/>
                        </el-button>
                      </el-badge>
                    </div>
                  </div>
                </el-form-item>
                <el-form-item label="Uniformed Path">
                  <el-input disabled readonly v-model="table.uniformedPath"/>
                </el-form-item>
                <TrinoEditTable :key="table.modelUpdateDate" :table="table" :allFields="allFields(table.fields)"
                                :isExistFlatten="checkIsExistFlatten(table.fields)" fieldsName="fields"
                                :basePropPath="`tables.${index}`"/>
              </el-tab-pane>
            </template>
          </el-tabs>
        </el-form>
        <div class="actions">
          <el-button :loading="isSaveLoading" @click="onClickSave" type="primary">
            Save Schema
          </el-button>
          <el-tooltip :show-after="1000" :disabled="!isNew" effect="dark" content="Please save before use" placement="top">
          <AIChatBot
            v-if="isChatBotEnabled"
            v-model:ready="isChatBotReady"
            ref="aIChatBotRef"
            :id="chatBotId"
            :disabled="isNew"
            :initialFn="initialFn"
            :submitMessageFn="submitMessageFn"
            :axiosChatBotController="axiosChatBotController"
            defaultReturnObject="random"
            category="trino"
          />
          </el-tooltip>
        </div>
      </div>
    </div>
    <TrinoModelsPopUp
      @change="onChangeModelsPopUp"
      @deleteTables="onDeleteTables"
      @updateTables="onUpdateTables"
      :tables="schemaConfigDto?.tables"
      ref="trinoModelsPopUpRef"/>
    <TrinoHiddenTablesPopUp :tables="schemaConfigDto?.tables" ref="trinoHiddenTablesPopUpRef"/>
    <TrinoHiddenFieldsPopUp ref="trinoHiddenFieldsPopUpRef"/>
  </div>
</template>

<script setup lang="ts">
import {useSqlSchemaStore} from "../../stores/sql-schema";
import {useRoute, useRouter} from "vue-router";
import {computed, nextTick, onMounted, reactive, ref, watch} from "vue";
import TrinoEditTable from "../../views/Trino/TrinoEdit/TrinoEditTable.vue";
import TrinoModelsPopUp from "../../views/Trino/TrinoModelsPopUp.vue";
import {FontAwesomeIcon} from "@fortawesome/vue-fontawesome";
import {ElMessageBox, ElNotification} from "element-plus";
import AIChatBot from "@cyoda/ui-lib/src/components-library/elements/AIChatBot/AIChatBot.vue";
import {handlerError} from "@cyoda/ui-lib/src/helpers/HelperChatbot";
import {useChatbotStore} from "@cyoda/ui-lib/src/stores/chatbot";
import HelperFeatureFlags from "@cyoda/ui-lib/src/helpers/HelperFeatureFlags";
import {v4 as uuidv4} from "uuid";
import TrinoHiddenTablesPopUp from "./TrinoHiddenTablesPopUp.vue";
import TrinoHiddenFieldsPopUp from "./TrinoHiddenFieldsPopUp.vue";

const aIChatBotRef = ref(null);
const sqlSchemaStore = useSqlSchemaStore();
const route = useRoute();
const router = useRouter();
const schemaConfigDto = ref({
  "id": null,
  "schemaName": "",
  "tables": []
});
const activeTab = ref('0');
const trinoModelsPopUpRef = ref(null);
const trinoHiddenTablesPopUpRef = ref(null);
const trinoHiddenFieldsPopUpRef = ref(null);
const formRef = ref(null);
const chatbotStore = useChatbotStore();
const isChatBotReady = ref(false);
const isChatBotEnabled = HelperFeatureFlags.isChatBotEnabled();
const idTmp = uuidv4();
const isSaveLoading = ref(false);

const form = reactive({
  filter: ""
});

const reqExprForFields = /^[a-z_][a-z0-9_]{0,127}$/;
const errorMessageForReqExpr = 'The value must start with a letter, followed by letters, digits, or underscores'

function validateFieldName(value) {
  if (!value) return false;
  const isMatch = value.match(reqExprForFields);
  if (!isMatch) {
    return errorMessageForReqExpr;
  }
  return false;
}

function validateSchemaName(rule: any, value: any, callback: any) {
  if (validateFieldName(value)) {
    return callback(new Error(validateFieldName(value)));
  }
  callback();
}

function validateTableNameField(value: any) {
  const fieldNames = schemaConfigDto.value.tables.filter((el) => !el.hidden).filter((el) => el.tableName === value);
  if (fieldNames.length > 1) {
    return 'The "Table Name" field must be unique';
  }

  if (validateFieldName(value)) {
    return validateFieldName(value)
  }
}

const rules = reactive({
  schemaName: [
    {required: true, message: 'Please input Schema Name', trigger: 'change'},
    {trigger: 'change', validator: validateSchemaName}
  ],
});

const actionFilterRef = ref(null);
const isError = computed(() => {
  return formRef.value?.fields.some((field) => {
    return field.validateState === 'error';
  })
})

const isNew = computed(() => {
  return !route.params.id;
});

onMounted(() => {
  loadData();
})

async function loadData() {
  if (isNew.value) return;
  const {data} = await sqlSchemaStore.getSchemaById(route.params.id);
  schemaConfigDto.value = data;
  schemaConfigDto.value.tables.forEach((el) => {
    el.tableName = el.tableName.toLowerCase();
  });
  schemaConfigDto.value.schemaName = schemaConfigDto.value.schemaName.toLowerCase().replaceAll('-', '_');
}

function onClickSave() {
  formRef.value.validate(async (valid) => {
    isSaveLoading.value = true;
    try {
      const isError = formRef.value.fields.some((field) => {
        return field.validateState === 'error';
      })
      if (!valid || isError) return;
      const {data} = await sqlSchemaStore.saveSchema(schemaConfigDto.value);

      if (isChatBotReady.value) {
        if (isNew.value) {
          await aIChatBotRef.value.updateId(chatBotId.value, data);
        }
        aIChatBotRef.value.saveChat(data);
      }

      router.push('/cyoda-sass/trino');

    } finally {
      isSaveLoading.value = false;
    }
  })
}

function onChangeModelsPopUp(list) {
  const existTables = [];
  for (const item of list) {
    const isExist = schemaConfigDto.value.tables.find((el) => el.tableName.toLowerCase() === item.tableName.toLowerCase());
    if (isExist) {
      existTables.push(`"${item.tableName}"`);
    } else {
      schemaConfigDto.value.tables.push(item);
    }
  }

  if (existTables.length > 0) {
    ElNotification({
      duration: 10_000,
      title: 'Warning',
      message: `Tables ${existTables.join(', ')} were not added because they have duplicate names. Rename them and try again.`,
      type: 'warning',
    })
  }
}

const tablesComputed = computed(() => {
  if (Object.keys(schemaConfigDto.value).length === 0) return {};
  return schemaConfigDto.value.tables.filter((el) => {
    return !form.filter || el.tableName.toLowerCase().includes(form.filter.toLowerCase());
  }).filter((el) => !el.hidden);
});

const isExistTables = computed(() => {
  return schemaConfigDto?.value?.tables.length > 0;
})

const hiddenTablesCount = computed(() => {
  return schemaConfigDto?.value?.tables.filter(el => el.hidden).length || 0;
})

function hiddenFieldsCount(fields) {
  return fields.filter((el) => el.hidden).length;
}

function onAddTables() {
  trinoModelsPopUpRef.value.open();
}

// function onClickRemoveTable(index) {
//   ElMessageBox.confirm(`Do you really want to remove table?`, "Confirm!", {
//     callback: async (action) => {
//       if (action === "confirm") {
//         schemaConfigDto.value.tables.splice(index, 1);
//       }
//     }
//   });
// }

function onClickHideTable(table) {
  table.hidden = true;
}

function allFields(fields: any[]) {
  let allValues: any = [];
  const isExistFlatten = checkIsExistFlatten(fields);
  if (!isExistFlatten) {
    return fields;
  }

  fields.forEach((el) => {
    if (!el.flatten) allValues.push(el);
    if (el.arrayFields) {
      if (allValues.indexOf(el) === -1) allValues.push(el);
      allValues = [...allValues, ...allFields(el.arrayFields)];
    }
  });
  return allValues;
}

function checkIsExistFlatten(fields: any[]) {
  return fields.some((el) => el.flatten);
}

// Chatbot
const chatBotId = computed(() => {
  return isNew.value ? idTmp : route.params.id;
});

function initialFn() {
  return chatbotStore.postTrinoInitial({
    chat_id: chatBotId.value,
    schema_name: encodeURIComponent(schemaConfigDto.value.schemaName.trim())
  });
}

let axiosChatBotController = ref(null);

async function submitMessageFn({message, key}, element) {
  try {
    axiosChatBotController.value = new AbortController();
    let response = null;
    if (key === 'run-query') {
      response = chatbotStore.getTrinoAiChatRunQuery(message, axiosChatBotController.value.signal);
    } else {
      response = chatbotStore.getTrinoAiChat(chatBotId.value, {
        question: message,
        return_object: key,
        chat_id: chatBotId.value,
      }, axiosChatBotController.value.signal);
    }

    const {data} = await response;

    if (!data.success) {
      element.repeats.push([{
        type: 'text',
        text: data.message,
      }])
      return;
    }


    element.repeats.push([{
      type: 'text',
      text: data.message,
    }])

  } catch (e) {
    handlerError(e, element);
  } finally {
    axiosChatBotController.value = null;
  }
}

function toLowerCaseField(field, attr) {
  field[attr] = field[attr].toString().toLowerCase();
}

function onOpenTablesHidden() {
  trinoHiddenTablesPopUpRef.value.open();
}

function onOpenFieldsHidden(fields) {
  trinoHiddenFieldsPopUpRef.value.open(fields);
}

function onDeleteTables(ids) {
  schemaConfigDto.value.tables = schemaConfigDto.value.tables.filter((el) => !ids.includes(el.metadataClassId));
}

async function onUpdateTables({tables, metaId, row}) {
  try {
    row.isLoading = true;
    isSaveLoading.value = true;
    const {data} = await sqlSchemaStore.updateTables(metaId, tables);
    schemaConfigDto.value.tables = schemaConfigDto.value.tables.filter((el) => el.metadataClassId !== metaId);
    data.forEach((el) => {
      schemaConfigDto.value.tables.push(el);
    })
  } finally {
    isSaveLoading.value = false;
    row.isLoading = false;
  }
}

watch(tablesComputed, () => {
  activeTab.value = '0';
})
</script>

<style lang="scss">
.trino-edit {
  .inner-box {
    display: flex;
  }

  h4 {
    font-size: 18px;
    margin-bottom: 15px;
  }

  .flex {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .actions {
    margin-top: 15px;
    text-align: right;
  }

  .el-tabs__item {
    white-space: normal;
    word-break: break-all;
    min-height: 40px;
    height: auto;
  }

  .el-tabs__header.is-left {
    margin-right: 30px !important;
  }

  .el-tabs__nav.is-left {
    width: 320px;
  }

  .el-tabs__content {
    padding-top: 10px;
    padding-right: 10px;
  }

  .el-tabs__header {
    padding-top: 10px;
  }

  .action-filter {
    margin-bottom: 15px;
    display: flex;
    gap: 10px;
  }

  .el-form-item__content {
    .inner-box {
      width: 100%;
      display: flex;
      gap: 16px;
    }

    .input {
      flex: 1;
    }
  }

  .wrapper-inner {
    display: flex;
    align-items: center;
    gap: 5px;
  }

  .error-alerts {
    margin-bottom: 15px;
  }

  .tables-list {
    text-align: right;
  }

  .actions-buttons {
    display: flex;
    gap: 15px;
  }

  .hidden-btn-table {
    position: relative;
    top: -1px;
  }
}
</style>

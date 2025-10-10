<template>
  <el-dialog :close-on-click-modal="false" class="detail-tree-item-editable-form" title="Edit" append-to-body v-model="dialogVisible" width="600px">
    <el-form label-position="top" v-loading="isLoadingFirstTime" ref="form" :model="form" label-width="120px">
      <el-form-item :label="editableField.name">
        <el-select :disabled="isSaveLoading" filterable remote :remote-method="remoteMethod" :loading="isLoading" v-model="form.value" placeholder="Select">
          <el-option v-for="item in options" :key="item.value" :label="item.label" :value="item.value"></el-option>
        </el-select>
      </el-form-item>

      <el-form-item label="Transition">
        <el-select :disabled="isSaveLoading" v-model="form.transition" placeholder="Select">
          <el-option v-for="item in optionsTransitions" :key="item.value" :label="item.label" :value="item.value"></el-option>
        </el-select>
      </el-form-item>
    </el-form>
    <template #footer>
      <span class="dialog-footer">
      <el-button @click="dialogVisible = false">Cancel</el-button>
      <el-button :loading="isSaveLoading" :disabled="isDisableSave" type="primary" @click="onSave">Save</el-button>
    </span>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch } from "vue";

import * as api from "../../../../../api";
import _ from "lodash";
import { Column, ElementUiOption, EntityRequest, IDefinitionContentStreamRequest } from "@cyoda/ui-lib/src/types/types";
import eventBus from "../../../../../plugins/eventBus";

const props = defineProps({
  column: {
    default: () => {
      return {};
    }
  },
  requestClass: {
    default: () => {
      return {};
    }
  },
  editableField: {
    default: () => {
      return {};
    }
  },
  id: {
    default: ""
  },
  currentField: {
    default: ""
  },
  itemValue: {
    default: ""
  }
});

const isDisableSave = computed(() => {
  return !form.value || !form.transition;
});

const dialogVisible = ref<boolean>(false);

const isLoading = ref<boolean>(false);
const isLoadingFirstTime = ref<boolean>(false);
const isSaveLoading = ref<boolean>(false);
let options = reactive([]);
let optionsTransitions = reactive([]);

let conditionConfig = reactive({
  equals: {
    "@bean": "com.cyoda.core.conditions.queryable.Equals",
    operation: "EQUALS"
  },
  contains: {
    "@bean": "com.cyoda.core.conditions.nonqueryable.IContains",
    operation: "CONTAINS"
  }
});

const form = reactive<{
  value: string | number;
  transition: string;
}>({
  value: "",
  transition: ""
});

async function onSave() {
  const fieldId = editableField.fieldId.item;
  const fieldName = editableField.fieldName.item;

  const selectedOption = options.find((el) => el.value === form.value);
  const data: EntityRequest = {
    entityClass: props.requestClass,
    entityId: props.id,
    transition: form.transition,
    transactional: false,
    async: false,
    values: [
      {
        columnPath: fieldId,
        value: selectedOption!.value
      },
      {
        columnPath: fieldName,
        value: selectedOption!.label
      }
    ]
  };
  try {
    isSaveLoading.value = true;
    await api.putEntity(data);
    eventBus.$emit("dialogEntityChangeTransition");
    dialogVisible.value = false;
  } finally {
    isSaveLoading.value = false;
  }
}

async function loadData(configDefinition: IDefinitionContentStreamRequest) {
  try {
    isLoading.value = true;
    const { data } = await api.getStreamData(configDefinition);
    const optionsData = data.rows.map((el) => {
      return {
        value: el.columnsValues[editableField.fieldId.entity],
        label: el.columnsValues[editableField.fieldName.entity]
      };
    });
    options = _.uniqBy(optionsData, "value");
  } finally {
    isLoading.value = false;
  }
}

function remoteMethod(query: string) {
  if (query !== "" && query.length > 2) {
    const configDefinition = getConfigDefinitionRequest("name", query, "contains");
    loadData(configDefinition);
  } else {
    options = [];
  }
}

function getConfigDefinitionRequest(searchByField: string, value: string, operation: "equals" | "contains"): IDefinitionContentStreamRequest {
  const fieldId = editableField.fieldId.entity;
  const fieldName = editableField.fieldName.entity;
  const selectedConditionConfig = conditionConfig[operation];

  return {
    "@bean": "com.cyoda.core.streamdata.StreamDataRequest",
    sdDef: {
      requestClass: editableField.entity,
      rangeCondition: {
        "@bean": "com.cyoda.core.conditions.queryable.GreaterThan",
        fieldName: "creationDate",
        operation: "GREATER_THAN",
        value: {
          "@type": "java.util.Date",
          value: "1900-01-01T00:00:00.000+03:00"
        }
      },
      rangeOrder: "ASC",
      condition: {
        "@bean": "com.cyoda.core.conditions.GroupCondition",
        operator: "AND",
        conditions: [
          {
            "@bean": selectedConditionConfig["@bean"],
            fieldName: searchByField,
            operation: selectedConditionConfig.operation,
            value: {
              "@type": "java.lang.String",
              value: value
            }
          }
        ]
      },
      columns: [
        {
          "@bean": "com.cyoda.core.reports.columns.ReportSimpleColumn",
          name: fieldId
        },
        {
          "@bean": "com.cyoda.core.reports.columns.ReportSimpleColumn",
          name: fieldName
        }
      ],
      colDefs: [
        {
          fullPath: fieldId,
          parts: {
            "@meta": "com.cyoda.core.reports.columndefs.ReportColPartDef[]",
            value: [
              {
                rootClass: editableField.entity,
                path: fieldId,
                type: props.column.columnInfo.clazzType
              }
            ]
          },
          colType: props.column.columnInfo.clazzType
        },
        {
          fullPath: fieldName,
          parts: {
            "@meta": "com.cyoda.core.reports.columndefs.ReportColPartDef[]",
            value: [
              {
                rootClass: editableField.entity,
                path: fieldName,
                type: props.column.columnInfo.clazzType
              }
            ]
          },
          colType: props.column.columnInfo.clazzType
        }
      ],
      aliasDefs: []
    },
    pointTime: null,
    offset: 0,
    length: operation === "equals" ? 1 : 20,
    fromPosIndex: 0
  };
}

async function loadTransitions() {
  const { data } = await api.getTransitionsForEntity(props.id, props.requestClass);
  optionsTransitions = data.map((el) => {
    return {
      value: el,
      label: el
    };
  });
}

function resetForm() {
  form.value = "";
  form.transition = "";
}

watch(dialogVisible, async (val: boolean) => {
  if (val) {
    resetForm();
    isLoadingFirstTime.value = true;
    let searchField = "";
    if (editableField.fieldId.item === props.currentField) {
      searchField = editableField.fieldId.entity;
    } else {
      searchField = editableField.fieldName.entity;
    }
    const configDefinition = getConfigDefinitionRequest(searchField, props.itemValue, "equals");
    await loadData(configDefinition);
    if (options.length > 0) {
      form.value = options[0].value;
    }
    await loadTransitions();
    isLoadingFirstTime.value = false;
  }
});

defineExpose({ dialogVisible });
</script>

<style lang="scss">
.detail-tree-item-editable-form {
  .el-select {
    width: 100%;
  }

  .el-form-item__label {
    padding-bottom: 0;
  }

  .el-form-item {
    margin-bottom: 10px;
  }

  .el-dialog__body {
    padding-top: 15px;
    padding-bottom: 15px;
  }
}
</style>

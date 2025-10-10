<template>
  <el-dialog :close-on-click-modal="false" title="Grouping" v-model="dialogVisible" width="800px" class="history-table-hierarhy-edit-pop-up">
    <div class="flex-fields">
      <div>Available fields:</div>
      <div>
        <el-select class="select" :disabled="groupingForAdd.length === 0" v-model="selectedGroup" placeholder="Select">
          <el-option v-for="item in groupingForAdd" :key="item" :label="item" :value="item"> </el-option>
        </el-select>
      </div>
      <div>
        <el-button @click="addToSelected" :disabled="groupingForAdd.length === 0 || !selectedGroup" type="primary">
          <font-awesome-icon icon="plus" />
          Add
        </el-button>
      </div>
    </div>

    <draggable tag="table" class="transition-group" ghost-class="ghost" item-key="item" v-model="groupingColumns" handle=".handle">
      <template #item="{element: item, index}">
        <tr :key="item" class="list-group-item">
          <td>
            {{ item }}
          </td>
          <td class="actions">
            <el-button @click="onClick(index)" size="default" type="danger">
              <font-awesome-icon icon="trash" />
            </el-button>
          </td>
          <td class="sort-cell">
            <font-awesome-icon class="handle" icon="align-justify" />
          </td>
        </tr>
      </template>
    </draggable>

    <template #footer>
      <span class="dialog-footer">
      <el-button type="primary" @click="onUpdate">Update</el-button>
      <el-button @click="dialogVisible = false">Close</el-button>
    </span>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import draggable from "vuedraggable";
import { ElMessageBox } from "element-plus";
import { ref, computed, watch } from "vue";

import * as api from "@cyoda/ui-lib/src/api";
import HelperReportDefinition from "../../helpers/HelperReportDefinition";
import "prismjs/themes/prism.css";
import _ from "lodash";
import type {StoreParamsReport} from "../../views/History/History";
import {useReportsStore} from "../../stores/reports";

const emit=defineEmits(['update']);
const groupingForAdd = computed(() => {
  const grouping = (configDefinition.value && configDefinition.value.grouping && configDefinition.value.grouping.map((el) => el.name)) || [];
  return _.difference(grouping, groupingColumns.value);
});

const configDefinitionId = ref<string>("");
let groupingColumnsProp = ref([]);
const dialogVisible = ref<boolean>(false);

let groupingColumns = ref([]);
const selectedGroup = ref<string>("");

let configDefinition = ref(HelperReportDefinition.reportDefinition());
const reportsStore = useReportsStore();

function onClick(index: number) {
  ElMessageBox.confirm("Do you really want to remove?", "Confirm!", {
    callback: async (action) => {
      if (action === "confirm") {
        groupingColumns.value.splice(index, 1);
      }
    }
  });
}

async function onUpdate() {
  const groups = groupingColumns.value.map((groupOrder) => {
    for (const group of configDefinition.value.grouping) {
      if (group.name === groupOrder) {
        return group;
      }
    }
  });
  const { data } = await api.getReportRegroup(configDefinitionId.value, {
    hierarhyEnable: true,
    newGrouping: groups
  });
  const paramsReport: StoreParamsReport = {
    id: data.content.id,
    configName: configDefinitionId.value,
    reportExecutionTime: 0,
    linkStatus: data._links["/report/{id}/{grouping_version}/status"].href,
    status: "RUNNING"
  };
  dialogVisible.value = false;
  reportsStore.createReportToRun(paramsReport);
  emit("update");
}

async function getConfigDefinition(id: string) {
  const { data } = await api.getConfig(id);
  return data.content;
}

watch(dialogVisible, async (val: boolean) => {
  if (val) {
    groupingColumns.value = JSON.parse(JSON.stringify(groupingColumnsProp.value));
    const configDefinitionValue = await getConfigDefinition(configDefinitionId.value);
    if (configDefinitionValue) {
      configDefinition.value = configDefinitionValue;
    }
  }
});

function addToSelected() {
  groupingColumns.value.push(selectedGroup.value);
  selectedGroup.value = "";
}

defineExpose({ dialogVisible, configDefinitionId, groupingColumnsProp });
</script>

<style scoped lang="scss">
.history-table-hierarhy-edit-pop-up {
  .select {
    width: 210px;
  }

  .flex-fields {
    margin-top: -15px;
    margin-bottom: 15px;
    display: flex;
    align-items: center;

    > div {
      margin-right: 15px;
    }
  }

  td {
    border-top: 1px solid #dcdfe6;
    border-bottom: 1px solid #dcdfe6;
    padding: 10px 5px;
  }

  .no-move {
    transition: transform 0s;
  }

  .ghost {
    opacity: 0.5;
    background: #c8ebfb;
  }

  .sort-cell {
    width: 28px !important;
    text-align: right;

    svg {
      width: 18px !important;
      height: 18px !important;
      cursor: move;
    }
  }

  .transition-group {
    width: 100%;
    border-collapse: collapse;
  }

  .actions {
    text-align: right;
  }
}
</style>

<template>
  <el-dialog
    :close-on-click-modal="false"
    v-model="dialogVisible"
    title="Models list"
    width="80%"
  >
    <el-table ref="elTableRef" :data="tableData" border style="width: 100%"
              @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" :selectable="selectable"/>
      <el-table-column prop="id" label="ID"/>
      <el-table-column prop="modelName" label="Model Name"/>
      <el-table-column prop="currentState" label="Current State"/>
      <el-table-column prop="modelVersion" label="Model Version"/>
      <el-table-column label="Actions">
        <template #default="{row}">
          <el-button v-if="isShowUpdateBtn(row)" @click="updateTables(row)" :loading="row.isLoading" type="warning">Update</el-button>
        </template>
      </el-table-column>
    </el-table>

    <template #footer>
      <div class="dialog-footer">
        <el-button @click="dialogVisible = false">Close</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import {nextTick, onMounted, ref, watch} from "vue";
import {useSqlSchemaStore} from "./../../stores/sql-schema";
import {ElMessageBox} from "element-plus";
import _ from "lodash";
import moment from "moment";

const dialogVisible = ref(false);
const tableData = ref([]);
const multipleSelection = ref([]);
const isLoadingGenerateTable = ref(false);
const elTableRef = ref(null);
let isInit = false;

const sqlSchemaStore = useSqlSchemaStore();
const emits = defineEmits(['change', 'deleteTables', 'updateTables']);

const props = defineProps({
  tables: {
    default: () => {
      return [];
    }
  }
});

function open() {
  dialogVisible.value = true;
  loadData();
}

async function loadData() {
  if (isInit) return;
  const {data} = await sqlSchemaStore.getEntityModelList();
  tableData.value = data.map(el => {
    return {
      ...el,
      isLoading: false
    }
  });
  isInit = true;
}

const handleSelectionChange = async (val: any[]) => {
  const multipleSelectionTmp = JSON.parse(JSON.stringify(multipleSelection.value));
  if (val.length < multipleSelection.value.length) {
    ElMessageBox.confirm(
      'All manual changes to those tables will be lost. Continue?',
      'Warning',
      {
        type: 'warning',
        callback: async (action) => {
          if (action === "cancel") {
            elTableRef.value!.clearSelection();
            await nextTick();
            const row = tableData.value.find(el => multipleSelectionTmp.includes(el.id));
            selectTableRow(row);
          } else if (action === "confirm") {
            emits('deleteTables', _.difference(multipleSelectionTmp, val.map(el => el.id)));
          }
        }
      }
    )
  } else if (!isAutomaticAdd) {
    const allIds = val.map(el => el.id);
    const newIds = _.difference(allIds, multipleSelection.value);
    generateTableByIds(newIds);
  }
  multipleSelection.value = val.map(el => el.id);
}

async function generateTableByIds(ids) {
  try {
    isLoadingGenerateTable.value = true;
    const listPromises = ids.map((id) => sqlSchemaStore.getGenTable(id));
    const datas = await Promise.all(listPromises);
    const tableList = datas.flatMap(({data}) => data);
    tableList.forEach((el) => {
      el.tableName = el.tableName.toLowerCase().replaceAll('-', '_');
    });
    emits('change', tableList);
  } finally {
    isLoadingGenerateTable.value = false;
  }
}

function isShowUpdateBtn(row) {
  const record = props.tables.find((el) => el.metadataClassId === row.id && el.modelUpdateDate);
  if (!row.modelUpdateDate || !record) return false;

  const tableDate = moment(record.modelUpdateDate).format('x');
  const modelDate = moment(row.modelUpdateDate).format('x');
  return modelDate > tableDate;
}

function updateTables(row) {
  emits('updateTables', {
    tables: props.tables.filter((el) => el.metadataClassId === row.id),
    metaId: row.id,
    row,
  });
}

watch(tableData, () => {
  multipleSelection.value = []
  const allIds = _.uniq(props.tables.map(el => el.metadataClassId));
  const record = tableData.value.find((el) => allIds.includes(el.id));
  if (record) {
    nextTick(() => {
      selectTableRow(record);
    })
  }
}, {immediate: true});

function selectable(row) {
  return row.currentState !== 'UNLOCKED';
}

let isAutomaticAdd = false;

function selectTableRow(row) {
  isAutomaticAdd = true;
  elTableRef.value!.toggleRowSelection(row);
  setTimeout(() => isAutomaticAdd = false, 1000);
}

defineExpose({open});
</script>

<style lang="scss">

</style>

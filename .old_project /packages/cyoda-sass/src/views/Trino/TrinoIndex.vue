<template>
  <div class="trino-index">
    <div class="card">
      <div class="card-body">
        <div class="flex">
          <div class="form">
            <el-input placeholder="Filter" v-model="form.filter"></el-input>
          </div>
          <div class="actions">
            <el-tooltip :show-after="500" class="item" effect="dark"
                        content="Reset state: filters, table settings, etc."
                        placement="top">
              <el-button class="reset-button" @click="onResetState" type="primary">
                <font-awesome-icon :icon="['fas', 'arrows-rotate']"/>
                Reset state
              </el-button>
            </el-tooltip>
            <!--                        <el-button :loading="isLoadingImport" @click="onImport" type="warning">-->
            <!--                          Import Data-->
            <!--                          <font-awesome-icon :icon="['fas', 'file-import']"/>-->
            <!--                        </el-button>-->
            <el-button @click="onCreateSchema" type="primary">
              Create schema
              <font-awesome-icon icon="plus"/>
            </el-button>
          </div>
        </div>

        <data-tables
          :key="tableKeyId"
          @headerDragend="onHeaderDragend"
          @sortChange="onSortChange"
          ref="dataTableRef"
          v-model:pageSize="form.pageSize"
          v-model:currentPage="form.currentPage"
          :pagination-props="{ pageSizes: [5, 10, 20, 50] }"
          :table-props="{
            border: true
          }"
          v-loading="isLoading"
          class="table"
          border
          :data="tableDataComputed"
          style="width: 100%"
        >
          <el-table-column sortable prop="id" label="ID"/>
          <el-table-column sortable prop="schemaName" label="Schema Name"/>
          <el-table-column sortable prop="timestamp" label="Created">
            <template #default="{row}">
              {{ moment(row.timestamp).format('DD.MM.YYYY HH:mm:ss') }}
            </template>
          </el-table-column>
          <el-table-column width="220" label="Actions">
            <template #default="{ row }">
              <CyodaButton size="default" type="warning" :to="getEditLink(row)">
                <font-awesome-icon icon="pencil-alt"/>
              </CyodaButton>
              <el-button size="default" type="danger" @click="onDelete(row)">
                <font-awesome-icon icon="trash"/>
              </el-button>
            </template>
          </el-table-column>
        </data-tables>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {computed, onMounted, reactive, ref} from "vue";
import {useSqlSchemaStore} from "../../stores/sql-schema";
import CyodaButton from "../../components/CyodaButton/CyodaButton.vue";
import {useRouter} from "vue-router";
import HelperFormat from "@cyoda/ui-lib/src/helpers/HelperFormat.ts";
import moment from "moment";
import {useTableSaveStateMixin} from "@cyoda/ui-lib/src/mixins/TableSaveStateMixin.ts";
import HelperStorage from "@cyoda/cobi/src/helpers/HelperStorage.ts";

const sqlSchemaStore = useSqlSchemaStore();

let form = reactive({
  filter: "",
  currentPage: 1,
  pageSize: 10
});

const tableData = ref([]);
const isLoading = ref(false);
const router = useRouter();
const isLoadingImport = ref(false);
const dataTableRef = ref(null);
const tableKeyId = ref(0);
const storage = new HelperStorage();

const {onHeaderDragend, onSortChange} = useTableSaveStateMixin('trinoIndexTable', dataTableRef, form);

onMounted(async () => {
  loadData();
})

async function loadData() {
  const {data} = await sqlSchemaStore.getListAll();
  tableData.value = data.map((el) => {
    return {...el, timestamp: HelperFormat.getTimeFromUuid(el.id)}
  }).sort((a, b) => b.timestamp - a.timestamp);
}

function getEditLink(row) {
  return `/cyoda-sass/trino/schema/${row.id}`;
}

function onCreateSchema() {
  router.push('/cyoda-sass/trino/schema');
}

async function onDelete(row) {
  isLoading.value = true;
  await sqlSchemaStore.delete(row.id);
  await loadData();
  isLoading.value = false;
}

async function onImport() {
  try {
    isLoadingImport.value = true;
    await sqlSchemaStore.importData();
  } finally {
    isLoadingImport.value = false;
  }
}

const tableDataComputed = computed(() => {
  const filter = form.filter.toLowerCase();
  return tableData.value.filter((el) => {
    return !filter || el.schemaName.toLowerCase().indexOf(filter) > -1;
  })
})

function onResetState() {
  form.filter = '';
  form.currentPage = 1;
  form.pageSize = 10;
  storage.deleteByKey('tableSaveState:trinoIndexTable');
  tableKeyId.value += 1;
}
</script>

<style lang="scss">
.trino-index {
  h4 {
    font-size: 18px;
  }

  .flex {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 15px;

    .form {
      flex-grow: 1;
    }

    gap: 16px;
  }

  .actions {
    margin-left: auto;
  }
}
</style>

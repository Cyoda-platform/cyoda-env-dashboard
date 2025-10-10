<template>
  <div class="home-view">
    <div class="card">
      <div class="card-body">
        <div class="flex">
          <div>
            <h4>List of Configs</h4>
          </div>
          <div>
            <UploadFile v-if="isUploadFile" ref="uploadFile" />
          </div>
        </div>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-input placeholder="Filter" v-model="form.filter"></el-input>
          </el-col>
        </el-row>

        <el-table class="table" border :data="tableData" style="width: 100%">
          <el-table-column type="expand">
            <template v-slot:default="{ row }">
              <el-table :data="row.columnMappingConfigs" style="width: 100%">
                <template v-if="row.fileType === 'CSV'">
                  <el-table-column prop="csvColumnName" label="Csv Column Name" min-width="180"> </el-table-column>
                </template>
                <template v-if="row.fileType === 'XML'">
                  <el-table-column prop="xmlColumnName" label="XML Column Name" min-width="180"> </el-table-column>
                  <el-table-column prop="xmlColumnXPath" label="Xml Column XPath" min-width="180"> </el-table-column>
                </template>
                <template v-if="'srcSql' in row">
                  <el-table-column prop="srcColumnName" label="Column Name" min-width="180"> </el-table-column>
                  <el-table-column prop="srcColumnType" label="Column Type" min-width="180"> </el-table-column>
                </template>
                <el-table-column prop="dstAliasName" label="Alias" min-width="180">
                  <template v-slot:default="{ row }">
                    {{ row.dstAliasName || "-" }}
                  </template>
                </el-table-column>
                <el-table-column prop="mapperClass" min-width="180" label="Mapper Class">
                  <template v-slot:default="{ row }">
                    {{ (row.mapperClass && row.mapperClass.split("$").pop()) || "-" }}
                  </template>
                </el-table-column>
                <el-table-column prop="mapperFormatParam" min-width="180" label="Mapper Parametters">
                  <template v-slot:default="{ row }">
                    {{ row.mapperFormatParam || "-" }}
                  </template>
                </el-table-column>
              </el-table>
            </template>
          </el-table-column>
          <el-table-column prop="name" label="Name" width="250">
            <template v-slot:default="{ row }">
              {{ row.name }}
              <template v-if="row.fileType === 'XML'">
                <br />
                Base XPath: {{ row.xmlBaseXPath }}
              </template>
              <template v-if="'srcSql' in row">
                <br />
                Sql: {{ row.srcSql }}
              </template>
            </template>
          </el-table-column>
          <el-table-column prop="creationDate" label="Date of creation">
            <template v-slot:default="{ row }">
              <template v-if="row.creationDate">
                {{ row.creationDate | date }}
              </template>
              <template v-else> -</template>
            </template>
          </el-table-column>
          <el-table-column prop="lastUpdateTime" label="Date last edit">
            <template v-slot:default="{ row }">
              <template v-if="row.lastUpdateTime">
                {{ row.lastUpdateTime | date }}
              </template>
              <template v-else> -</template>
            </template>
          </el-table-column>
          <el-table-column min-width="150" prop="creatorUser" label="Created User">
            <template v-slot:default="{ row }">
              {{ row.creatorUser || "-" }}
            </template>
          </el-table-column>
          <el-table-column label="Number of configured columns">
            <template v-slot:default="{ row }">
              {{ calculateNumberOfConfiguredColumns(row) }}
            </template>
          </el-table-column>
          <el-table-column label="Actions">
            <template v-slot:default="{ row }">
              <el-button size="default" type="warning" @click="onEdit(row)">
                <font-awesome-icon icon="pencil-alt" />
              </el-button>
              <el-button v-if="'srcSql' in row" size="default" type="primary" @click="onRun(row)">
                <font-awesome-icon icon="play" />
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ElNotification } from "element-plus";
import { ref, nextTick, computed, onBeforeUnmount } from "vue";

import UploadFile from "../components/UploadFile/UploadFile.vue";
import eventBus from "@cyoda/ui-lib/src/plugins/eventBus";
import {useFileUploadApiStore} from "../stores/encompass";

const fileUploadApiStore = useFileUploadApiStore();
const tableData = computed(() => {
  return listConfigs.value.filter((el: any) => {
    return !form.value.filter || el.name.toLowerCase().indexOf(form.value.filter) > -1;
  });
});
function getListConfigs() {
  return fileUploadApiStore.getListConfigs();
}

let listConfigs = ref([]);

let form = ref({
  filter: ""
});

const isUploadFile = ref<boolean>(true);

loadListConfigs();
eventBus.$on("create:csv", loadListConfigs);

onBeforeUnmount(() => {
  eventBus.$off("create:csv", loadListConfigs);
});

function onCreate() {
  loadListConfigs();
}

async function loadListConfigs() {
  const getListConfigsFiles = await getListConfigs();
  const getWkListConfigs = await getWkListConfigs();
  listConfigs.value = [...getListConfigsFiles, ...getWkListConfigs];
}

async function onEdit(data: any) {
  isUploadFile.value = false;
  await nextTick();

  isUploadFile.value = true;
  setTimeout(() => {
    nextTick().then(() => {
      eventBus.$emit("upload-data:edit", data);
    })
  }, 300);
}

function calculateNumberOfConfiguredColumns({ columnMappingConfigs }: any) {
  return columnMappingConfigs.filter((el: any) => el.dstAliasName).length;
}

function onRun(row: any) {
  getWkRun(row.id);
  ElNotification({ type: "success", title: "Success", message: "Process was runned!" });
}
</script>

<style lang="scss">
.home-view {
  .flex {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .table {
    margin-top: 10px;
  }
}
</style>

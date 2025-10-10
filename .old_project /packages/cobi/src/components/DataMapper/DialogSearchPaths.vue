<template>
  <el-dialog class="dialog-search-paths" append-to-body :close-on-click-modal="false" title="Search"
             v-model="dialogVisible" width="90%">
    <div class="wrap-filter">
      <el-input v-model="form.filter" placeholder="Filter for paths and statements"></el-input>
    </div>

    <data-tables
      :table-props="{
        border: true
      }"
      :data="tableDataComputed"
      style="width: 100%"
    >
      <el-table-column type="expand">
        <template v-slot:default="{ row }">
          <div class="inner-table">
            <el-table :data="row.statements" style="width: 100%">
              <el-table-column type="index" width="50"></el-table-column>
              <el-table-column label="Statements">
                <template v-slot:default="{ row: statement }">
                  {{ statement }}
                </template>
              </el-table-column>
            </el-table>
          </div>
        </template>
      </el-table-column>
      <el-table-column prop="srcColumnPath" label="Source">
        <template v-slot="{ row }">
          <el-link @click="findSourcePath(row.srcColumnPath)">
            {{ row.srcColumnPath }}
          </el-link>
        </template>
      </el-table-column>
      <el-table-column prop="dstColumnPath" label="Target">
        <template v-slot="{ row }">
          <el-link @click="findTargetPath(row.dstColumnPath)">
            {{ row.dstColumnPath }}
          </el-link>
        </template>
      </el-table-column>
    </data-tables>
  </el-dialog>
</template>

<script setup lang="ts">
import {ref, computed} from "vue";

import HelperFormat from "../../helpers/HelperFormat";
import type {FunctionalMappingConfigDto} from "./MappingConfigDto";
import _ from "lodash";
import eventBus from "@cyoda/ui-lib/src/plugins/eventBus";

const props = defineProps({
  allDataRelations: undefined,
  selectedEntityMapping: {
    default: () => {
      return {};
    }
  }
});
const tableData = computed(() => {
  return props.allDataRelations.map((el) => {
    const functionalMapping = props.selectedEntityMapping.functionalMappings.find((functionalMapping) => functionalMapping.dstPath === el.column.dstColumnPath);
    let statements = [];
    if (functionalMapping) {
      statements = getAllStatements(functionalMapping).map((el)=> shortNamePath(el));
    }
    return {
      srcColumnPath: shortNamePath(el.column.srcColumnPath),
      dstColumnPath: shortNamePath(el.column.dstColumnPath),
      statements
    };
  });
});
const tableDataComputed = computed(() => {
  const filter = form.value.filter.toLowerCase();

  return tableData.value.filter((el) => {
    return !form.value.filter || el.dstColumnPath.toLowerCase().indexOf(filter) > -1 || el.srcColumnPath.toLowerCase().indexOf(filter) > -1 || el.statements.find((statement) => statement.toLowerCase().indexOf(filter) > -1);
  });
});

const dialogVisible = ref<boolean>(false);

let form = ref({
  filter: ""
});

function findSourcePath(path) {
  eventBus.$emit("findSourcePath", path);
  dialogVisible.value = false;
}

function findTargetPath(path) {
  eventBus.$emit("findTargetPath", path);
  dialogVisible.value = false;
}

function shortNamePath(name: string) {
  return HelperFormat.shortNamePath(name);
}

function getAllStatements(functionalMapping: FunctionalMappingConfigDto) {
  const statementsText = JSON.stringify(functionalMapping.statements);
  const matchAll = [...statementsText.matchAll(/"@bean":"([^"]*)"/g)];
  return _.uniq(matchAll.map((el) => el[1]));
}

defineExpose({dialogVisible});
</script>

<style lang="scss">
.dialog-search-paths {
  .wrap-filter {
    margin-bottom: 15px;
  }

  .inner-table {
    margin: 0 20px;
    border: 1px solid #ebeef5;
  }
}
</style>

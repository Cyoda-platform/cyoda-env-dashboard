<template>
  <div class="cyoda-modelling-pop-up-alias-table">
    <el-table ref="multipleTable" @selection-change="handleSelectionChange" :data="tableData" style="width: 100%">
      <el-table-column v-if="checkIsMultipleSelection" class-name="cell-selection" type="selection"
                       width="55"></el-table-column>
      <el-table-column type="expand">
        <template v-slot:default="props">
          <el-table :data="props.row.paths" style="width: 90%">
            <el-table-column prop="path" label="Path">
              <template v-slot:default="scope">
                <div class="inner-row">
                  <div>
                    <el-popover placement="top-start" title="Full Path" width="500" trigger="click"
                                :content="scope.row.path">
                      <template #reference>
                        <div class="info-wrapper">
                          <font-awesome-icon icon="info-circle"/>
                        </div>
                      </template>
                    </el-popover>
                  </div>
                  <div>
                    {{ getShortName(scope.row.path) }}
                  </div>
                </div>
              </template>
            </el-table-column>
            <el-table-column prop="mapperClass" label="Mapper" width="200"/>
            <el-table-column prop="path" label="Parameters" width="200">
              <template v-slot:default="props">
                <div v-if="props.row.mapperParameters">
                  <div
                    v-if="props.row.mapperParameters && props.row.mapperParameters.parameters && Object.keys(props.row.mapperParameters.parameters).length > 0">
                    <div v-for="name in Object.keys(props.row.mapperParameters.parameters)">
                      <el-popover placement="top"
                                  :title="titleMapperParametersPopover(props.row.mapperParameters.parameters[name])"
                                  width="200" trigger="hover">
                        <div>
                          <table>
                            <tbody>
                            <tr>
                              <td>Value:</td>
                              <td>
                                {{ props.row.mapperParameters.parameters[name].value }}
                              </td>
                            </tr>
                            <tr>
                              <td>Type:</td>
                              <td>
                                {{ props.row.mapperParameters.parameters[name].parameterType.split(".").pop() }}
                              </td>
                            </tr>
                            </tbody>
                          </table>
                        </div>
                        <template #reference>
                          <el-link type="primary">
                            {{ name }}
                          </el-link>
                        </template>
                      </el-popover>
                    </div>
                  </div>
                </div>
                <div v-else>
                  <span class="not-possible">Not available</span>
                </div>
              </template>
            </el-table-column>
          </el-table>
        </template>
      </el-table-column>
      <el-table-column prop="name" label="Name"></el-table-column>
      <el-table-column label="Action" width="250">
        <template v-slot:default="scope">
          <slot name="actions-buttons" :row="scope.row" :$index="scope.$index"></slot>
        </template>
      </el-table-column>
    </el-table>
    <div class="form-multiple-selection" v-if="multipleSelection.length > 0">
      <slot name="multiple-selection" :multipleSelection="multipleSelection" :table="$refs.multipleTable"></slot>
    </div>
  </div>
</template>

<script setup lang="ts">
import {ref, computed, useSlots} from "vue";

import HelperFormat from "@cyoda/ui-lib/src/helpers/HelperFormat";
import type {CyodaModellingPopUpAliasTableTableDataRow} from "../CyodaModellingTypes";

const props = defineProps({
  tableData: {
    default: () => {
      return [];
    }
  }
});

const slots = useSlots();
const checkIsMultipleSelection = computed(() => {
  return slots["multiple-selection"];
});

let multipleSelection = ref([]);

function handleSelectionChange(val: CyodaModellingPopUpAliasTableTableDataRow[]) {
  multipleSelection.value = val;
}

function titleMapperParametersPopover(param: {
  name: string
}) {
  return `${param.name}`;
}

function getShortName(path: string) {
  return HelperFormat.shortNamePath(path);
}
</script>

<style scoped lang="scss">
.cyoda-modelling-pop-up-alias-table {
  .form-multiple-selection {
    margin-top: 15px;
  }

  .not-possible {
    color: #b8b8b8;
  }

  .info-wrapper {
    display: inline-block;
    width: 20px;
    height: 20px;
    text-align: center;
    font-size: 16px;
    line-height: 18px;
    margin-right: 10px;
    cursor: pointer;
  }

  .inner-row {
    display: flex;
    align-items: center;
  }
}
</style>

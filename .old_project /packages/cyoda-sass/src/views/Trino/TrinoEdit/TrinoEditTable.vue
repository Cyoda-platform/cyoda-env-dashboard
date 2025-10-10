<template>
  <div class="trino-edit-table">
    <div class="table-container" style="width: 100%">
      <div class="row-container">
        <div class="header col1"></div>
        <div class="header col2">Field Name</div>
        <div class="header col3">Field Key</div>
        <div class="header col4">Data Type</div>
        <div v-if="isExistArray" class="header col5">Flatten</div>
      </div>
      <draggable
        v-model="fields"
        @end="onEndDrag"
        handle=".handle"
        item-key="fieldKey">
        <template #item="{element: row, index}">
          <div v-show="!row.hidden">
            <div class="row-container" :class="{'not-data': row.fieldCategory !== 'DATA'}">
              <div class="cell col1">
                <font-awesome-icon class="handle" icon="align-justify"/>
                <font-awesome-icon class="eye" @click="hideColumn(row)" icon="eye"/>
              </div>
              <div class="cell cell-item col2">
                <el-form-item
                  label-width="auto"
                  :prop="`${getPropPath(index)}.fieldName`"
                  :error="validateFieldName(row)"
                  :show-message="!!validateFieldName(row)"
                >
                  <el-input v-model="row.fieldName"/>
                </el-form-item>
              </div>
              <div class="cell col3"><span>{{ row.fieldKey }}</span></div>
              <div class="cell col4"><span>{{ row.dataType }}</span></div>
              <div v-if="isExistArray" class="cell col5">
                <el-checkbox v-if="row.isArray" v-model="row.flatten" size="large"/>
              </div>
            </div>

            <div class="expand-row" v-if="isExistArray && row.flatten">
              <TrinoEditTable :table="row" fields-name="arrayFields" :basePropPath="`${getPropPath(index)}.arrayFields`"
                              :tableIndex="0" :allFields="allFields"/>
            </div>
          </div>
        </template>
      </draggable>
    </div>
  </div>
</template>

<script setup lang="ts">
import {computed, reactive, ref, watch} from "vue";
import draggable from "vuedraggable";
import {FontAwesomeIcon} from "@fortawesome/vue-fontawesome";

const props = defineProps({
  fieldsName: {
    default: 'fields',
  },
  basePropPath: {
    default: '',
  },
  table: {
    default: () => {
      return {}
    }
  },
  allFields: {
    default: () => {
      return []
    }
  },
  isExistFlatten: {
    default: false
  }
})

const isExistArray = computed(() => {
  return fields.value.some((el) => el.isArray);
})

const fields = ref([]);

watch(() => props.fieldsName, (value) => {
  fields.value = props.table[value] || [];
}, {immediate: true});

function onEndDrag() {
  Object.assign(props.table[props.fieldsName], fields.value);
}

let form = reactive({
  filter: "",
  currentPage: 1,
  pageSize: 10
});

function validateFieldName(row: any) {
  if (row.flatten) return;
  const fieldNames = props.allFields.filter((el) => !el.hidden).filter((el) => el.fieldName === row.fieldName);
  if (fieldNames.length > 1) {
    return 'The "Field Name" field must be unique';
  }
}

function getPropPath(index) {
  return `${props.basePropPath}.${props.fieldsName}.${index}`
}

function hideColumn(row) {
  row.hidden = true;
}


</script>

<style lang="scss">
.trino-edit-table {
  .table-container {
    .col1 {
      width: 70px;
      display: flex;
      justify-content: center;
      gap: 10px;
    }

    .col2 {
      flex: 1;
    }

    .col3 {
      word-break: break-all;
    }

    .col3, .col4 {
      width: 25%;
    }

    .col5 {
      width: 80px;
      display: flex;
      justify-content: center;
    }

    .header {
      background-color: #4b5d7a;
      color: #fff;
      text-align: left;
      padding: 5px;
      border: 0.5px solid #ebeef5;
    }

    .row-container {
      display: flex;
      width: 100%;

      .cell {
        padding: 5px;
        border: 0.5px solid #ebeef5;
        //display: table-cell;
        display: flex;
        align-items: center;
      }

      .cell-item {
        padding: 5px;
      }

      .el-form-item {
        margin-bottom: 0;
      }

      .el-checkbox.el-checkbox--large {
        height: 30px;
      }

      .el-input--large .el-input__inner {
        --el-input-inner-height: 30px;
      }

      .el-form-item--large .el-form-item__error {
        position: unset;
      }
    }
  }

  .handle, .eye {
    cursor: pointer;
    transition: all 0.5s;

    &:hover {
      opacity: 0.5;
    }
  }

  .not-data{
    background-color: #f3f3f3;
  }

  .expand-row {
    border: 0.5px solid #ebeef5;
    padding: 16px;
  }
}
</style>

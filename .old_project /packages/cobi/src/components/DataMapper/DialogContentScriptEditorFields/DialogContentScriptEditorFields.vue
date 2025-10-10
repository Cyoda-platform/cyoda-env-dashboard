<template>
  <div class="dialog-content-script-editor-fields">
    <h1>Source Fields</h1>
    <div class="row-filter">
      <el-input size="default" placeholder="Filter" v-model="form.filterSourceFields"></el-input>
    </div>
    <el-table max-height="400" size="small" :data="tableDataSourceFields" stripe style="width: 100%">
      <el-table-column show-overflow-tooltip prop="field" label="Field">
        <template #default="{ row }">
          <font-awesome-icon class="copy-icon" @click="copy(row.field)" icon="copy"/>
          {{ row.field }}
        </template>
      </el-table-column>
      <el-table-column width="70px">
        <template #default="{ row }">
          <el-button @click="onDelete('inputSrcPaths', row.field)" size="small" type="danger">
            <font-awesome-icon icon="trash"/>
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-divider></el-divider>
    <h1 style="margin-bottom: 10px">Meta Params Fields</h1>
    <el-table max-height="400" size="small" :data="tableDataMetaPathsFields" stripe style="width: 100%">
      <el-table-column show-overflow-tooltip prop="field" label="Field"></el-table-column>
      <el-table-column width="70px">
        <template #default="{ row }">
          <el-button @click="onDelete('inputMetaPaths', row.field)" size="small" type="danger">
            <font-awesome-icon icon="trash"/>
          </el-button>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script setup lang="ts">
import {ElNotification, ElMessageBox} from "element-plus";
import {ref, computed, reactive} from "vue";

const props = defineProps({
  script: {
    default: () => {
      return {};
    }
  }
});
const tableDataSourceFields = computed(() => {
  return props.script.inputSrcPaths.filter(el => {
    const filterSourceFields=form.filterSourceFields.toLowerCase();
    return !filterSourceFields || el.includes(filterSourceFields)
  }).map((el) => {
    return {
      field: el
    };
  });
});

const tableDataMetaPathsFields = computed(() => {
  return props.script.inputMetaPaths.map((el) => {
    return {
      field: el
    };
  });
});

const dialogVisible = ref<boolean>(false);
const form = reactive({
  filterSourceFields: "",
})

function onDelete(field, value) {
  ElMessageBox.confirm(`Do you really want to delete this element. Continue?`, "Confirm", {
    callback: async (action) => {
      if (action === "confirm") {
        props.script[field] = props.script[field].filter((el) => el !== value);
      }
    }
  });
}

function copy(value: string) {
  navigator.clipboard.writeText(`input.get("${value}")`).then(
    () => {
      ElNotification({
        title: "Success",
        message: `Value was copied`,
        type: "success"
      });
    },
    () => {
      ElNotification({
        title: "Error",
        message: `Value is NOT was copied`,
        type: "error"
      });
    }
  );
}

defineExpose({dialogVisible});
</script>

<style lang="scss">
.dialog-content-script-editor-fields {
  h1 {
    margin-bottom: 10px;
  }

  .copy-icon {
    cursor: pointer;
    font-size: 14px;
    transition: all 0.5s;
    margin-right: 5px;
  }

  .copy-icon:hover {
    opacity: 0.8;
  }

  .row-filter {
    margin-bottom: 10px;
  }
}
</style>

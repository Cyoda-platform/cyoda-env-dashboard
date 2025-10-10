<template>
  <div class="data-chaining-config-relative-paths">
    <div class="header-actions">
      <el-button @click="addRelativePath" type="primary">
        Add relative path
        <font-awesome-icon icon="plus" />
      </el-button>
    </div>
    <table class="table table-chaining-config">
      <thead>
        <tr>
          <th>Mapping</th>
          <th>Root Relative Path</th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(relativePath, index) in rootRelativePaths" :key="index">
          <td class="td-mapping">
            <el-select filterable clearable @change="onChangeRelativePath(index)" v-model="relativePath.key" placeholder="Please select mapping">
              <el-option v-for="item in dataMappingList" :key="item.id" :label="item.name" :value="item.id"> </el-option>
            </el-select>
          </td>
          <td class="td-relative-path">
            <el-tree-select @change="onChangeRelativePath" check-strictly placeholder="Please select" v-model="relativePath.value" :disabled="!relativePath.key" :data="getOptionsForMapping(relativePath.key)">
              <template #default="{ data: { labelShort, label } }">
                {{ labelShort || label }}
              </template>
            </el-tree-select>
          </td>
          <td class="action">
            <el-button size="default" @click="deleteRelativePath(index)" type="danger">
              <font-awesome-icon icon="trash" />
            </el-button>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup lang="ts">
import { ElMessageBox } from "element-plus";
import { ref, watch } from "vue";
import HelperMapper from "../../../helpers/HelperMapper";
import HelperContent from "../../../helpers/HelperContent";

const props = defineProps({
  chainingConfigDto: {
    default: () => {
      return {};
    }
  },
  dataMappingList: {
    default: () => {
      return {};
    }
  }
});

let rootRelativePaths = ref<{ key: string; value: string | null }[]>([]);

function addRelativePath() {
  rootRelativePaths.value.push({ key: "", value: null });
}

function deleteRelativePath(index: number) {
  ElMessageBox.confirm("Do you really want to remove relative path?", "Confirm!", {
    callback: async (action) => {
      if (action === "confirm") {
        rootRelativePaths.value.splice(index, 1);

        onChangeRelativePath();
      }
    }
  });
}

function onChangeRelativePath(indexRoot = null) {
  props.chainingConfigDto.rootRelativePaths = {};
  rootRelativePaths.value.forEach((el, index) => {
    if (indexRoot !== null && indexRoot === index) {
      el.value = null;
    }

    props.chainingConfigDto.rootRelativePaths[el.key] = el.value;
  });
}

watch(
  () => props.chainingConfigDto.rootRelativePaths,
  (rootRelativePathsValue: any) => {
    if (rootRelativePaths.value.length === 0) {
      Object.keys(rootRelativePathsValue).forEach((el) => {
        rootRelativePaths.value.push({
          key: el,
          value: rootRelativePathsValue[el]
        });
      });
    }
  },
  { immediate: true }
);

function getOptionsForMapping(id: string) {
  let dataMapping = props.dataMappingList.find((el) => el.id === id);
  let options: any = [];
  if (dataMapping) {
    const sampleContent = HelperContent.getSourceData(dataMapping.sampleContent || "", dataMapping);
    options = [
      {
        label: "root:/",
        labelShort: "root",
        value: "root:/",
        children: HelperMapper.relativePathOptions(sampleContent, "root:/", [], true)
      }
    ];
  }
  return options;
}
</script>

<style lang="scss">
.data-chaining-config-relative-paths {
  .td-mapping,
  .td-relative-path {
    width: 45%;
  }

  .table-chaining-config {
    width: 100%;
    border-collapse: collapse;

    td,
    th {
      border: 1px solid #dedede;
    }

    th {
      padding: 10px 20px;
      text-align: left;
      text-transform: uppercase;
    }

    td {
      .el-input__inner, .el-input__wrapper, .vue-treeselect__control, .el-select__wrapper {
        box-shadow: none !important;
        border-radius: 0;
        border: none;
      }

      &.action {
        padding: 5px 10px;
      }
    }
  }

  .header-actions {
    margin-bottom: 10px;
    text-align: right;
  }
}
</style>

<template>
  <div>
    <el-drawer append-to-body class="upload-file-sample-column-settings-history" size="600px" title="History information" v-model="drawerVisible" direction="rtl">
      <el-input class="wrap_filter" clearable v-if="configDto.fileType === 'CSV' || props.fileType === 'XML'" placeholder="Filter by field name" v-model="filter">
        <template slot="prepend">
          <font-awesome-icon icon="search" />
        </template>
      </el-input>
      <div
        v-for="(columnMappingConfig, index) in columnMappingConfigsComputed"
        :key="index"
        :class="{
          'wrap-box': true,
          'current-item': currentIndex === configDto.columnMappingConfigs.indexOf(columnMappingConfig)
        }"
      >
        <div class="wrap-row">
          <div class="wrap-row-title">
            <el-link @click.prevent="onClickTitle(columnMappingConfig)">
              <template v-if="configDto.fileType === 'CSV'">
                {{ columnMappingConfig.csvColumnName }}
              </template>
              <template v-else> Step {{ index + 1 }} </template>
            </el-link>
          </div>
          <template v-if="fileType === 'MySql'">
            <div class="sub-row">
              <div class="sub-row-title">Source Column Name</div>
              <div class="sub-row-value">
                {{ columnMappingConfig.srcColumnName || "-" }}
              </div>
            </div>
            <div class="sub-row">
              <div class="sub-row-title">Source Column Type</div>
              <div class="sub-row-value">
                {{ columnMappingConfig.srcColumnType || "-" }}
              </div>
            </div>
          </template>
          <div class="sub-row">
            <div class="sub-row-title">Alias</div>
            <div class="sub-row-value">
              {{ (columnMappingConfig && columnMappingConfig.dstColumnPath && columnMappingConfig.dstColumnPath.split(".").pop()) || "-" }}
            </div>
          </div>
          <div class="sub-row">
            <div class="sub-row-title">Mapper Class</div>
            <div class="sub-row-value">
              {{ (columnMappingConfig.mapperClass && columnMappingConfig.mapperClass.split("$").pop()) || "-" }}
            </div>
          </div>
          <div class="sub-row" v-if="columnMappingConfig.mapperFormatParam">
            <div class="sub-row-title">Mapper Parameters</div>
            <div class="sub-row-value">
              {{ columnMappingConfig.mapperFormatParam || "-" }}
            </div>
          </div>
          <template v-if="configDto.fileType === 'XML'">
            <div class="sub-row">
              <div class="sub-row-title">Xml Column XPath</div>
              <div class="sub-row-value">
                {{ columnMappingConfig.xmlColumnXPath || "-" }}
              </div>
            </div>
            <div class="sub-row">
              <div class="sub-row-title">Xml Column Name</div>
              <div class="sub-row-value">
                {{ columnMappingConfig.xmlColumnName || "-" }}
              </div>
            </div>
          </template>
        </div>
        <el-divider v-if="index !== configDto.columnMappingConfigs.length - 1" />
      </div>
    </el-drawer>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from "vue";

const emit = defineEmits(["navigation"]);
const props = defineProps({
  configDto: {
    default: () => {
      return {};
    }
  },
  fileType: {
    default: ""
  },
  currentIndex: {
    default: 0
  }
});
const columnMappingConfigsComputed = computed(() => {
  if (filter.value && props.configDto.fileType === "CSV") {
    return props.configDto.columnMappingConfigs.filter((columnMappingConfig: any) => {
      return columnMappingConfig.csvColumnName.toLowerCase().indexOf(filter.value.toLowerCase()) > -1;
    });
  }
  if (props.fileType === "XML") {
    return props.configDto.columnMappingConfigs.filter((columnMappingConfig: any) => {
      return columnMappingConfig.srcColumnName.toLowerCase().indexOf(filter.value.toLowerCase()) > -1;
    });
  }
  return props.configDto.columnMappingConfigs;
});

const filter = ref<string>("");

const drawerVisible = ref<boolean>(false);

function onClickTitle(columnMappingConfig: any) {
  drawerVisible.value = false;
  const index = props.configDto.columnMappingConfigs.indexOf(columnMappingConfig);
  emit("navigation", index);
}

watch(drawerVisible, (val: boolean) => {
  if (val) {
    filter.value = "";
  }
});
</script>

<style lang="scss">
.upload-file-sample-column-settings-history {
  .sub-row {
    display: flex;
    margin-bottom: 10px;
    padding: 0;
    border: 1px solid #dfe6ec;

    .sub-row-title {
      background: #eef1f6;
      padding: 5px 10px;
      width: 200px;
      margin-right: 10px;
    }

    .sub-row-value {
      padding: 5px 10px;
    }
  }

  .wrap-row-title {
    padding-left: 5px;
    margin-bottom: 5px;

    a {
      font-weight: bold;
    }
  }

  .current-item .wrap-row {
    .wrap-row-title a {
      color: #949f94 !important;
    }

    .sub-row {
      background-color: #f0f9eb;
      border-color: #c2e7b0;

      .sub-row-title {
        background-color: #e0ecde;
      }
    }
  }

  .wrap_filter {
    margin-bottom: 15px;
  }
}
</style>

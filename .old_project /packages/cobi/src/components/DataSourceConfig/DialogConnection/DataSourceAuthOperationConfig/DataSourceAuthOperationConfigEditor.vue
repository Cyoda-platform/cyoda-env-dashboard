<template>
  <div class="data-source-auth-operation-config-editor">
    <div class="inner">
      <div class="label">Response Param To Path Map</div>
      <div class="editor">
        <el-alert v-if="!isValidJson && jsonData" title="error" type="error" description="Content is not valid json" show-icon> </el-alert>
        <div class="editor">
          <div class="actions-body-template">
            <el-button class="btn-beautify" @click="onBeautify" type="primary" link>Beautify</el-button>
          </div>
          <CyodaEditor v-model="jsonData" language="json" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from "vue";

import prettyData from "../../../../helpers/PrettyData";
import HelperContent from "../../../../helpers/HelperContent";
import CyodaEditor from "@cyoda/ui-lib/src/components-library/elements/CyodaEditor/CyodaEditor.vue";

const props = defineProps({
  dataSourceAuthRespConfig: {
    default: () => {
      return {};
    }
  }
});
const isValidJson = computed(() => {
  return HelperContent.isJsonValid(jsonData.value);
});

const jsonData = ref<string>("");

function onBeautify() {
  jsonData.value = getPrettyData(jsonData.value);
}

function getPrettyData(data) {
  return prettyData.json(data);
}

watch(
  jsonData,
  (jsonData) => {
    if (isValidJson.value) {
      props.dataSourceAuthRespConfig.responseParamToPathMap = JSON.parse(jsonData);
    }
  }
);

watch(
  () => props.dataSourceAuthRespConfig.responseParamToPathMap,
  () => {
    let jsonDataValue: any = JSON.parse(JSON.stringify(props.dataSourceAuthRespConfig.responseParamToPathMap));
    const rootKey = Object.keys(jsonDataValue)[0];

    if (jsonDataValue && rootKey && jsonDataValue[rootKey].dtoName) {
      const dtoName = jsonDataValue[rootKey].dtoName;
      delete jsonDataValue[rootKey].dtoName;
      jsonDataValue[rootKey] = {
        "@bean": dtoName,
        ...jsonDataValue[rootKey]
      };
    }
    jsonData.value = getPrettyData(JSON.stringify(jsonDataValue)) || "";
  },
  { immediate: true }
);

defineExpose({ getPrettyData });
</script>

<style lang="scss">
.data-source-auth-operation-config-editor {
  .inner {
    display: flex;

    .label {
      padding-top: 10px;
      width: 240px;
      text-align: right;
      padding-right: 12px;

      //&:before {

      //}
    }

    .editor {
      flex-grow: 1;
    }
  }

  .actions-body-template {
    height: 40px;
    margin-bottom: 10px;
    display: flex;
    justify-content: flex-end;
    align-items: center;

    .btn-beautify {
      margin-left: 35px;
    }
  }

  .hint {
    font-size: 12px;
    color: #a1a0a0;
    line-height: normal;
    display: block;
    margin-top: 5px;
  }
}

//.data-source-auth-operation-config-editor {

//}
</style>

<template>
  <div class="body-template">
    <div class="inner">
      <div class="label">Body Template</div>
      <div class="editor">
        <div class="actions-body-template">
          <el-dropdown @command="handleCommand">
            <span class="el-dropdown-link">
              {{ selectedOptions.label }}
              <el-icon class="el-icon--right">
                <arrow-down/>
              </el-icon>
            </span>
            <template #dropdown>
              <el-dropdown-menu>
                <template v-for="dropdownOption in dropdownOptions" :key="dropdownOption.value">
                  <el-dropdown-item :command="dropdownOption">
                    {{ dropdownOption.label }}
                  </el-dropdown-item>
                </template>
              </el-dropdown-menu>
            </template>
          </el-dropdown>

          <el-button v-if="isShowBeautify" class="btn-beautify" @click="onBeautify" type="primary" link>Beautify</el-button>
        </div>

        <CyodaEditor v-model="form.bodyTemplate" :language="selectedOptions.mode"/>
        <span class="hint"> Support placeholders: ${name} </span>
      </div>
    </div>
    <el-form-item :rules="[{ required: true, message: 'Please input Body Template', trigger: 'blur' }]"
                  prop="bodyTemplate"/>
  </div>
</template>

<script setup lang="ts">
import {ref, computed} from "vue";

import prettyData from "../../helpers/PrettyData";
import CyodaEditor from "@cyoda/ui-lib/src/components-library/elements/CyodaEditor/CyodaEditor.vue";
import { ArrowDown } from '@element-plus/icons-vue'

let dropdownOptions = ref([
  {
    label: "Text",
    value: "text",
    mode: "plain"
  },
  {
    label: "JSON",
    value: "json",
    mode: "json"
  },
  {
    label: "XML",
    value: "xml",
    mode: "xml"
  }
]);

let selectedOptions = ref(dropdownOptions.value[0]);

const props = defineProps({
  form: {
    default: () => {
      return {};
    }
  }
});
const isShowBeautify = computed(() => {
  return ["json", "xml"].indexOf(selectedOptions.value.value) > -1;
});

checkType();

function checkType() {
  if (!props.form.bodyTemplate) props.form.bodyTemplate = "";
  if (props.form.bodyTemplate.indexOf("xml") > -1) {
    selectedOptions.value = dropdownOptions.value.find((el) => el.value == "xml");
    return;
  } else if (props.form.bodyTemplate.indexOf("{") > -1) {
    selectedOptions.value = dropdownOptions.value.find((el) => el.value == "json");
    return;
  }
  selectedOptions.value = dropdownOptions.value.find((el) => el.value == "text");
}

function handleCommand(option: any) {
  selectedOptions.value = option;
}

function onBeautify() {
  if (selectedOptions.value.value == "json") {
    props.form.bodyTemplate = prettyData.json(props.form.bodyTemplate.trim());
  } else if (selectedOptions.value.value == "xml") {
    props.form.bodyTemplate = prettyData.xml(props.form.bodyTemplate.trim());
  }
}
</script>

<style lang="scss">
.body-template {
  .inner {
    display: flex;

    .label {
      padding-top: 10px;
      width: 180px;
      text-align: right;
      padding-right: 12px;

      &:before {
        content: "*";
        color: #f56c6c;
        margin-right: 4px;
      }
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

    .el-dropdown-link {
      cursor: pointer;
      color: #409eff;
    }

    .el-icon-arrow-down {
      font-size: 12px;
    }

    .el-icon--right{
      top: 2px;
    }

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
</style>

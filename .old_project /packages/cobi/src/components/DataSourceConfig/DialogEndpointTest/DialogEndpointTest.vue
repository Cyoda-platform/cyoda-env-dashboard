<template>
  <div>
    <el-dialog class="dialog-endpoint-test" append-to-body :close-on-click-modal="false"
               title="Verify Template Calculation" v-model="dialogVisible" width="90%">
      <el-form ref="formRef" :model="form" label-width="120px">
        <el-form-item label="Auth Type">
          <el-select v-model="form.authType" placeholder="Select">
            <el-option v-for="item in authTypeOptions" :key="item.value" :label="item.label"
                       :value="item.value"></el-option>
          </el-select>
        </el-form-item>
      </el-form>

      <el-divider></el-divider>

      <div class="rows-actions">
        <el-button @click="onClickAdd" type="primary">
          Add record
          <font-awesome-icon icon="plus"/>
        </el-button>
      </div>

      <table class="table table-headers">
        <thead>
        <tr>
          <th>Name</th>
          <th>Value</th>
          <th></th>
        </tr>
        </thead>
        <tbody>
        <tr v-for="(userParameter, index) in userParameters" :key="index">
          <td>
            <el-autocomplete placeholder="Name" clearable value-key="label" :fetch-suggestions="suggestionsForName"
                             v-model="userParameter.name">
              <template v-slot:default="{ item }">{{ item.label }}</template>
            </el-autocomplete>
          </td>
          <td>
            <el-input v-model="userParameter.value" placeholder="Value"></el-input>
          </td>
          <td class="action">
            <el-button size="default" @click="onDeleteRow(index)" type="danger">
              <font-awesome-icon icon="trash"/>
            </el-button>
          </td>
        </tr>
        </tbody>
      </table>

      <el-divider></el-divider>

      <template #footer>
      <span class="dialog-footer">
        <el-button @click="dialogVisible = false">Close</el-button>
        <el-button type="success" @click="onRun">Run</el-button>
      </span>
      </template>
    </el-dialog>
    <DialogEndpointTestResultDialog ref="dialogEndpointTestResultDialogRef"
                                    :templateVerifcationResultDto="templateVerifcationResultDto"/>
  </div>
</template>

<script setup lang="ts">
import {useDataSourceConfigStore} from "../../../stores/data-source-config";
import {ElMessageBox} from "element-plus";
import {ref, watch} from "vue";

import _ from "lodash";
import DialogEndpointTestResultDialog from "./DialogEndpointTestResultDialog.vue";
import HelperContent from "../../../helpers/HelperContent";

const props = defineProps({
  httpEndpointDto: {
    default: () => {
      return {};
    }
  },
  placeholders: {
    default: () => {
      return [];
    }
  }
});
const dataSourceConfigStore = useDataSourceConfigStore();

function verifyTemplateCalc(value) {
  return dataSourceConfigStore.verifyTemplateCalc(value);
}

function getAvailableAuthType() {
  return dataSourceConfigStore.getAvailableAuthType();
}

const dialogEndpointTestResultDialogRef = ref(null);

const dialogVisible = ref<boolean>(false);
loadAvailableAuthType();

let userParameters = ref([]);

let defaultValue = ref({
  name: "",
  value: "",
  parameterType: "java.lang.String"
});

let form = ref({
  authType: "NONE"
});

let templateVerifcationResultDto = ref({});

let authTypeOptions = ref([]);

async function onRun() {
  const httpEndpointDto = JSON.parse(JSON.stringify(props.httpEndpointDto));
  delete httpEndpointDto['chatBotId'];
  const {data} = await verifyTemplateCalc({
    httpEndpointDto,
    userParameters: userParameters.value,
    authType: form.value.authType
  });
  templateVerifcationResultDto.value = data;
  dialogEndpointTestResultDialogRef.value.dialogVisible = true;
}

function onClickAdd() {
  userParameters.value.push(JSON.parse(JSON.stringify(defaultValue.value)));
}

function onDeleteRow(index: number) {
  ElMessageBox.confirm("Do you really want to remove record?", "Confirm!", {
    callback: async (action) => {
      if (action === "confirm") {
        userParameters.value.splice(index, 1);
      }
    }
  });
}

function suggestionsForName(queryString: string, cb: any) {
  let results: any[] = [];
  let parameters = props.httpEndpointDto.parameters.map((el) => {
    return {
      label: el.name,
      type: el.type
    };
  });
  let allSuggestions = _.uniqBy([...props.placeholders, ...parameters], "label");
  if (queryString) {
    results = allSuggestions.filter((el) => el.label.toLowerCase().indexOf(queryString.toLowerCase()));
  } else {
    results = allSuggestions;
  }
  cb(results);
}

async function loadAvailableAuthType() {
  const {data} = await getAvailableAuthType();
  authTypeOptions.value = HelperContent.transformEnumToOption(data);
}

watch(
  dialogVisible,
  (val) => {
    if (val && userParameters.value.length === 0) {
      userParameters.value.push(JSON.parse(JSON.stringify(defaultValue.value)));
    }
  },
  {immediate: true}
);

defineExpose({dialogVisible});
</script>

<style lang="scss">
.dialog-endpoint-test {
  .table-headers {
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
      .el-input__inner, .el-input__wrapper {
        box-shadow: none !important;
        border-radius: 0;
        border: none;
      }

      &.action {
        padding: 5px 10px;
      }
    }
  }

  .rows-actions {
    margin-bottom: 10px;
    text-align: right;
  }
}
</style>

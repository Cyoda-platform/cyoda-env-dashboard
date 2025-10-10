<template>
  <el-dialog append-to-body :close-on-click-modal="false" title="Data" v-model="dialogVisible" width="80%">
    <el-steps v-if="steps.length > 1" align-center :active="activeStep" finish-status="success">
      <el-step v-for="step in steps" :key="step" :title="step" />
    </el-steps>

    <div class="steps">
      <div v-if="steps[activeStep] === STEP_UPLOAD_FILE">
        <span class="message">Use already uploaded sample file</span>
        <el-divider>OR UPLOAD NEW SAMPLE CONTENT</el-divider>

        <div class="upload-file">
          <el-upload action="#" class="upload" drag :auto-upload="false" :on-change="onChange" :show-file-list="false">
            <el-icon class="el-icon--upload"><upload-filled /></el-icon>
            <div class="el-upload__text">Drop file here or <em>click to upload</em></div>
          </el-upload>
        </div>
      </div>

      <div v-if="steps[activeStep] === STEP_SET_META_PARAMETERS">
        <div class="action">
          <el-button @click="addNewMetaParameter" type="primary">Add
            <font-awesome-icon icon="plus"/>
          </el-button>
        </div>
        <table class="table">
          <thead>
            <tr>
              <th class="td-name">Name</th>
              <th>Value</th>
            <th></th>
          </tr>
          </thead>
          <tbody>
            <tr v-for="(row, index) in requestFieldsArr" :key="index">
              <td class="td-mapping" :class="row.type">
              <template v-if="row.type==='custom'">
                <el-input v-model="row.key"/>
              </template>
              <template v-else>
                {{ row.key }}
              </template>
              </td>
              <td>
                <el-input v-model="row.value" />
              </td>
            <td class="td-action">
              <template v-if="row.type==='custom'">
                <el-button size="small" @click="removeMetaParameter(row)" type="danger">
                  <font-awesome-icon icon="trash"/>
                </el-button>
              </template>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
    <template #footer>
      <div class="dialog-footer">
        <el-checkbox v-model="isUsedMetaParemeters">Use meta parameters</el-checkbox>
       <el-divider class="footer-divider" direction="vertical"></el-divider>
      <el-button @click="dialogVisible = false">Close</el-button>
        <template v-if="steps.length > 1">
          <el-button :disabled="activeStep === 0" @click="onPrev">Previous step</el-button>
          <el-button :disabled="activeStep === steps.length - 1" @click="onNext">Next step </el-button>
        </template>
        <el-button :disabled="activeStep !== steps.length - 1" @click="onRun" type="success">
          <template v-if="steps.length === 1"> Use current sample file </template>
          <template v-else> Run </template>
          <font-awesome-icon icon="play" />
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch } from "vue";

import _ from "lodash";
import { UploadFilled } from "@element-plus/icons-vue";
import {useScriptsStore} from "../../../stores/scripts";
import {ElMessageBox} from "element-plus";

const emit = defineEmits(["run"]);
const props = defineProps({
  dataMappingConfigDto: {
    default: () => {
      return {};
    }
  }
});

const listParams = computed(()=>{
  const functionalMappingMetaPaths = getListParamsFromFunctionalMappings();
  return _.uniq([...functionalMappingMetaPaths, ...listParamsFromScripts.value]);
});

const STEP_UPLOAD_FILE = "Sample Content";
const STEP_SET_META_PARAMETERS = "Set Meta parameters";

const dialogVisible = ref<boolean>(false);
let requestFieldsArr = ref([]);
const listParamsFromScripts = ref([]);
const isUsedMetaParemeters = ref(false);
const activeStep = ref(0);
let steps = ref([STEP_UPLOAD_FILE]);
let form = ref({
  sampleContent: "",
  requestFields: {}
});


const scriptsStore=useScriptsStore();
function getVersion(id){
  return scriptsStore.getVersion(id);
}

async function onChange(fileElement: any) {
  const file = fileElement.raw;
  let content = "";

  content = await getContent(file);
  form.value.sampleContent = content;
  if (steps.value.length === 1) {
    emit("run", form.value);
    dialogVisible.value = false;
    return;
  }
  activeStep.value += 1;
}

function onRun() {
  requestFieldsArr.value.forEach((el) => {
    form.value.requestFields[el.key] = el.value;
  });

  if (!form.value.sampleContent) {
    form.value.sampleContent = props.dataMappingConfigDto.sampleContent;
  }
  emit("run", form.value);
  dialogVisible.value = false;
}

async function openDialog(sampleContent) {
  dialogVisible.value = true;
  form.value.sampleContent = sampleContent;
  activeStep.value = 0;
  await getListParamsFromScripts();
}

function getContent(file: File) {
  let reader = new FileReader();
  reader.readAsText(file, "UTF-8");
  return new Promise((resolve, reject) => {
    reader.onload = function (evt: any) {
      resolve(evt.target.result);
    };
    reader.onerror = function (e: any) {
      reject(e);
    };
  });
}

function getListParamsFromFunctionalMappings() {
  const data = props.dataMappingConfigDto.entityMappings && props.dataMappingConfigDto.entityMappings.map((el) => {
    return el.functionalMappings.map((elFm) => {
      return elFm.metaPaths;
    })
  }) || [];
  return _.flattenDeep(data);
}

async function getListParamsFromScripts() {
  listParamsFromScripts.value = [];
  if (!props.dataMappingConfigDto.entityMappings) return [];
  let jsContent = "";
  let reusableScriptsAll = [];
  for (const entityMapping of props.dataMappingConfigDto.entityMappings) {
    jsContent += entityMapping.script.body;
    reusableScriptsAll = [...reusableScriptsAll, ...entityMapping.script.reusableScripts]
  }
  reusableScriptsAll = _.uniq(reusableScriptsAll);
  const values: any[] = await Promise.all(reusableScriptsAll.map((el) => getVersion(el)));
  values.forEach(({data}) => {
    jsContent += data;
  })

  const array = jsContent.matchAll(/meta(\.get)?[([]["']([^"']*)["'][)\]]/gm);
  [...array].forEach((el) => listParamsFromScripts.value.push(el[2]));
}

watch(
  listParams,
  () => {
    requestFieldsArr.value = listParams.value.map((el) => {
      return {
        key: el,
        value: "",
        type: "predefined",
      };
    });
    if(requestFieldsArr.value.length>0) isUsedMetaParemeters.value = true;
  },
  { immediate: true }
);

function addNewMetaParameter() {
  requestFieldsArr.value.push({
    key: "",
    value: "",
    type: "custom",
  })
}

function removeMetaParameter(row) {
  ElMessageBox.confirm("Dow you want remove meta parameter?", "Confirm!", {
    callback: async (action) => {
      if (action === "confirm") {
        requestFieldsArr.value = requestFieldsArr.value.filter((el) => el !== row);
      }
    }
  });
}

watch(isUsedMetaParemeters, (val)=>{
  if (val) {
    steps.value.push(STEP_SET_META_PARAMETERS);
  } else {
    steps.value = steps.value.filter((el) => el !== STEP_SET_META_PARAMETERS);
    activeStep.value = 0;
    requestFieldsArr.value = [];
  }
},{immediate: true})

function onPrev() {
  activeStep.value -= 1;
}

async function onNext() {
  activeStep.value += 1;
}

defineExpose({ dialogVisible, openDialog });
</script>

<style lang="scss" scoped>
.message {
  font-size: 20px;
  text-align: center;
  display: block;
}

.upload-file {
  max-width: 410px;
  margin: 0 auto;
  text-align: center;

  .actions-upload-file {
    margin-top: 20px;
  }
}

.action {
  text-align: right;
  margin-bottom: 15px;
}

.table {
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
    :deep(.el-input__inner), :deep(.el-input__wrapper) {
      box-shadow: none !important;
      border-radius: 0;
      border: none;
    }

    &.action {
      padding: 5px 10px;
    }

    &.td-mapping.predefined {
      background-color: #f5f7fa;
      padding-left: 15px;
    }

    :deep(.el-input__inner) {
      border-radius: 0;
      border: none;
    }
  }

  .td-action {
    text-align: center;
    width: 100px;
  }
}

.steps {
  margin-top: 25px;
}

.footer-divider {
  height: 20px;
}
</style>

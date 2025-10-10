<template>
  <el-dialog append-to-body :close-on-click-modal="false" title="Settings" v-model="dialogVisible" width="80%">
    <el-form ref="formRef" label-position="top" label-width="180px">
      <el-form-item label="Default Level">
        <el-select v-model="form.defaultLevel" placeholder="Select">
          <el-option v-for="level in levels" :key="level" :label="level" :value="level"> </el-option>
        </el-select>
      </el-form-item>
      <el-divider />
      <div class="actions">
        <el-button @click="onToggleAdditionalSettings" type="primary">
          <template v-if="isShowAllSettings"> Hide Additional Settings </template>
          <template v-else> Show Additional Settings </template>
        </el-button>
      </div>

      <el-collapse-transition>
        <div v-show="isShowAllSettings">
          <el-row :gutter="20">
            <el-col :span="8">
              <el-form-item label="Common Level">
                <el-select @clear="onClear('commonLevel')" clearable v-model="form.commonLevel" placeholder="Select">
                  <el-option v-for="level in levels" :key="level" :label="level" :value="level"> </el-option>
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="Parser Level">
                <el-select @clear="onClear('parserLevel')" clearable v-model="form.parserLevel" placeholder="Select">
                  <el-option v-for="level in levels" :key="level" :label="level" :value="level"> </el-option>
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="Transformer Level">
                <el-select @clear="onClear('transformerLevel')" clearable v-model="form.transformerLevel" placeholder="Select">
                  <el-option v-for="level in levels" :key="level" :label="level" :value="level"> </el-option>
                </el-select>
              </el-form-item>
            </el-col>

            <el-col :span="8">
              <el-form-item label="Entity Creator Level">
                <el-select @clear="onClear('entityCreatorLevel')" clearable v-model="form.entityCreatorLevel" placeholder="Select">
                  <el-option v-for="level in levels" :key="level" :label="level" :value="level"> </el-option>
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="Column Mapping Level">
                <el-select @clear="onClear('columnMappingLevel')" clearable v-model="form.columnMappingLevel" placeholder="Select">
                  <el-option v-for="level in levels" :key="level" :label="level" :value="level"> </el-option>
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="Functional Mapping Level">
                <el-select @clear="onClear('functionalMappingLevel')" clearable v-model="form.functionalMappingLevel" placeholder="Select">
                  <el-option v-for="level in levels" :key="level" :label="level" :value="level"> </el-option>
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>
        </div>
      </el-collapse-transition>
    </el-form>
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="dialogVisible = false">Close</el-button>
        <el-button type="success" @click="onRun">
          Run
          <font-awesome-icon icon="play" />
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref } from "vue";

import HelperStorage from "../../../helpers/HelperStorage";

const helperStorage = new HelperStorage();
const dryRunSettingsDialogKEY = "DryRunSettingsDialogKEY";

const props = defineProps({
  dataMappingConfigDto: {
    default: () => {
      return {};
    }
  }
});

const dialogVisible = ref<boolean>(false);

const isShowAllSettings = ref<boolean>(false);

let levels = ref(["TRACE", "DEBUG", "INFO", "WARN", "ERROR"]);
const emit=defineEmits(['run']);

let form = ref(
  helperStorage.get(dryRunSettingsDialogKEY, {
    defaultLevel: "TRACE",
    commonLevel: null,
    parserLevel: null,
    transformerLevel: null,
    entityCreatorLevel: null,
    columnMappingLevel: null,
    functionalMappingLevel: null
  })
);

async function onRun() {
  helperStorage.set(dryRunSettingsDialogKEY, form.value);
  dialogVisible.value = false;
  setTimeout(() => {
    emit("run");
  }, 500);
}

function onToggleAdditionalSettings() {
  isShowAllSettings.value = !isShowAllSettings.value;
}

function onClear(field: string) {
  form.value[field] = null;
}

defineExpose({ dialogVisible, form });
</script>

<style scoped>
.actions {
  margin-bottom: 10px;
}
</style>

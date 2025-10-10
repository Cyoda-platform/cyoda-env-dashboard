<template>
  <el-dialog :close-on-click-modal="false" append-to-body title="Collection Element Set Modes" v-model="dialogVisible" width="800px">
    <el-form ref="form" label-width="120px">
      <template v-for="elementSetMode in collectElemsSetModesLocal">
        <el-form-item label="Type">
          <el-select v-model="elementSetMode.type" placeholder="Select">
            <el-option v-for="item in collectionElementSetModeConfigTypeOptions" :key="item.value" :label="item.label" :value="item.value"> </el-option>
          </el-select>
        </el-form-item>
      </template>
    </el-form>
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="dialogVisible = false">Close</el-button>
        <el-button type="primary" @click="onClickSave">OK</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, watch } from "vue";

import HelperDictionary from "../../helpers/HelperDictionary";

const emit = defineEmits(["change"]);
const props = defineProps({
  path: {
    default: ""
  },
  collectElemsSetModes: {
    default: () => {
      return [];
    }
  }
});

const dialogVisible = ref<boolean>(false);

let collectElemsSetModesLocal = ref([]);

let collectionElementSetModeConfigTypeOptions = ref(HelperDictionary.collectionElementSetModeConfigTypeOptions());

function addSetModeConfigTypes() {
  if (collectElemsSetModesLocal.value.length > 0) return;

  const starCount = props.path
    .split("")
    .map((el) => el === "*")
    .filter((el) => el).length;
  for (let i = 0; i < starCount; i++) {
    props.collectElemsSetModes.push({
      type: "OVERRIDE"
    });
  }
}

async function onClickSave() {
  emit("change", JSON.parse(JSON.stringify(collectElemsSetModesLocal.value)));
  collectElemsSetModesLocal.value = [];
  dialogVisible.value = false;
}

watch(
  () => props.collectElemsSetModes,
  (value) => {
    collectElemsSetModesLocal.value = JSON.parse(JSON.stringify(value));
    addSetModeConfigTypes();
  },
  { immediate: true, deep: true }
);

defineExpose({ dialogVisible });
</script>

<style scoped lang="scss">
.column-mapping-set-modes {
  .icon {
    color: #67c23a;
    cursor: pointer;
    margin-left: 10px;
  }
}
</style>

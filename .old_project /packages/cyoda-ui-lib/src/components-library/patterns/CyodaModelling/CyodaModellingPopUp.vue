<template>
  <el-dialog :close-on-click-modal="false" class="cyoda-modelling-pop-up" append-to-body v-model="dialogVisible"
             width="90%">
    <template #header>
      <div>
        <div class="title flex">
          <h2>Columns</h2>
          <div class="actions-settings">
            <CyodaModellingPopUpToggles @change="onChangeToggles"/>
            <CyodaModellingPopUpSearch @change="onChangeSearch"/>
          </div>
        </div>
      </div>
    </template>
    <div class="limit-desc" v-if="limit && limit >= 0">You can select only {{ limit }} option</div>
    <template v-if="reportingInfoRows.length > 0">
      <el-checkbox-group v-model="selected">
        <CyodaModellingGroup v-if="isVisibleGroup" :onlyRange="onlyRange" :limit="limit"
                             :isOpenAllSelected="isOpenAllSelected" :isCondenseThePaths="isCondenseThePaths"
                             :search="search" :checked="selected" :requestClass="requestClass"
                             :reportInfoRows="reportingInfoRows" :relatedPaths="relatedPaths"
                             :disablePreview="disablePreview"/>
      </el-checkbox-group>
      <ConfigEditorReportsStreamGrid :title="streamGridAvailableTitle" @close="onCloseStreamGrid"
                                     v-if="isStreamGridAvailable" ref="configEditorReportsStreamGridRef"
                                     :isDeleteAvailable="isDeleteAvailable"/>
    </template>
    <template v-else>
      <el-alert title="No data" type="error" :closable="false"/>
    </template>
    <template #footer>
      <span class="dialog-footer">
        <template v-if="reportingInfoRows.length > 0">
          <el-button @click="dialogVisible = false">Cancel</el-button>
          <el-button type="primary" @click="addNew">Add</el-button>
        </template>
        <template v-else>
          <el-button @click="dialogVisible = false">Close</el-button>
        </template>
      </span>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import {ref, nextTick, watch, onBeforeUnmount, provide, inject} from "vue";

import * as api from "../../../api";
import {ColDef, RelatedPath, ReportingInfoRow} from "../../../../src/types/types";
import HelperModelling from "../../../helpers/HelperModelling";
import CyodaModellingPopUpToggles from "./CyodaModellingPopUpToggles.vue";
import CyodaModellingPopUpSearch from "./CyodaModellingPopUpSearch.vue";
import CyodaModellingGroup from "./CyodaModellingGroup.vue";
import ConfigEditorReportsStreamGrid from "../ConfigEditor/ConfigEditorReportsStreamGrid.vue";
import eventBus from "../../../plugins/eventBus";

const emit = defineEmits(["change"]);
const props = defineProps({
  requestClass: {
    default: ""
  },
  disablePreview: {
    default: false
  },
  checked: {
    default: () => {
      return [];
    }
  },
  onlyRange: {
    default: false
  },
  limit: {
    default: null
  }
});

const dialogVisible = ref<boolean>(false);

const isStreamGridAvailable = ref<boolean>(false);
const configEditorReportsStreamGridRef = ref(null);
const streamGridAvailableTitle = ref<string>("");

let reportingInfoRows = ref([]);
let relatedPaths = ref([]);
const isVisibleGroup = ref<boolean>(false);
const isOpenAllSelected = ref<boolean>(false);
const isCondenseThePaths = ref<boolean>(false);
const search = ref<string>("");
let selected = ref([]);

const isDeleteAvailable = inject('isDeleteAvailable', false);

eventBus.$on('streamGrid:open', streamGridOpen);

onBeforeUnmount(() => {
  eventBus.$off('streamGrid:open', streamGridOpen);
});

async function streamGridOpen({configDefinitionRequest, title}) {
  isStreamGridAvailable.value = true;
  await nextTick();

  configEditorReportsStreamGridRef.value.dialogVisible = true;
  configEditorReportsStreamGridRef.value.configDefinitionRequest = configDefinitionRequest;
  configEditorReportsStreamGridRef.value.onlyUniq = true;
  streamGridAvailableTitle.value = title;
  configEditorReportsStreamGridRef.value.loadPage();
}

watch(
  () => props.requestClass,
  async (val: string) => {
    if (val) {
      const {data} = await api.getReportingInfo(val, "", "", props.onlyRange);
      reportingInfoRows.value = HelperModelling.sortData(HelperModelling.filterData(data));
      const {data: relatedData} = await api.getReportingRelatedPaths(val);
      relatedPaths.value = relatedData;
    }
  },
  {immediate: true}
);

watch(dialogVisible, async (val: boolean) => {
  if (val) {
    isVisibleGroup.value = false;
    await nextTick();

    isVisibleGroup.value = true;
  }
});

function addNew() {
  dialogVisible.value = false;
  emit("change", JSON.parse(JSON.stringify(selected.value)));
  selected.value = [];
}

function onChangeToggles({
                           isOpenAllSelected: isOpenAllSelectedProp = false,
                           isCondenseThePaths: isCondenseThePathsProp = false
                         }) {
  isOpenAllSelected.value = isOpenAllSelectedProp;
  isCondenseThePaths.value = isCondenseThePathsProp;
}

function onChangeSearch({input = ""}) {
  search.value = input;
}

watch(
  () => props.checked,
  (val: ColDef[]) => {
    selected.value = val;
  },
  {immediate: true}
);

defineExpose({dialogVisible});
</script>

<style lang="scss">
.cyoda-modelling-pop-up {
  .el-dialog__body {
    padding: 30px;
  }

  .limit-desc {
    text-align: left;
    margin-bottom: 20px;
    margin-top: -25px;
  }

  .title.flex {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: -35px;
  }

  .actions-settings {
    margin-right: 50px;
  }

  .actions-settings-inner {
    .delimiter {
      margin-left: 20px;
      display: inline-block;
    }
  }
}
</style>

<template>
  <div>
    <el-dialog :close-on-click-modal="false" append-to-body @close="onClose" :title="titleComputed"
               v-model="dialogVisible" width="90%">
      <el-tabs v-model="selectedTab" :key="dialogId" v-loading="loading">
        <el-tab-pane label="Details" name="details">
          <Detail :key="keys.details" :isEditable="isEditable" v-if="selectedRow && selectedRow.id" :id="selectedRow.id"
                  :requestClass="configDefinition.requestClass" :entity="entity"/>
        </el-tab-pane>
        <el-tab-pane label="Data lineage" name="dataLineage">
          <template v-if="selectedRow && selectedRow.id">
            <DataLineage :key="keys.dataLineage" :requestClass="configDefinition.requestClass" :id="selectedRow.id"/>
          </template>
        </el-tab-pane>
        <el-tab-pane label="Audit" name="dataAudit">
          <template v-if="selectedRow && selectedRow.id">
            <TransitionChangesTable :key="keys.dataAudit" :disableLink="true" :type="configDefinition.requestClass"
                                    :entityId="selectedRow.id"/>
          </template>
        </el-tab-pane>
      </el-tabs>
      <template #footer>
      <span class="dialog-footer">
        <template v-if="isEditable">
          <el-button type="success" @click="onUpdateEntity">Update Entity</el-button>
        </template>
        <el-button type="primary" @click="onClose">Close</el-button>
      </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import {ElNotification} from "element-plus";
import {ref, computed, watch, onBeforeUnmount} from "vue";
import HelperFormat from "@cyoda/ui-lib/src/helpers/HelperFormat";

import * as api from "../../../api";
import Detail from "./AdaptableBlotterEntity/Detail.vue";
import HelperDetailEntity from "../../../helpers/HelperDetailEntity";

import {Entity, IDefinitionContent, StateReportsSettings} from "@cyoda/ui-lib/src/types/types";
import DataLineage from "../../../components-library/patterns/DataLineage/DataLineage.vue";

import TransitionChangesTable
  from "../../../components-library/patterns/PmTransitionChanges/TransitionChangesTable.vue";
import eventBus from "../../../plugins/eventBus";
import {useDetailEntityStore} from "@cyoda/http-api/src/stores/detail-entity";
import {useReportsStore} from "@cyoda/http-api/src/stores/reports";
import HelperEntities from "../../../helpers/HelperEntities";

const props = defineProps({
  selectedRow: {
    default: () => {
      return {};
    }
  },
  configDefinition: {
    default: () => {
      return {};
    }
  },
  isEditable: {
    default: false
  },
  reportDefinitionId: {
    default: ""
  }
});
const detailEntityStore = useDetailEntityStore();
const reportsStore = useReportsStore();
const getStoredSettings = computed(() => {
  return reportsStore.getStoredSettings;
});
const storedSettings = computed(() => {
  return getStoredSettings.value(props.reportDefinitionId);
});
const titleComputed = computed(() => {
  return `Entity ${props.configDefinition.requestClass && HelperEntities.getShortNameOfEntity(props.configDefinition.requestClass)} (${getId()})`;
});

function clearAddEditableItem() {
  return detailEntityStore.clearAddEditableItem();
}

const selectedTab = ref<string>("details");

const dialogId = ref(0);

let keys = ref({
  details: 0,
  dataLineage: 0,
  dataAudit: 0
});

const dialogVisible = ref<boolean>(false);
let entity = ref([]);

const loading = ref<boolean>(false);

eventBus.$on("dialogEntityChangeTransition", loadData);

onBeforeUnmount(() => {
  eventBus.$off("dialogEntityChangeTransition", loadData);
});

watch(
  () => props.selectedRow,
  () => {
    if (!props.selectedRow) return;
    const id = getId();
    if (id) {
      dialogId.value += 1;
      selectedTab.value = "details";
      dialogVisible.value = true;
      loadData();
    } else {
      ElNotification({
        title: 'Warning',
        message: 'The id field not contains value',
        type: 'warning',
      });
    }
  }
);

function getId(): string | undefined {
  if (props.selectedRow && Object.keys(props.selectedRow).length > 0) {
    if (storedSettings.value && storedSettings.value.settings && storedSettings.value.settings.idField) {
      const idField = HelperFormat.shortNamePath(storedSettings.value.settings.idField).replaceAll('.', '_');
      return props.selectedRow[idField];
    } else if (props.selectedRow.id) {
      return props.selectedRow.id;
    } else {
      ElNotification({
        title: "Warning",
        message: "The id field is not found in row. Please add id to report columns or select another field in settings before that report",
        type: "warning"
      });
    }
  }
  return undefined;
}

async function loadData() {
  const id = getId();
  if (!props.configDefinition.requestClass || !dialogVisible.value || !id) return;
  loading.value = true;
  try {
    const {data} = await api.getEntityLoad(id!, props.configDefinition.requestClass);
    entity.value = HelperDetailEntity.filterData(data);
  } finally {
    loading.value = false;
  }
}

function onClose() {
  dialogVisible.value = false;
  clearAddEditableItem();
  eventBus.$emit("dialogEntityClose");
}

function onUpdateEntity() {
  eventBus.$emit("entity:update");
}

watch(selectedTab, (key) => {
  keys.value[key] += 1;
});
</script>

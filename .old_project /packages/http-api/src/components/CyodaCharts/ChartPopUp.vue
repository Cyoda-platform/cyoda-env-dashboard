<template>
  <el-dialog ref="rootRef" :close-on-click-modal="false" :fullscreen="true" class="chart-builder-pop-up"
             title="Charts Builder" v-model="dialogVisible" width="90%">
    <div class="row">
      <div class="col left" :span="16">
        <div class="wrap-settings-form">
          <el-tabs>
            <el-tab-pane label="Settings">
              <ChartSettings @changeSettings="onChangeSettings" @changeDataSource="changeDataSource"
                             ref="chartSettingsRef" :configDefinition="configDefinition"
                             :tableLinkGroup="tableLinkGroup" :settings="settings"/>
            </el-tab-pane>
            <el-tab-pane label="Customize">
              <ChartSettingsCustomize :settings="settings"/>
            </el-tab-pane>
          </el-tabs>
        </div>
      </div>
      <div class="col right">
        <h2>Preview</h2>
        <ChartWrapper :tableLinkGroup="tableLinkGroup" :settings="settings"/>
      </div>
    </div>

    <template #footer>
      <span class="dialog-footer">
      <el-button @click="dialogVisible = false">Cancel</el-button>
      <template v-if="action === 'create'">
        <el-button type="primary" @click="onClickAdd">Add</el-button>
      </template>
      <template v-if="action === 'update'">
        <el-button type="primary" @click="onClickUpdate">Update</el-button>
      </template>
    </span>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import {ref, nextTick, watch} from "vue";

import ChartWrapper from "./wrappers/ChartWrapper.vue";
import ChartSettings from "./ChartSettings.vue";
import ChartSettingsCustomize from "./ChartSettingsCustomize.vue";

const emit = defineEmits(["create", "edit"]);
const props = defineProps({
  tableLinkGroup: {default: ""},
  configDefinition: {
    default: () => {
      return {};
    }
  },
  reportDefinitionId: {default: ""}
});

const dialogVisible = ref<boolean>(false);
const action = ref<string>("");
let settings = ref({});
const rootRef=ref(null);

const chartSettingsRef = ref(null);

let defaultSettings = ref({
  reportDefinitionId: "",
  name: "",
  chartType: "",
  dataSource: "",
  columns: [],
  xAxis: {
    chartData: {},
    chartLabel: {}
  },
  style: {
    backgroundColor: null,
    borderColor: null,
    verticalAxisColor: null,
    horizontalAxisColor: null
  },
  options: {
    legend: {
      position: "top"
    },
    title: {
      display: true,
      text: ""
    }
  }
});

function onClickAdd() {
  chartSettingsRef.value.form.validate((valid: boolean) => {
    if (valid) {
      emit("create", JSON.parse(JSON.stringify(settings.value)));
      dialogVisible.value = false;
    }
  });
}

function onClickUpdate() {
  chartSettingsRef.value.form.validate((valid: boolean) => {
    if (valid) {
      emit("edit", JSON.parse(JSON.stringify(settings.value)));
      dialogVisible.value = false;
    }
  });
}


watch(dialogVisible, async (val: boolean) => {

  if (val) {
    settings.value = JSON.parse(JSON.stringify(defaultSettings.value));
    settings.value.reportDefinitionId = props.reportDefinitionId;

    await nextTick();

    chartSettingsRef.value.form.clearValidate();
    let colRight = rootRef.value.querySelector(".col.right");
    if (colRight) {
      $(colRight).resizable({
        helper: "ui-resizable-helper",
        handles: "n, e, s, w, ne, se, sw, nw",
        stop: () => {
          setChartHeight();
        }

      })
      setChartHeight();
    }
  } else {
    const colRightBox = (rootRef.value && rootRef.value.querySelector(".col.right")) || null;
    if (colRightBox) {
      $(colRightBox).resizable("destroy");
    }
  }
}, {immediate: true});


function onChangeSettings() {
  setChartHeight();
}

function setChartHeight() {
  const colRightBox: HTMLElement | null = rootRef.value.querySelector(".col.right");
  const chartBaseBox: HTMLElement | null = colRightBox.querySelector(".chart-base");
  if (colRightBox && chartBaseBox) {
    const height = colRightBox.offsetHeight;
    chartBaseBox.style.height = `${height}px`;
    window.dispatchEvent(new Event("resize"));
  }
}

function changeDataSource() {
  settings.value.xAxis = {
    chartData: {},
    chartLabel: {}
  };
  settings.value.columns = [];
}

defineExpose({dialogVisible, action, settings});
</script>

<style lang="scss">
.chart-builder-pop-up {
  .wrap-settings-form {
    margin-top: 20px;
    margin-right: 40px;
  }

  .row {
    display: flex;
    flex-wrap: wrap;

    .left {
      flex-grow: 1;
      //border-right: 1px solid #dedede;
    }

    .right {
      padding: 10px;
      border: 1px solid #dedede;
      left: 0 !important;
      min-width: 300px;
    }
  }

  .el-transfer-panel {
    width: 200px;
  }
}
</style>

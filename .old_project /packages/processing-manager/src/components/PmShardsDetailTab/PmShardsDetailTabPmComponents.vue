<template>
  <div>
    <div class="row">
      <div class="col-sm-12">
        <div class="card">
          <div class="card-body">
            <div class="wrap-title flex">
              <h3>PM components</h3>
              <span>
                <PmShardsDetailTabPmComponentsClear />
              </span>
            </div>

            <el-tabs v-model="tabsHistoryValue">
              <el-tab-pane label="Execution Queues Info">
                <PmShardsDetailTabPmComponentsExecutionQueuesInfo />
              </el-tab-pane>
              <el-tab-pane label="Execution Monitors">
                <PmShardsDetailTabPmComponentsExecutionMonitors />
              </el-tab-pane>
              <el-tab-pane label="Service Processes View">
                <PmShardsDetailTabPmComponentsServiceProcessesView />
              </el-tab-pane>
              <el-tab-pane label="Cyoda Runnable Components">
                <PmShardsDetailTabPmComponentsCyodaRunnableComponents />
              </el-tab-pane>
            </el-tabs>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import PmShardsDetailTabPmComponentsExecutionQueuesInfo from "../../components/PmShardsDetailTab/PmShardsDetailTabPmComponents/PmShardsDetailTabPmComponentsExecutionQueuesInfo.vue";
import PmShardsDetailTabPmComponentsExecutionMonitors from "../../components/PmShardsDetailTab/PmShardsDetailTabPmComponents/PmShardsDetailTabPmComponentsExecutionMonitors.vue";
import PmShardsDetailTabPmComponentsServiceProcessesView from "../../components/PmShardsDetailTab/PmShardsDetailTabPmComponents/PmShardsDetailTabPmComponentsServiceProcessesView.vue";
import PmShardsDetailTabPmComponentsCyodaRunnableComponents from "../../components/PmShardsDetailTab/PmShardsDetailTabPmComponents/PmShardsDetailTabPmComponentsCyodaRunnableComponents.vue";
import PmShardsDetailTabPmComponentsClear from "../../components/PmShardsDetailTab/PmShardsDetailTabPmComponents/PmShardsDetailTabPmComponentsClear.vue";

import useTabsHistory from "@cyoda/ui-lib/src/mixins/TabsHistoryMixin";

const {tabsHistoryValue} = useTabsHistory('pmShardsDetailTabPmComponentsTab');
</script>

<style scoped lang="scss">
.flex {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.wrap-title {
  margin-bottom: 15px;
  h3 {
    display: inline;
  }
}
</style>

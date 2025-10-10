<template>
  <div>
    <div class="row">
      <div class="col-sm-12">
        <div class="card">
          <div class="card-body">
            <h3>Processing Events</h3>

            <el-tabs v-model="tabsHistoryValue">
              <el-tab-pane label="Process Events Statistics">
                <PmProcessEventsStatistics />
              </el-tab-pane>
              <el-tab-pane label="Polling info">
                <PmPollingInfo />
              </el-tab-pane>
              <el-tab-pane label="Processing events view">
                <PmProcessingEventsView />
              </el-tab-pane>
              <el-tab-pane label="Processing events error view">
                <PmProcessingEventsErrorView />
              </el-tab-pane>
              <el-tab-pane label="Entities error list view">
                <PmProcessingEventsEntitiesErrorListView />
              </el-tab-pane>
              <el-tab-pane label="SIFT logger conf view">
                <PmSiftLoggerConfView />
              </el-tab-pane>
            </el-tabs>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import PmBarChartStacked from "../../components/PmCharts/PmBarChartStacked.vue";
import PmPollingInfo from "../../components/PmShardsDetailTab/ProcessingEvents/PmPollingInfo.vue";
import PmProcessingEventsView from "../../components/PmShardsDetailTab/ProcessingEvents/PmProcessingEventsView.vue";
import PmProcessEventsStatistics from "../../components/PmShardsDetailTab/ProcessingEvents/PmProcessEventsStatistics.vue";
import PmSiftLoggerConfView from "../../components/PmShardsDetailTab/ProcessingEvents/PmSiftLoggerConfView.vue";
import PmProcessingEventsErrorView from "../../components/PmShardsDetailTab/PmProcessingEventsErrorView/PmProcessingEventsErrorView.vue";
import PmProcessingEventsEntitiesErrorListView from "../../components/PmShardsDetailTab/PmProcessingEventsEntitiesErrorListView/PmProcessingEventsEntitiesErrorListView.vue";
import useTabsHistory from "@cyoda/ui-lib/src/mixins/TabsHistoryMixin";

const {tabsHistoryValue} = useTabsHistory("pmShardsDetailTabProcessingEventsTab")
</script>

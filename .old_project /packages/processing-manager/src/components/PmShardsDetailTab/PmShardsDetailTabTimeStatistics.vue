<template>
  <div>
    <div class="row">
      <div class="col-sm-12">
        <div class="card">
          <div class="card-body">
            <div class="wrap-title flex">
              <h3>Time statistics</h3>
              <span>
                <PmShardsDetailTabTimeStatisticsClear @reload="onReload" />
              </span>
            </div>

            <el-tabs v-model="tabsHistoryValue">
              <el-tab-pane label="Time stats">
                <PmShardsDetailTabTimeStatisticsTimeStat ref="pmShardsDetailTabTimeStatisticsTimeStatRef" />
              </el-tab-pane>
              <el-tab-pane label="Count stats">
                <PmShardsDetailTabTimeStatisticsCountStat ref="pmShardsDetailTabTimeStatisticsCountStatRef" />
              </el-tab-pane>
            </el-tabs>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";

import PmShardsDetailTabTimeStatisticsTimeStat from "../../components/PmShardsDetailTab/PmShardsDetailTabTimeStatistics/PmShardsDetailTabTimeStatisticsTimeStat.vue";
import PmShardsDetailTabTimeStatisticsCountStat from "../../components/PmShardsDetailTab/PmShardsDetailTabTimeStatistics/PmShardsDetailTabTimeStatisticsCountStat.vue";
import PmShardsDetailTabTimeStatisticsClear from "../../components/PmShardsDetailTab/PmShardsDetailTabTimeStatistics/PmShardsDetailTabTimeStatisticsClear.vue";

import useTabsHistory from "@cyoda/ui-lib/src/mixins/TabsHistoryMixin";

const {tabsHistoryValue} = useTabsHistory("pmShardsDetailTabTimeStatisticsTab")

const pmShardsDetailTabTimeStatisticsTimeStatRef = ref(null);

const pmShardsDetailTabTimeStatisticsCountStatRef = ref(null);

function onReload() {
  pmShardsDetailTabTimeStatisticsTimeStatRef.value.loadData();
  pmShardsDetailTabTimeStatisticsCountStatRef.value.loadData();
}
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

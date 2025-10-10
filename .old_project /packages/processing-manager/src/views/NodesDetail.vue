<template>
  <ViewWrapper>
    <div class="row">
      <div class="col-sm-12">
        <el-tabs v-model="tabsHistoryValue">
          <el-tab-pane :lazy="true" label="Processing Manager">
            <PmShardsDetailTabProcessingManager/>
          </el-tab-pane>
          <el-tab-pane :lazy="true" label="Server Summary">
            <PmShardsDetailTabSummary/>
          </el-tab-pane>
          <el-tab-pane :lazy="true" label="Cassandra">
            <PmShardsDetailTabCassandra/>
          </el-tab-pane>
          <el-tab-pane :lazy="true" label="Processing Events">
            <PmShardsDetailTabProcessingEvents/>
          </el-tab-pane>
          <el-tab-pane :lazy="true" label="Time Statistics">
            <PmShardsDetailTabTimeStatistics/>
          </el-tab-pane>
          <el-tab-pane :lazy="true" label="Transactions">
            <PmShardsDetailTabTransactions/>
          </el-tab-pane>
          <el-tab-pane :lazy="true" label="PM components">
            <PmShardsDetailTabPmComponents/>
          </el-tab-pane>
          <el-tab-pane :lazy="true" label="Composite indexes">
            <PmShardsDetailTabCompositeIndexes/>
          </el-tab-pane>
          <el-tab-pane :lazy="true" label="Caches List">
            <PmShardsDetailTabCachesList/>
          </el-tab-pane>
          <el-tab-pane :lazy="true" label="Network info">
            <PmShardsDetailTabNetworkInfo/>
          </el-tab-pane>
          <el-tab-pane :lazy="true" label="ZooKeeper info">
            <PmShardsDetailTabZKInfo/>
          </el-tab-pane>
        </el-tabs>
      </div>
    </div>
  </ViewWrapper>
</template>

<script setup lang="ts">
import PmShardsDetailTabProcessingEvents
  from "../components/PmShardsDetailTab/PmShardsDetailTabProcessingEvents.vue";
import PmShardsDetailTabProcessingManager
  from "../components/PmShardsDetailTab/PmShardsDetailTabProcessingManager.vue";
import PmShardsDetailTabSummary from "../components/PmShardsDetailTab/PmShardsDetailTabSummary.vue";
import PmShardsDetailTabTimeStatistics
  from "../components/PmShardsDetailTab/PmShardsDetailTabTimeStatistics.vue";
import PmShardsDetailTabTransactions
  from "../components/PmShardsDetailTab/PmShardsDetailTabTransactions.vue";
import PmShardsDetailTabCassandra
  from "../components/PmShardsDetailTab/PmShardsDetailTabCassandra.vue";
import PmShardsDetailTabPmComponents
  from "../components/PmShardsDetailTab/PmShardsDetailTabPmComponents.vue";
import PmShardsDetailTabCompositeIndexes
  from "../components/PmShardsDetailTab/PmShardsDetailTabCompositeIndexes.vue";
import PmShardsDetailTabCachesList
  from "../components/PmShardsDetailTab/PmShardsDetailTabCachesList.vue";
import PmShardsDetailTabNetworkInfo
  from "../components/PmShardsDetailTab/PmShardsDetailTabNetworkInfo.vue";
import PmShardsDetailTabZKInfo from "../components/PmShardsDetailTab/PmShardsDetailTabZKInfo.vue";
import ViewWrapper from "../components/ViewWrapper.vue";
import useTabsHistory from "@cyoda/ui-lib/src/mixins/TabsHistoryMixin";

const {tabsHistoryValue} = useTabsHistory('nodesDetailTab');
</script>

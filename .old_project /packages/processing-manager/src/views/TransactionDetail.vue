<template>
  <ViewWrapper>
    <div class="transaction-detail">
      <el-tabs v-model="tabsHistoryValue">
        <el-tab-pane label="Transaction main statistics">
          <TransitionDetailStatistics />
        </el-tab-pane>
        <el-tab-pane label="Transaction members">
          <TransitionDetailStatisticsTransactionMembers />
        </el-tab-pane>
        <el-tab-pane label="Transaction events">
          <TransitionDetailStatisticsTransactionEvents />
        </el-tab-pane>
      </el-tabs>
    </div>
  </ViewWrapper>
</template>

<script setup lang="ts">
import TransitionDetailStatistics from "../components/PmTransitionDetail/TransitionDetailStatistics.vue";
import TransitionDetailStatisticsTransactionMembers from "../components/PmTransitionDetail/TransitionDetailStatisticsTransactionMembers.vue";
import TransitionDetailStatisticsTransactionEvents from "../components/PmTransitionDetail/TransitionDetailStatisticsTransactionEvents.vue";
import ViewWrapper from "../components/ViewWrapper.vue";
import useTabsHistory from "@cyoda/ui-lib/src/mixins/TabsHistoryMixin";

const {tabsHistoryValue} = useTabsHistory('transactionDetailTab');
</script>

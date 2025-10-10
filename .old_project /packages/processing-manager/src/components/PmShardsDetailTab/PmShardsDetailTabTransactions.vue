<template>
  <div>
    <div class="row">
      <div class="col-sm-12">
        <div class="card">
          <div class="card-body">
            <div class="wrap-title flex">
              <h3>Transactions</h3>
              <span>
                <PmShardsDetailTabTransactionsClear />
              </span>
            </div>

            <el-tabs v-model="tabsHistoryValue">
              <el-tab-pane label="Executing transactions">
                <PmShardsDetailTabTransactionsExecuting />
              </el-tab-pane>
              <el-tab-pane label="Transactions view">
                <PmShardsDetailTabTransactionsView />
              </el-tab-pane>
              <el-tab-pane label="Entities list view">
                <PmShardsDetailTabTransactionsEntities />
              </el-tab-pane>
            </el-tabs>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import PmShardsDetailTabTransactionsExecuting from "../../components/PmShardsDetailTab/PmShardsDetailTabTransactions/PmShardsDetailTabTransactionsExecuting.vue";
import PmShardsDetailTabTransactionsView from "../../components/PmShardsDetailTab/PmShardsDetailTabTransactions/PmShardsDetailTabTransactionsView.vue";
import PmShardsDetailTabTransactionsClear from "../../components/PmShardsDetailTab/PmShardsDetailTabTransactions/PmShardsDetailTabTransactionsClear.vue";
import PmShardsDetailTabTransactionsEntities from "../../components/PmShardsDetailTab/PmShardsDetailTabTransactions/PmShardsDetailTabTransactionsEntities.vue";

import useTabsHistory from "@cyoda/ui-lib/src/mixins/TabsHistoryMixin";

const {tabsHistoryValue} = useTabsHistory("pmShardsDetailTabTransactionsTab")
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

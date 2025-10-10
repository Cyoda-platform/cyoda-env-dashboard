<template>
  <div class="pm-shards-detail-tab-composite-indexes">
    <div class="row">
      <div class="col-sm-12">
        <div class="card">
          <div class="card-body">
            <PmCompositeIndexes />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import PmCompositeIndexes from "../../components/PmShardsDetailTab/PmShardsDetailTabCompositeIndexes/PmCompositeIndexes.vue";
</script>

<style lang="scss">
.pm-shards-detail-tab-composite-indexes {
  h1 {
    font-size: 1.53125rem !important;
  }
  .el-table td {
    border-bottom: none !important;
  }
  .table thead th {
    border-top: none !important;
  }
}
.el-dialog__wrapper.cyoda-modelling-pop-up {
  .actions-settings-inner {
    display: flex;
  }
  .el-dialog__header {
    border: none;
  }
}
</style>

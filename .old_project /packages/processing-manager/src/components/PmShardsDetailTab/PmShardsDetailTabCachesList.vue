<template>
  <div class="pm-shards-detail-tab-caches-list">
    <div class="row">
      <div class="col-sm-12">
        <div class="card">
          <div class="card-body">
            <PmCachesList />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import PmCachesList from "../../components/PmShardsDetailTab/PmShardsDetailTabCachesList/PmShardsDetailTabCachesList.vue";
</script>

<style lang="scss">
.pm-shards-detail-tab-caches-list {
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
</style>

<template>
  <div class="card pm-shards-detail-tab-zk-info">
    <ZooKeeperInfoView :getZkInfoClusterStateRequestFn="getZkInfoClusterStateRequest">
      <template #default="{clusterState}">
        <div class="card-header">ZooKeeper info</div>
        <div class="card-body">
          <PmCurrNodeInfo :clusterStateCurrentNode="clusterState.currentNode"/>
          <hr/>
          <PmLoadedOnlineNodes :clusterStateClientNodes="clusterState.clientNodes"/>
          <hr/>
          <PmLoadedShardsDistribution :clusterStateShardsDistr="clusterState.shardsDistrState"
                                      :clusterState="clusterState"/>
        </div>
      </template>
    </ZooKeeperInfoView>
  </div>
</template>

<script setup lang="ts">
import PmCurrNodeInfo
  from "../../components/PmShardsDetailTab/PmShardsDetailTabZKInfo/PmCurrNodeInfo.vue";
import PmLoadedOnlineNodes
  from "../../components/PmShardsDetailTab/PmShardsDetailTabZKInfo/PmLoadedOnlineNodes.vue";
import PmLoadedShardsDistribution
  from "../../components/PmShardsDetailTab/PmShardsDetailTabZKInfo/PmLoadedShardsDistribution.vue";
import ZooKeeperInfoView from "@cyoda/http-api/src/views/ZooKeeperInfoView.vue";
import {useCommonStore} from "../../stores/common";

const commonStore = useCommonStore();

function getZkInfoClusterStateRequest() {
  return commonStore.platformCommonZkInfoClusterState();
}
</script>

<style lang="scss">
.pm-shards-detail-tab-zk-info {
  h1.label {
    font-size: 18px;
  }
}
</style>

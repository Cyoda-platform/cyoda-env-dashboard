/**
 * Shards Detail Tab - ZooKeeper Info
 * Tab showing ZooKeeper information
 * Migrated from @cyoda/processing-manager/src/components/PmShardsDetailTab/PmShardsDetailTabZKInfo.vue
 */

import React from 'react';
import { Divider, Spin } from 'antd';
import { CurrNodeInfo, LoadedOnlineNodes, LoadedShardsDistribution } from '../zookeeper-info';
import { useZkClusterState } from '../../hooks/usePlatformCommon';
import './ShardsDetailTabZKInfo.scss';

export const ShardsDetailTabZKInfo: React.FC = () => {
  const { data: clusterState, isLoading } = useZkClusterState();

  if (isLoading) {
    return <Spin />;
  }

  return (
    <div className="zk-info-tab">
      <h3 className="zk-info-title">ZooKeeper Info</h3>

      <CurrNodeInfo clusterStateCurrentNode={(clusterState as any)?.currentNode} />

      <Divider style={{ margin: '12px 0' }} />

      <LoadedOnlineNodes clusterStateClientNodes={(clusterState as any)?.clientNodes} />

      <Divider style={{ margin: '12px 0' }} />

      <LoadedShardsDistribution
        clusterStateShardsDistr={(clusterState as any)?.shardsDistrState}
        clusterState={clusterState}
      />
    </div>
  );
};

export default ShardsDetailTabZKInfo;


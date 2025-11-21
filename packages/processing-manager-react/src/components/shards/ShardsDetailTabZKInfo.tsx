/**
 * Shards Detail Tab - ZooKeeper Info
 * Tab showing ZooKeeper information
 * Migrated from @cyoda/processing-manager/src/components/PmShardsDetailTab/PmShardsDetailTabZKInfo.vue
 */

import React from 'react';
import { Divider } from 'antd';
import { CurrNodeInfo, LoadedOnlineNodes, LoadedShardsDistribution } from '../zookeeper-info';
import './ShardsDetailTabZKInfo.scss';

export const ShardsDetailTabZKInfo: React.FC = () => {
  return (
    <div className="zk-info-tab">
      <h3 className="zk-info-title">ZooKeeper Info</h3>

      <CurrNodeInfo />

      <Divider style={{ margin: '12px 0' }} />

      <LoadedOnlineNodes />

      <Divider style={{ margin: '12px 0' }} />

      <LoadedShardsDistribution />
    </div>
  );
};

export default ShardsDetailTabZKInfo;


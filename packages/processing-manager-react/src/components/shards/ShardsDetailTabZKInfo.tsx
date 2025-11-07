/**
 * Shards Detail Tab - ZooKeeper Info
 * Tab showing ZooKeeper information
 * Migrated from @cyoda/processing-manager/src/components/PmShardsDetailTab/PmShardsDetailTabZKInfo.vue
 */

import React, { useState } from 'react';
import { Tabs } from 'antd';
import { CurrNodeInfo, LoadedOnlineNodes, LoadedShardsDistribution } from '../zookeeper-info';
import './ShardsDetailTabZKInfo.scss';

const { TabPane } = Tabs;

export const ShardsDetailTabZKInfo: React.FC = () => {
  const [activeKey, setActiveKey] = useState('1');

  return (
    <div className="zk-info-tab">
      <h3 className="zk-info-title">ZooKeeper Info</h3>
      <Tabs activeKey={activeKey} onChange={setActiveKey}>
        <TabPane tab="Current Node Info" key="1">
          <CurrNodeInfo />
        </TabPane>
        <TabPane tab="Loaded Online Nodes" key="2">
          <LoadedOnlineNodes />
        </TabPane>
        <TabPane tab="Loaded Shards Distribution" key="3">
          <LoadedShardsDistribution />
        </TabPane>
      </Tabs>
    </div>
  );
};

export default ShardsDetailTabZKInfo;


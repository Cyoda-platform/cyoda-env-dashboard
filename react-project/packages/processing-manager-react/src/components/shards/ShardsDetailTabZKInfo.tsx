/**
 * Shards Detail Tab - ZooKeeper Info
 * Tab showing ZooKeeper information
 * Migrated from @cyoda/processing-manager/src/components/PmShardsDetailTab/PmShardsDetailTabZKInfo.vue
 */

import React, { useState } from 'react';
import { Card, Tabs } from 'antd';

const { TabPane } = Tabs;

export const ShardsDetailTabZKInfo: React.FC = () => {
  const [activeKey, setActiveKey] = useState('1');

  return (
    <Card>
      <h3>ZooKeeper Info</h3>
      <Tabs activeKey={activeKey} onChange={setActiveKey}>
        <TabPane tab="Current Node Info" key="1">
          <div>Current node info - To be implemented</div>
        </TabPane>
        <TabPane tab="Loaded Online Nodes" key="2">
          <div>Loaded online nodes - To be implemented</div>
        </TabPane>
        <TabPane tab="Loaded Shards Distribution" key="3">
          <div>Loaded shards distribution - To be implemented</div>
        </TabPane>
      </Tabs>
    </Card>
  );
};

export default ShardsDetailTabZKInfo;


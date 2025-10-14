/**
 * Shards Detail Tab - Processing Events
 * Tab showing processing events information
 * Migrated from @cyoda/processing-manager/src/components/PmShardsDetailTab/PmShardsDetailTabProcessingEvents.vue
 */

import React, { useState } from 'react';
import { Card, Tabs } from 'antd';
import { PollingInfo, ProcessEventsStatistics, ProcessingEventsView } from '../processing-events';

const { TabPane } = Tabs;

export const ShardsDetailTabProcessingEvents: React.FC = () => {
  const [activeKey, setActiveKey] = useState('1');

  return (
    <Card>
      <h3>Processing Events</h3>
      <Tabs activeKey={activeKey} onChange={setActiveKey}>
        <TabPane tab="Process Events Statistics" key="1">
          <ProcessEventsStatistics />
        </TabPane>
        <TabPane tab="Polling info" key="2">
          <PollingInfo />
        </TabPane>
        <TabPane tab="Processing events view" key="3">
          <ProcessingEventsView />
        </TabPane>
        <TabPane tab="Processing events error view" key="4">
          <div>Processing events error view - To be implemented</div>
        </TabPane>
        <TabPane tab="Entities error list view" key="5">
          <div>Entities error list view - To be implemented</div>
        </TabPane>
        <TabPane tab="SIFT logger conf view" key="6">
          <div>SIFT logger conf view - To be implemented</div>
        </TabPane>
      </Tabs>
    </Card>
  );
};

export default ShardsDetailTabProcessingEvents;


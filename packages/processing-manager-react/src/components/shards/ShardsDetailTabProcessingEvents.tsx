/**
 * Shards Detail Tab - Processing Events
 * Tab showing processing events information
 * Migrated from @cyoda/processing-manager/src/components/PmShardsDetailTab/PmShardsDetailTabProcessingEvents.vue
 */

import React, { useState } from 'react';
import { Tabs } from 'antd';
import {
  PollingInfo,
  ProcessEventsStatistics,
  ProcessingEventsView,
  ProcessingEventsErrorView,
  ProcessingEventsEntitiesErrorListView,
  SiftLoggerConfView
} from '../processing-events';
import './ShardsDetailTabProcessingEvents.scss';

const { TabPane } = Tabs;

export const ShardsDetailTabProcessingEvents: React.FC = () => {
  const [activeKey, setActiveKey] = useState('1');

  return (
    <div className="processing-events-tab">
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
          <ProcessingEventsErrorView />
        </TabPane>
        <TabPane tab="Entities error list view" key="5">
          <ProcessingEventsEntitiesErrorListView />
        </TabPane>
        <TabPane tab="SIFT logger conf view" key="6">
          <SiftLoggerConfView />
        </TabPane>
      </Tabs>
    </div>
  );
};

export default ShardsDetailTabProcessingEvents;


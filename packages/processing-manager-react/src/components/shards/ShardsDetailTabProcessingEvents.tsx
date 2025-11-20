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

export const ShardsDetailTabProcessingEvents: React.FC = () => {
  const [activeKey, setActiveKey] = useState('1');

  const tabItems = [
    {
      key: '1',
      label: 'Process Events Statistics',
      children: <ProcessEventsStatistics />,
    },
    {
      key: '2',
      label: 'Polling info',
      children: <PollingInfo />,
    },
    {
      key: '3',
      label: 'Processing events view',
      children: <ProcessingEventsView />,
    },
    {
      key: '4',
      label: 'Processing events error view',
      children: <ProcessingEventsErrorView />,
    },
    {
      key: '5',
      label: 'Entities error list view',
      children: <ProcessingEventsEntitiesErrorListView />,
    },
    {
      key: '6',
      label: 'SIFT logger conf view',
      children: <SiftLoggerConfView />,
    },
  ];

  return (
    <div className="processing-events-tab">
      <h3 className="processing-events-title">Processing Events</h3>
      <Tabs activeKey={activeKey} onChange={setActiveKey} items={tabItems} />
    </div>
  );
};

export default ShardsDetailTabProcessingEvents;


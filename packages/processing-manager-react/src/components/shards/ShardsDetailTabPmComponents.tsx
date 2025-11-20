/**
 * Shards Detail Tab PM Components
 * Migrated from @cyoda/processing-manager/src/components/PmShardsDetailTab/PmShardsDetailTabPmComponents.vue
 */

import { useState } from 'react';
import { Tabs } from 'antd';
import {
  PmComponentsExecutionQueuesInfo,
  PmComponentsExecutionMonitors,
  PmComponentsServiceProcessesView,
  PmComponentsCyodaRunnableComponents,
  PmComponentsClear,
} from '../pm-components';
import './ShardsDetailTabPmComponents.scss';

export default function ShardsDetailTabPmComponents() {
  const [activeTab, setActiveTab] = useState<string>('execution-queues');

  const tabItems = [
    {
      key: 'execution-queues',
      label: 'Execution Queues Info',
      children: <PmComponentsExecutionQueuesInfo />,
    },
    {
      key: 'execution-monitors',
      label: 'Execution Monitors',
      children: <PmComponentsExecutionMonitors />,
    },
    {
      key: 'service-processes',
      label: 'Service Processes View',
      children: <PmComponentsServiceProcessesView />,
    },
    {
      key: 'runnable-components',
      label: 'Cyoda Runnable Components',
      children: <PmComponentsCyodaRunnableComponents />,
    },
  ];

  return (
    <div className="pm-components-tab">
      <div className="pm-components-header">
        <h3 className="pm-components-title">PM components</h3>
        <PmComponentsClear />
      </div>
      <Tabs activeKey={activeTab} onChange={setActiveTab} items={tabItems} />
    </div>
  );
}


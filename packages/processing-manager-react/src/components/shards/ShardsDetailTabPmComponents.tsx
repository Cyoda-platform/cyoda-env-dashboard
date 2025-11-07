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

const { TabPane } = Tabs;

export default function ShardsDetailTabPmComponents() {
  const [activeTab, setActiveTab] = useState<string>('execution-queues');

  return (
    <div className="pm-components-tab">
      <div className="pm-components-header">
        <h3 className="pm-components-title">PM components</h3>
        <PmComponentsClear />
      </div>
      <Tabs activeKey={activeTab} onChange={setActiveTab}>
        <TabPane tab="Execution Queues Info" key="execution-queues">
          <PmComponentsExecutionQueuesInfo />
        </TabPane>
        <TabPane tab="Execution Monitors" key="execution-monitors">
          <PmComponentsExecutionMonitors />
        </TabPane>
        <TabPane tab="Service Processes View" key="service-processes">
          <PmComponentsServiceProcessesView />
        </TabPane>
        <TabPane tab="Cyoda Runnable Components" key="runnable-components">
          <PmComponentsCyodaRunnableComponents />
        </TabPane>
      </Tabs>
    </div>
  );
}


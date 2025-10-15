/**
 * Shards Detail Tab PM Components
 * Migrated from @cyoda/processing-manager/src/components/PmShardsDetailTab/PmShardsDetailTabPmComponents.vue
 */

import { useState } from 'react';
import { Card, Tabs } from 'antd';
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
    <div className="row">
      <div className="col-sm-12">
        <Card>
          <div className="wrap-title flex">
            <h3>PM components</h3>
            <span>
              <PmComponentsClear />
            </span>
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
        </Card>
      </div>
    </div>
  );
}


/**
 * Shards Detail Tab PM Components
 * Migrated from @cyoda/processing-manager/src/components/PmShardsDetailTab/PmShardsDetailTabPmComponents.vue
 */

import { useState } from 'react';
import { Card, Tabs } from 'antd';
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
              {/* TODO: Add Clear button component */}
              {/* <ShardsDetailTabPmComponentsClear /> */}
            </span>
          </div>

          <Tabs activeKey={activeTab} onChange={setActiveTab}>
            <TabPane tab="Execution Queues Info" key="execution-queues">
              {/* TODO: Add ExecutionQueuesInfo component */}
              <div>Execution Queues Info - To be implemented</div>
            </TabPane>
            <TabPane tab="Execution Monitors" key="execution-monitors">
              {/* TODO: Add ExecutionMonitors component */}
              <div>Execution Monitors - To be implemented</div>
            </TabPane>
            <TabPane tab="Service Processes View" key="service-processes">
              {/* TODO: Add ServiceProcessesView component */}
              <div>Service Processes View - To be implemented</div>
            </TabPane>
            <TabPane tab="Cyoda Runnable Components" key="runnable-components">
              {/* TODO: Add CyodaRunnableComponents component */}
              <div>Cyoda Runnable Components - To be implemented</div>
            </TabPane>
          </Tabs>
        </Card>
      </div>
    </div>
  );
}


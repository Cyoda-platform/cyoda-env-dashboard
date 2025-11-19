/**
 * Shards Detail Tab - Time Statistics
 * Tab showing time statistics information
 * Migrated from @cyoda/processing-manager/src/components/PmShardsDetailTab/PmShardsDetailTabTimeStatistics.vue
 */

import React, { useState } from 'react';
import { Tabs } from 'antd';
import { TimeStatisticsTimeStat, TimeStatisticsCountStat, TimeStatisticsClear } from '../time-statistics';
import './ShardsDetailTabTimeStatistics.scss';

const { TabPane } = Tabs;

export const ShardsDetailTabTimeStatistics: React.FC = () => {
  const [activeKey, setActiveKey] = useState('1');

  return (
    <div className="time-statistics-tab">
      <div className="time-statistics-header">
        <h3 className="time-statistics-title">Time statistics</h3>
        <TimeStatisticsClear />
      </div>
      <Tabs activeKey={activeKey} onChange={setActiveKey}>
        <TabPane tab="Time stats" key="1">
          <TimeStatisticsTimeStat />
        </TabPane>
        <TabPane tab="Count stats" key="2">
          <TimeStatisticsCountStat />
        </TabPane>
      </Tabs>
    </div>
  );
};

export default ShardsDetailTabTimeStatistics;


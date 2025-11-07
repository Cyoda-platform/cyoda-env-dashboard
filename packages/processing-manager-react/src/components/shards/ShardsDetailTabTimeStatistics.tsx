/**
 * Shards Detail Tab - Time Statistics
 * Tab showing time statistics information
 * Migrated from @cyoda/processing-manager/src/components/PmShardsDetailTab/PmShardsDetailTabTimeStatistics.vue
 */

import React, { useState } from 'react';
import { Tabs, Button, Space } from 'antd';
import { SyncOutlined } from '@ant-design/icons';
import { TimeStatisticsTimeStat, TimeStatisticsCountStat } from '../time-statistics';
import './ShardsDetailTabTimeStatistics.scss';

const { TabPane } = Tabs;

export const ShardsDetailTabTimeStatistics: React.FC = () => {
  const [activeKey, setActiveKey] = useState('1');

  const handleClear = () => {
    // TODO: Implement clear functionality
    console.log('Clear time statistics');
  };

  const handleReload = () => {
    // TODO: Implement reload functionality
    console.log('Reload time statistics');
  };

  return (
    <div className="time-statistics-tab">
      <div className="time-statistics-header">
        <h3 className="time-statistics-title">Time statistics</h3>
        <Space>
          <Button onClick={handleClear}>Clear</Button>
          <Button icon={<SyncOutlined />} onClick={handleReload}>Reload</Button>
        </Space>
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


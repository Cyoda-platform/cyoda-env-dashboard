/**
 * Shards Detail Tab - Transactions
 * Tab showing transactions information
 * Migrated from @cyoda/processing-manager/src/components/PmShardsDetailTab/PmShardsDetailTabTransactions.vue
 */

import React, { useState } from 'react';
import { Tabs, Button } from 'antd';
import { ClearOutlined } from '@ant-design/icons';
import { TransactionsExecuting, TransactionsView, TransactionsEntities } from '../transactions';
import './ShardsDetailTabTransactions.scss';

const { TabPane } = Tabs;

export const ShardsDetailTabTransactions: React.FC = () => {
  const [activeKey, setActiveKey] = useState('1');

  const handleClear = () => {
    // TODO: Implement clear functionality
    console.log('Clear transactions');
  };

  return (
    <div className="transactions-tab">
      <div className="transactions-header">
        <Button onClick={handleClear} icon={<ClearOutlined />}>
          Clear
        </Button>
      </div>
      <Tabs activeKey={activeKey} onChange={setActiveKey}>
        <TabPane tab="Executing transactions" key="1">
          <TransactionsExecuting />
        </TabPane>
        <TabPane tab="Transactions view" key="2">
          <TransactionsView />
        </TabPane>
        <TabPane tab="Entities list view" key="3">
          <TransactionsEntities />
        </TabPane>
      </Tabs>
    </div>
  );
};

export default ShardsDetailTabTransactions;


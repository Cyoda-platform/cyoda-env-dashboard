/**
 * Shards Detail Tab - Transactions
 * Tab showing transactions information
 * Migrated from @cyoda/processing-manager/src/components/PmShardsDetailTab/PmShardsDetailTabTransactions.vue
 */

import React, { useState } from 'react';
import { Card, Tabs, Button } from 'antd';
import { ClearOutlined } from '@ant-design/icons';
import { TransactionsExecuting, TransactionsView, TransactionsEntities } from '../transactions';

const { TabPane } = Tabs;

export const ShardsDetailTabTransactions: React.FC = () => {
  const [activeKey, setActiveKey] = useState('1');

  const handleClear = () => {
    // TODO: Implement clear functionality
    console.log('Clear transactions');
  };

  return (
    <Card>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 }}>
        <h3 style={{ display: 'inline', margin: 0 }}>Transactions</h3>
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
    </Card>
  );
};

export default ShardsDetailTabTransactions;


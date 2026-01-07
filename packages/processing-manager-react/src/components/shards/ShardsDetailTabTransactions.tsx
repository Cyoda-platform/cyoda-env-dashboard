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

export const ShardsDetailTabTransactions: React.FC = () => {
  const [activeKey, setActiveKey] = useState('1');

  const handleClear = () => {
    // TODO: Implement clear functionality
  };

  const tabItems = [
    {
      key: '1',
      label: 'Executing transactions',
      children: <TransactionsExecuting />,
    },
    {
      key: '2',
      label: 'Transactions view',
      children: <TransactionsView />,
    },
    {
      key: '3',
      label: 'Entities list view',
      children: <TransactionsEntities />,
    },
  ];

  return (
    <div className="transactions-tab">
      <div className="transactions-header">
        <h3 className="transactions-title">Transactions</h3>
        <Button onClick={handleClear} icon={<ClearOutlined />}>
          Clear
        </Button>
      </div>
      <Tabs activeKey={activeKey} onChange={setActiveKey} items={tabItems} />
    </div>
  );
};

export default ShardsDetailTabTransactions;


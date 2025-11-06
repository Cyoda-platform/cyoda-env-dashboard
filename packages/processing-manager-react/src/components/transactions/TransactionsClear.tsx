/**
 * Transactions Clear Component
 * Migrated from @cyoda/processing-manager/src/components/PmShardsDetailTab/PmShardsDetailTabTransactions/PmShardsDetailTabTransactionsClear.vue
 */

import React from 'react';
import { Button, Dropdown, Modal, message } from 'antd';
import { DownOutlined } from '@ant-design/icons';
import type { MenuProps } from 'antd';
import { useDoHardResetConsistencyTime } from '../../hooks';

export const TransactionsClear: React.FC = () => {
  const { mutate: doHardResetConsistencyTime } = useDoHardResetConsistencyTime({
    onSuccess: () => {
      message.success('Hard reset consistency time completed');
    },
  });

  const handleReset = () => {
    Modal.confirm({
      title: 'Warning',
      content: `WARNING: This will delete all consistency time data from the system.
Any current or queued read/write operations may subsequently fail or experience negative side effects.
Hard resetting the consistency time should only be used as a last resort to unblock the consistency clock.
Are you sure you want to hard reset consistency time?`,
      okText: 'OK',
      cancelText: 'Cancel',
      onOk: () => {
        doHardResetConsistencyTime();
      },
      onCancel: () => {
        message.info('Hard reset consistency time canceled');
      },
    });
  };

  const items: MenuProps['items'] = [
    {
      key: 'reset',
      label: 'Hard reset consistency time',
      onClick: handleReset,
    },
  ];

  return (
    <Dropdown menu={{ items }} trigger={['click']}>
      <Button type="primary">
        Reset <DownOutlined />
      </Button>
    </Dropdown>
  );
};

export default TransactionsClear;


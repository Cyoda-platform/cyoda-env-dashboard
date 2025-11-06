/**
 * PM Components Clear Component
 * Migrated from @cyoda/processing-manager/src/components/PmShardsDetailTab/PmShardsDetailTabPmComponents/PmShardsDetailTabPmComponentsClear.vue
 */

import React from 'react';
import { Button, Dropdown, Modal, message } from 'antd';
import { DownOutlined } from '@ant-design/icons';
import type { MenuProps } from 'antd';
import { useDoClearAllCaches } from '../../hooks';

export const PmComponentsClear: React.FC = () => {
  const { mutate: doClearAllCaches } = useDoClearAllCaches({
    onSuccess: () => {
      message.success('Clear Caches completed');
    },
  });

  const handleClear = () => {
    Modal.confirm({
      title: 'Warning',
      content: 'Clear Caches. Continue?',
      okText: 'OK',
      cancelText: 'Cancel',
      onOk: () => {
        doClearAllCaches();
      },
      onCancel: () => {
        message.info('Clear Caches canceled');
      },
    });
  };

  const items: MenuProps['items'] = [
    {
      key: 'clear',
      label: 'Clear Caches',
      onClick: handleClear,
    },
  ];

  return (
    <Dropdown menu={{ items }} trigger={['click']}>
      <Button type="primary">
        Clear <DownOutlined />
      </Button>
    </Dropdown>
  );
};

export default PmComponentsClear;


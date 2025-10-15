/**
 * Time Statistics Clear Component
 * Migrated from @cyoda/processing-manager/src/components/PmShardsDetailTab/PmShardsDetailTabTimeStatistics/PmShardsDetailTabTimeStatisticsClear.vue
 */

import React from 'react';
import { Button, Dropdown, Modal, message } from 'antd';
import { DownOutlined } from '@ant-design/icons';
import type { MenuProps } from 'antd';
import { useClearTimeStats } from '../../hooks';
import { useProcessingStore } from '../../stores/processingStore';

interface TimeStatisticsClearProps {
  onReload?: () => void;
}

export const TimeStatisticsClear: React.FC<TimeStatisticsClearProps> = ({ onReload }) => {
  const { mutateAsync: clearTimeStats } = useClearTimeStats();
  const { nodes } = useProcessingStore();

  const handleClear = async () => {
    Modal.confirm({
      title: 'Warning',
      content: 'Clear time stats. Continue?',
      okText: 'OK',
      cancelText: 'Cancel',
      onOk: async () => {
        try {
          await clearTimeStats();
          message.success('Clear time stats completed');
          onReload?.();
        } catch (e) {
          console.error(e);
        }
      },
      onCancel: () => {
        message.info('Clear time stats canceled');
      },
    });
  };

  const handleClearAll = async () => {
    Modal.confirm({
      title: 'Warning',
      content: 'Clear timestats request send to all nodes. Continue?',
      okText: 'OK',
      cancelText: 'Cancel',
      onOk: async () => {
        try {
          const listPromises = nodes.map((el: any) => clearTimeStats(el.baseUrl));
          await Promise.all(listPromises);
          message.success('Clear time stats (ALL nodes) completed');
          onReload?.();
        } catch (e) {
          console.error(e);
        }
      },
      onCancel: () => {
        message.info('Clear time stats (ALL nodes) canceled');
      },
    });
  };

  const items: MenuProps['items'] = [
    {
      key: 'clear',
      label: 'Clear time stats',
      onClick: handleClear,
    },
    {
      key: 'clearAll',
      label: 'Clear time stats (ALL nodes)',
      onClick: handleClearAll,
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

export default TimeStatisticsClear;


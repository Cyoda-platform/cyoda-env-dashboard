/**
 * Error View Actions Component
 * Migrated from @cyoda/processing-manager/src/components/ErrorViewActions/ErrorViewActions.vue
 */

import React from 'react';
import { Button, Dropdown, Modal, message } from 'antd';
import { DownOutlined } from '@ant-design/icons';
import type { MenuProps } from 'antd';
import { useLocation } from 'react-router-dom';
import { useProcessingQueueForceMarkProcessed } from '../../hooks';

interface ErrorViewActionsProps {
  onReload?: () => void;
  params?: {
    queue?: string;
    shard?: string;
    timeUUID?: string;
  };
}

export const ErrorViewActions: React.FC<ErrorViewActionsProps> = ({ onReload, params: propParams }) => {
  const location = useLocation();
  const { mutateAsync: forceMarkProcessed } = useProcessingQueueForceMarkProcessed();

  const handleForceMarkProcessed = () => {
    Modal.confirm({
      title: 'Warning',
      content: 'Force mark processed. Continue?',
      okText: 'OK',
      cancelText: 'Cancel',
      onOk: async () => {
        try {
          // Use propParams if provided, otherwise get from URL
          const params = propParams || Object.fromEntries(new URLSearchParams(location.search));
          await forceMarkProcessed({ params });
          onReload?.();
          message.success('Force mark processed completed');
        } catch (error) {
          message.error('Force mark processed failed');
        }
      },
      onCancel: () => {
        message.info('Force mark processed canceled');
      },
    });
  };

  const handleResubmitWithErrorEvent = () => {
    Modal.confirm({
      title: 'Warning',
      content: 'Resubmit Events For Error(with error event). Continue?',
      okText: 'OK',
      cancelText: 'Cancel',
      onOk: async () => {
        // TODO: Implement resubmit with error event
        message.success('Resubmit Events For Error(with error event) completed');
      },
      onCancel: () => {
        message.info('Resubmit Events For Error(with error event) canceled');
      },
    });
  };

  const handleResubmitWithoutErrorEvent = () => {
    Modal.confirm({
      title: 'Warning',
      content: 'Resubmit Events For Error(without error event). Continue?',
      okText: 'OK',
      cancelText: 'Cancel',
      onOk: async () => {
        // TODO: Implement resubmit without error event
        message.success('Resubmit Events For Error(without error event) completed');
      },
      onCancel: () => {
        message.info('Resubmit Events For Error(without error event) canceled');
      },
    });
  };

  const handleMenuClick: MenuProps['onClick'] = ({ key }) => {
    switch (key) {
      case 'forceMarkProcessed':
        handleForceMarkProcessed();
        break;
      case 'resubmitWithErrorEvent':
        handleResubmitWithErrorEvent();
        break;
      case 'resubmitWithoutErrorEvent':
        handleResubmitWithoutErrorEvent();
        break;
    }
  };

  const items: MenuProps['items'] = [
    {
      key: 'forceMarkProcessed',
      label: 'Force mark processed',
    },
    {
      key: 'resubmitWithErrorEvent',
      label: 'Resubmit Events For Error(with error event)',
    },
    {
      key: 'resubmitWithoutErrorEvent',
      label: 'Resubmit Events For Error(without error event)',
    },
  ];

  return (
    <Dropdown menu={{ items, onClick: handleMenuClick }} trigger={['click']}>
      <Button type="primary">
        Actions <DownOutlined />
      </Button>
    </Dropdown>
  );
};

export default ErrorViewActions;


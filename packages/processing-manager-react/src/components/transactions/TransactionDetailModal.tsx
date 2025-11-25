/**
 * Transaction Detail Modal Component
 * Shows transaction details in a modal window instead of navigating to a new page
 */

import React from 'react';
import { Modal, Tabs } from 'antd';
import {
  TransitionDetailStatistics,
  TransitionDetailStatisticsTransactionMembers,
  TransitionDetailStatisticsTransactionEvents,
} from '../transition-detail';
import './TransactionDetailModal.scss';

interface TransactionDetailModalProps {
  transactionId: string | null;
  visible: boolean;
  onClose: () => void;
}

export const TransactionDetailModal: React.FC<TransactionDetailModalProps> = ({
  transactionId,
  visible,
  onClose,
}) => {
  if (!transactionId) return null;

  const tabItems = [
    {
      key: 'statistics',
      label: 'Transaction main statistics',
      children: <TransitionDetailStatistics transactionIdProp={transactionId} />,
    },
    {
      key: 'members',
      label: 'Transaction members',
      children: <TransitionDetailStatisticsTransactionMembers transactionIdProp={transactionId} />,
    },
    {
      key: 'events',
      label: 'Transaction events',
      children: <TransitionDetailStatisticsTransactionEvents transactionIdProp={transactionId} />,
    },
  ];

  return (
    <Modal
      title={`Transaction ${transactionId}`}
      open={visible}
      onCancel={onClose}
      footer={null}
      width="90%"
      style={{ top: 20 }}
      className="transaction-detail-modal"
    >
      <Tabs
        defaultActiveKey="statistics"
        items={tabItems}
      />
    </Modal>
  );
};

export default TransactionDetailModal;


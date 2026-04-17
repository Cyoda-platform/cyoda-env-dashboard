import React from 'react';
import { Modal } from 'antd';
import { useQuery } from '@tanstack/react-query';
import { getInstancesGateway } from '../../gateways';

export interface EntityAtTransactionModalProps {
  open: boolean;
  onClose: () => void;
  entityId: string;
  transactionId: string;
}

export const EntityAtTransactionModal: React.FC<EntityAtTransactionModalProps> = ({ open, onClose, entityId, transactionId }) => {
  const query = useQuery({
    queryKey: ['cloud-instances', 'load-at', entityId, transactionId],
    queryFn: () => getInstancesGateway().load(entityId, { transactionId }),
    enabled: open,
  });
  return (
    <Modal open={open} onCancel={onClose} footer={null} width={900} title={`Entity at Transaction: ${transactionId}`}>
      {query.isLoading ? <span>Loading…</span> : (
        <pre style={{ padding: 12, fontSize: 12, lineHeight: 1.4, overflowX: 'auto', maxHeight: '60vh' }}>
          {JSON.stringify(query.data?.data ?? {}, null, 2)}
        </pre>
      )}
    </Modal>
  );
};

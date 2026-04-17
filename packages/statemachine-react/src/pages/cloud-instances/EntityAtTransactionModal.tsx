import React from 'react';
import { Modal, Spin } from 'antd';
import { useQuery } from '@tanstack/react-query';
import { getInstancesGateway } from '../../gateways';
import { JsonView } from './JsonView';

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
    <Modal open={open} onCancel={onClose} footer={null} width={900} title={`Entity at Transaction: ${transactionId}`} destroyOnHidden>
      {query.isLoading ? <Spin /> : <JsonView value={query.data?.data} maxHeight="60vh" />}
    </Modal>
  );
};

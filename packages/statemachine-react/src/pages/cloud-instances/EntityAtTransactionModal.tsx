import React, { useMemo } from 'react';
import { Modal, Spin } from 'antd';
import { useQuery } from '@tanstack/react-query';
import { CodeEditor } from '@cyoda/ui-lib-react';
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
  const json = useMemo(() => JSON.stringify(query.data?.data ?? {}, null, 2), [query.data]);
  return (
    <Modal open={open} onCancel={onClose} footer={null} width={900} title={`Entity at Transaction: ${transactionId}`} destroyOnHidden>
      {query.isLoading ? <Spin /> : (
        <CodeEditor value={json} language="json" readOnly height={520} />
      )}
    </Modal>
  );
};

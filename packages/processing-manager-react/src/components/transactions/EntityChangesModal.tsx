/**
 * Entity Changes Modal Component
 * Displays entity changes in a modal window
 */

import React from 'react';
import { Modal } from 'antd';
import { TransitionChangesTable } from '@cyoda/ui-lib-react';
import './EntityChangesModal.scss';

interface EntityChangesModalProps {
  visible: boolean;
  onClose: () => void;
  entityId: string;
  entityType: string;
  nodeName?: string;
}

export const EntityChangesModal: React.FC<EntityChangesModalProps> = ({
  visible,
  onClose,
  entityId,
  entityType,
  nodeName,
}) => {
  // Extract entity class name from full type path
  const entityClassName = entityType ? entityType.split('.').pop() || entityType : '';

  return (
    <Modal
      title={`Changes of entity (${entityClassName}): ${entityId}`}
      open={visible}
      onCancel={onClose}
      footer={null}
      width="90%"
      style={{ top: 20 }}
      className="entity-changes-modal"
    >
      <div className="entity-changes-content">
        <TransitionChangesTable
          type={entityType}
          entityId={entityId}
          nodeName={nodeName}
          disableLink={false}
        />
      </div>
    </Modal>
  );
};

export default EntityChangesModal;


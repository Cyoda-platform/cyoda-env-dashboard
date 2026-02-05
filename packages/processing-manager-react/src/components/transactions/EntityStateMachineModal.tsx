/**
 * Entity State Machine Modal Component
 * Displays entity state machine in a modal window
 */

import React, { useState } from 'react';
import { Modal, Row, Col, Spin } from 'antd';
import { useEntityStateMachine } from '../../hooks';
import {
  TransitionStateMachineForm,
  TransitionStateMachineTable,
  TransitionStateMachineTimeLine,
} from '../state-machine';
import './EntityStateMachineModal.scss';

interface EntityStateMachineModalProps {
  visible: boolean;
  onClose: () => void;
  entityId: string;
  entityType: string;
}

export const EntityStateMachineModal: React.FC<EntityStateMachineModalProps> = ({
  visible,
  onClose,
  entityId,
  entityType,
}) => {
  const [isLoading, setIsLoading] = useState(false);

  const { data, refetch } = useEntityStateMachine({
    type: entityType,
    id: entityId,
  });

  const entityVersions = data?.entityVersions || [];
  const possibleTransitions = data?.possibleTransitions || [];
  const stateMachineEvents = data?.stateMachineEvents || [];

  // Extract entity class name from full type path
  const entityClassName = entityType ? entityType.split('.').pop() || entityType : '';

  const title = `State machine view for entity (${entityClassName}): ${entityId}`;

  const handleUpdated = async () => {
    setIsLoading(true);
    await refetch();
    setIsLoading(false);
  };

  return (
    <Modal
      title={title}
      open={visible}
      onCancel={onClose}
      footer={null}
      width="90%"
      style={{ top: 20 }}
      className="entity-state-machine-modal"
    >
      <div className="entity-state-machine-content">
        <Spin spinning={isLoading}>
          <Row gutter={24}>
            <Col xs={24} sm={18}>
              <TransitionStateMachineForm
                possibleTransitions={possibleTransitions}
                onUpdated={handleUpdated}
                entityClass={entityType}
                entityId={entityId}
              />
              <div style={{ marginTop: 16 }}>
                <TransitionStateMachineTable stateMachineEvents={stateMachineEvents} />
              </div>
            </Col>
            <Col xs={24} sm={6}>
              <TransitionStateMachineTimeLine entityVersions={entityVersions} />
            </Col>
          </Row>
        </Spin>
      </div>
    </Modal>
  );
};

export default EntityStateMachineModal;


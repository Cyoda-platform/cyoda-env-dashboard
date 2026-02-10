/**
 * Transition State Machine Form Component
 * Migrated from @cyoda/processing-manager/src/components/PmTransitionStateMachine/TransitionStateMachineForm.vue
 */

import React, { useState } from 'react';
import { Card, Form, Select, Button } from 'antd';
import { useLocation } from 'react-router-dom';
import { useDoManualTransition } from '../../hooks';
import './TransitionStateMachineForm.scss';

interface TransitionStateMachineFormProps {
  possibleTransitions: string[];
  onUpdated?: () => void;
  /** Entity class/type - if not provided, falls back to URL param 'type' */
  entityClass?: string;
  /** Entity ID - if not provided, falls back to URL param 'entityId' */
  entityId?: string;
}

export const TransitionStateMachineForm: React.FC<TransitionStateMachineFormProps> = ({
  possibleTransitions = [],
  onUpdated,
  entityClass: entityClassProp,
  entityId: entityIdProp,
}) => {
  const [state, setState] = useState<string>('');
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);

  // Use props if provided, otherwise fall back to URL params
  const entityClass = entityClassProp || queryParams.get('type') || '';
  const entityId = entityIdProp || queryParams.get('entityId') || '';

  const { mutate: doManualTransition, isLoading } = useDoManualTransition({
    onSuccess: () => {
      setState('');
      onUpdated?.();
    },
  });

  const stateOptions = possibleTransitions.map((el) => ({
    value: el,
    label: el,
  }));

  const handleSubmit = () => {
    doManualTransition({
      entityClass,
      entityId,
      transition: state,
      transactional: true,
      async: false,
      values: [],
    });
  };

  return (
    <Card className="transition-state-machine-form" variant="borderless">
      <Form layout="inline">
        <Form.Item label="Try transition">
          <Select
            placeholder="Select state"
            value={state}
            onChange={(value) => setState(value)}
            options={stateOptions}
            style={{ width: 300 }}
          />
        </Form.Item>
        <Form.Item>
          <Button type="primary" onClick={handleSubmit} loading={isLoading} disabled={!state}>
            Submit
          </Button>
        </Form.Item>
      </Form>
    </Card>
  );
};

export default TransitionStateMachineForm;


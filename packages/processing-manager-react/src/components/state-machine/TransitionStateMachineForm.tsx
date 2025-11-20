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
}

export const TransitionStateMachineForm: React.FC<TransitionStateMachineFormProps> = ({
  possibleTransitions = [],
  onUpdated,
}) => {
  const [state, setState] = useState<string>('');
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);

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
      entityClass: queryParams.get('type') || '',
      entityId: queryParams.get('entityId') || '',
      transition: state,
      transactional: false,
      async: false,
      values: [],
    });
  };

  return (
    <Card title="Form" className="transition-state-machine-form" bordered={false}>
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


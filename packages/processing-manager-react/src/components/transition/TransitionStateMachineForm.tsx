/**
 * Transition State Machine Form Component
 * Form for manual state transitions
 * Migrated from @cyoda/processing-manager/src/components/PmTransitionStateMachine/TransitionStateMachineForm.vue
 */

import React, { useState } from 'react';
import { Card, Form, Select, Button } from 'antd';
import { useSearchParams } from 'react-router-dom';
import { useManualTransition } from '../../hooks/useProcessing';
import './TransitionStateMachineForm.scss';

interface TransitionStateMachineFormProps {
  possibleTransitions: string[];
  onUpdated?: () => void;
}

export const TransitionStateMachineForm: React.FC<TransitionStateMachineFormProps> = ({
  possibleTransitions = [],
  onUpdated,
}) => {
  const [searchParams] = useSearchParams();
  const [selectedState, setSelectedState] = useState<string | undefined>(undefined);
  const mutation = useManualTransition();

  const stateOptions = possibleTransitions.map((el) => ({
    value: el,
    label: el,
  }));

  const handleSubmit = async () => {
    if (!selectedState) return;

    try {
      await mutation.mutateAsync({
        entityClass: searchParams.get('type'),
        entityId: searchParams.get('entityId'),
        transition: selectedState,
        transactional: false,
        async: false,
        values: [],
      });
      setSelectedState(undefined);
      onUpdated?.();
    } catch (error) {
      console.error('Failed to perform transition:', error);
    }
  };

  return (
    <Card title="Form" className="transition-state-machine-form">
      <Form layout="inline">
        <Form.Item label="Try transition">
          <Select
            value={selectedState}
            onChange={setSelectedState}
            placeholder="Select state"
            options={stateOptions}
            style={{ width: 300 }}
          />
        </Form.Item>
        <Form.Item>
          <Button
            type="primary"
            onClick={handleSubmit}
            loading={mutation.isPending}
            disabled={!selectedState}
          >
            Submit
          </Button>
        </Form.Item>
      </Form>
    </Card>
  );
};

export default TransitionStateMachineForm;


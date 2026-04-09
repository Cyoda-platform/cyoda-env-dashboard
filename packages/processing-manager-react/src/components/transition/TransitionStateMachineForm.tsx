/**
 * Transition State Machine Form Component
 * Form for manual state transitions
 * Migrated from @cyoda/processing-manager/src/components/PmTransitionStateMachine/TransitionStateMachineForm.vue
 *
 * When VITE_FEATURE_FLAG_IS_CYODA_CLOUD=true and the entityClass is in Business format
 * (<modelName>.<modelVersion>), the /platform-api/entity endpoint requires the actual
 * Java class name (com.cyoda.tdb.model.treenode.TreeNodeEntity), not the modelName.modelVersion.
 */

import React, { useState, useMemo } from 'react';
import { Card, Form, Select, Button } from 'antd';
import { useSearchParams } from 'react-router-dom';
import { HelperFeatureFlags, isCyodaCloudEntityFormat } from '@cyoda/http-api-react';
import { useManualTransition } from '../../hooks/useProcessing';
import './TransitionStateMachineForm.scss';

const TREE_NODE_ENTITY_CLASS = 'com.cyoda.tdb.model.treenode.TreeNodeEntity';

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

  const entityClassRaw = searchParams.get('type') || '';

  // When Cyoda Cloud is enabled and the entityClass is in Business format
  // (e.g. "Dataset.1"), substitute with the actual Java class for /platform-api/entity.
  const entityClass = useMemo(() => {
    if (HelperFeatureFlags.isCyodaCloud() && isCyodaCloudEntityFormat(entityClassRaw)) {
      return TREE_NODE_ENTITY_CLASS;
    }
    return entityClassRaw;
  }, [entityClassRaw]);

  const stateOptions = possibleTransitions.map((el) => ({
    value: el,
    label: el,
  }));

  const handleSubmit = async () => {
    if (!selectedState) return;

    try {
      await mutation.mutateAsync({
        entityClass,
        entityId: searchParams.get('entityId'),
        transition: selectedState,
        transactional: true,
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


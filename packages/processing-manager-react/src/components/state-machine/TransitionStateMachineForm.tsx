/**
 * Transition State Machine Form Component
 * Migrated from @cyoda/processing-manager/src/components/PmTransitionStateMachine/TransitionStateMachineForm.vue
 *
 * When VITE_FEATURE_FLAG_IS_CYODA_CLOUD=true and the entityClass is in Business format
 * (<modelName>.<modelVersion>), the /platform-api/entity endpoint requires the actual
 * Java class name (com.cyoda.tdb.model.treenode.TreeNodeEntity), not the modelName.modelVersion.
 */

import React, { useState, useMemo } from 'react';
import { Card, Form, Select, Button } from 'antd';
import { useLocation } from 'react-router-dom';
import { HelperFeatureFlags, isCyodaCloudEntityFormat } from '@cyoda/http-api-react';
import { useDoManualTransition } from '../../hooks';
import './TransitionStateMachineForm.scss';

const TREE_NODE_ENTITY_CLASS = 'com.cyoda.tdb.model.treenode.TreeNodeEntity';

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
  const entityClassRaw = entityClassProp || queryParams.get('type') || '';
  const entityId = entityIdProp || queryParams.get('entityId') || '';

  // When Cyoda Cloud is enabled and the entityClass is in Business format
  // (e.g. "Dataset.1"), substitute with the actual Java class for /platform-api/entity.
  const entityClass = useMemo(() => {
    if (HelperFeatureFlags.isCyodaCloud() && isCyodaCloudEntityFormat(entityClassRaw)) {
      return TREE_NODE_ENTITY_CLASS;
    }
    return entityClassRaw;
  }, [entityClassRaw]);

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


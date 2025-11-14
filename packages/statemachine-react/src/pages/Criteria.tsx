/**
 * Criteria Form Page
 * Create and edit criteria for workflows
 * Migrated from: .old_project/packages/statemachine/src/views/Criteria.vue
 */

import React from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { Button, message } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import CriteriaForm from '../components/CriteriaForm';
import type { PersistedType } from '../types';
import './Criteria.scss';

export const Criteria: React.FC = () => {
  const { criteriaId } = useParams<{ criteriaId: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const persistedType = (searchParams.get('persistedType') || 'persisted') as PersistedType;
  const entityClassName = searchParams.get('entityClassName') || '';
  const workflowId = searchParams.get('workflowId') || '';
  const workflowPersistedType = searchParams.get('workflowPersistedType') || 'persisted';
  const handleSubmitted = (params?: any) => {
    message.success('Criteria saved successfully');

    // Navigate back to workflow detail
    navigate(
      `/workflow/${workflowId}?persistedType=${workflowPersistedType}&entityClassName=${entityClassName}`
    );
  };

  const handleCancel = () => {
    navigate(
      `/workflow/${workflowId}?persistedType=${workflowPersistedType}&entityClassName=${entityClassName}`
    );
  };

  return (
    <div style={{ padding: '16px' }}>
      {/* Back Button */}
      <div style={{ marginBottom: '16px' }}>
        <Button
          icon={<ArrowLeftOutlined />}
          onClick={handleCancel}
        >
          Back to Workflow
        </Button>
      </div>

      <CriteriaForm
        entityClassName={entityClassName}
        persistedType={persistedType}
        criteriaId={criteriaId}
        mode="page"
        onSubmitted={handleSubmitted}
        onCancel={handleCancel}
      />
    </div>
  );
};

export default Criteria;


/**
 * Criteria Form Page
 * Create and edit criteria for workflows
 * Migrated from: .old_project/packages/statemachine/src/views/Criteria.vue
 */

import React, { useEffect, useMemo } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { Form, Input, Button, Card, message, Space, Select, Alert } from 'antd';
import {
  useCriteria,
  useCriteriacheckers,
  useCreateCriteria,
  useUpdateCriteria,
} from '../hooks/useStatemachine';
import type { PersistedType, CriteriaForm as CriteriaFormType } from '../types';

const { TextArea } = Input;

export const Criteria: React.FC = () => {
  const { criteriaId } = useParams<{ criteriaId: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  
  const persistedType = (searchParams.get('persistedType') || 'persisted') as PersistedType;
  const entityClassName = searchParams.get('entityClassName') || '';
  const workflowId = searchParams.get('workflowId') || '';
  const workflowPersistedType = searchParams.get('workflowPersistedType') || 'persisted';
  
  const isNew = !criteriaId || criteriaId === 'new';
  const isRuntime = persistedType === 'transient';
  
  // Queries
  const { data: criteria, isLoading: isLoadingCriteria } = useCriteria(
    persistedType,
    criteriaId || '',
    entityClassName,
    !isNew
  );
  const { data: criteriacheckers = [], isLoading: isLoadingCheckers } = useCriteriacheckers(entityClassName);
  
  // Mutations
  const createCriteriaMutation = useCreateCriteria();
  const updateCriteriaMutation = useUpdateCriteria();
  
  // Criteria checker options
  const checkerOptions = useMemo(() => {
    return criteriacheckers.map((checker: any) => ({
      label: checker.name || checker.value,
      value: checker.value || checker.name,
    }));
  }, [criteriacheckers]);
  
  // Initialize form when criteria data loads
  useEffect(() => {
    if (criteria) {
      form.setFieldsValue({
        name: criteria.name,
        description: criteria.description || '',
        criteriaChecker: criteria.criteriaChecker || '',
      });
    }
  }, [criteria, form]);
  
  // Handlers
  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      
      const formData: CriteriaFormType = {
        name: values.name,
        description: values.description,
        criteriaChecker: values.criteriaChecker,
        entityClassName,
      };
      
      if (isNew) {
        await createCriteriaMutation.mutateAsync({
          persistedType,
          criteriaData: formData,
        });
        message.success('Criteria created successfully');
      } else {
        await updateCriteriaMutation.mutateAsync({
          persistedType,
          criteriaId: criteriaId!,
          criteriaData: formData,
        });
        message.success('Criteria updated successfully');
      }
      
      // Navigate back to workflow detail
      navigate(
        `/statemachine/workflow/${workflowId}?persistedType=${workflowPersistedType}&entityClassName=${entityClassName}`
      );
    } catch (error) {
      message.error('Failed to save criteria');
    }
  };
  
  const handleCancel = () => {
    navigate(
      `/statemachine/workflow/${workflowId}?persistedType=${workflowPersistedType}&entityClassName=${entityClassName}`
    );
  };
  
  const pageTitle = isNew ? 'Create New Criteria' : `Criteria: ${criteria?.name || ''}`;
  const isLoading = isLoadingCriteria || createCriteriaMutation.isPending || updateCriteriaMutation.isPending;
  
  return (
    <div style={{ padding: '16px' }}>
      <Card>
        <Form
          form={form}
          layout="vertical"
          style={{ maxWidth: 600 }}
        >
          <h2>{pageTitle}</h2>
          
          <Form.Item
            label="Name"
            name="name"
            rules={[{ required: true, message: 'Please enter a name' }]}
          >
            <Input disabled={isRuntime} />
          </Form.Item>
          
          <Form.Item label="Description" name="description">
            <TextArea
              disabled={isRuntime}
              autoSize={{ minRows: 3, maxRows: 6 }}
            />
          </Form.Item>
          
          <Alert
            message="Filter Builder"
            description="Advanced filter builder with conditions will be available in a future update. For now, use the criteria checker to define custom logic."
            type="info"
            showIcon
            style={{ marginBottom: '16px' }}
          />
          
          <Form.Item
            label="Criteria Checker"
            name="criteriaChecker"
            rules={[{ required: true, message: 'Please select a criteria checker' }]}
          >
            <Select
              placeholder="Select criteria checker"
              disabled={isRuntime}
              loading={isLoadingCheckers}
              options={checkerOptions}
              showSearch
              filterOption={(input, option) =>
                (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
              }
            />
          </Form.Item>
          
          <Form.Item>
            <Space>
              <Button
                type="primary"
                onClick={handleSubmit}
                loading={isLoading}
                disabled={isRuntime}
              >
                {isNew ? 'Create Criteria' : 'Update Criteria'}
              </Button>
              <Button onClick={handleCancel}>
                Cancel
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default Criteria;


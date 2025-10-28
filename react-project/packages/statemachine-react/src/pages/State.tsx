/**
 * State Form Page
 * Create and edit states within a workflow
 * Migrated from: .old_project/packages/statemachine/src/views/State.vue
 */

import React, { useEffect } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { Form, Input, Button, Card, message, Space } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { useState as useStateHook, useCreateState, useUpdateState } from '../hooks/useStatemachine';
import type { PersistedType, StateForm as StateFormType } from '../types';

const { TextArea } = Input;

export const State: React.FC = () => {
  const { stateId } = useParams<{ stateId: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  
  const workflowId = searchParams.get('workflowId') || '';
  const persistedType = (searchParams.get('persistedType') || 'persisted') as PersistedType;
  const entityClassName = searchParams.get('entityClassName') || '';

  const isNew = !stateId || stateId === 'new';
  const isRuntime = persistedType === 'runtime';
  
  // Queries
  const { data: state, isLoading: isLoadingState } = useStateHook(
    persistedType,
    workflowId,
    stateId || '',
    !isNew
  );
  
  // Mutations
  const createStateMutation = useCreateState();
  const updateStateMutation = useUpdateState();
  
  // Initialize form when state data loads
  useEffect(() => {
    if (state) {
      form.setFieldsValue({
        name: state.name,
        description: state.description || '',
      });
    }
  }, [state, form]);
  
  // Handlers
  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      
      const formData: StateFormType = {
        name: values.name,
        description: values.description,
        workflowId,
        entityClassName,
      };
      
      if (isNew) {
        await createStateMutation.mutateAsync({
          persistedType,
          workflowId,
          stateData: formData,
        });
        message.success('State created successfully');
      } else {
        await updateStateMutation.mutateAsync({
          persistedType,
          workflowId,
          stateId: stateId!,
          stateData: formData,
        });
        message.success('State updated successfully');
      }
      
      // Navigate back to workflow detail
      navigate(
        `/workflow/${workflowId}?persistedType=${persistedType}&entityClassName=${entityClassName}`
      );
    } catch (error) {
      message.error('Failed to save state');
    }
  };
  
  const handleCancel = () => {
    navigate(
      `/workflow/${workflowId}?persistedType=${persistedType}&entityClassName=${entityClassName}`
    );
  };
  
  const pageTitle = isNew ? 'Create New State' : `State: ${state?.name || ''}`;
  const isLoading = isLoadingState || createStateMutation.isPending || updateStateMutation.isPending;

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
          
          <Form.Item>
            <Space>
              <Button
                type="primary"
                onClick={handleSubmit}
                loading={isLoading}
                disabled={isRuntime}
              >
                {isNew ? 'Create State' : 'Update State'}
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

export default State;


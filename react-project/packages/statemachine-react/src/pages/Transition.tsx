/**
 * Transition Form Page
 * Create and edit transitions within a workflow
 * Migrated from: .old_project/packages/statemachine/src/views/Transition.vue
 */

import React, { useEffect, useMemo, useState } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { Form, Input, Button, Card, message, Space, Row, Col, Select, Switch } from 'antd';
import {
  useTransition,
  useStatesList,
  useCreateTransition,
  useUpdateTransition,
  useCriteriaList,
  useProcessesList,
} from '../hooks/useStatemachine';
import type { PersistedType, TransitionForm as TransitionFormType } from '../types';

const { TextArea } = Input;

export const Transition: React.FC = () => {
  const { transitionId } = useParams<{ transitionId: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  
  const workflowId = searchParams.get('workflowId') || '';
  const persistedType = (searchParams.get('persistedType') || 'persisted') as PersistedType;
  const entityClassName = searchParams.get('entityClassName') || '';
  
  const isNew = !transitionId || transitionId === 'new';
  const isRuntime = persistedType === 'transient';
  
  // Queries
  const { data: transition, isLoading: isLoadingTransition } = useTransition(
    persistedType,
    workflowId,
    transitionId || '',
    !isNew
  );
  const { data: states = [], isLoading: isLoadingStates } = useStatesList(persistedType, workflowId);
  const { data: criteriaList = [], isLoading: isLoadingCriteria } = useCriteriaList(entityClassName);
  const { data: processesList = [], isLoading: isLoadingProcesses } = useProcessesList(entityClassName);
  
  // Mutations
  const createTransitionMutation = useCreateTransition();
  const updateTransitionMutation = useUpdateTransition();
  
  // State options
  const stateOptions = useMemo(() => {
    return states.map((state: any) => ({
      label: state.name,
      value: state.id,
      description: state.description,
    }));
  }, [states]);
  
  // Criteria options
  const criteriaOptions = useMemo(() => {
    return criteriaList.map((criteria: any) => ({
      label: criteria.name || criteria.id,
      value: criteria.id,
    }));
  }, [criteriaList]);
  
  // Process options
  const processOptions = useMemo(() => {
    return processesList.map((process: any) => ({
      label: process.name,
      value: process.id?.persistedId || process.id?.runtimeId || process.id,
    }));
  }, [processesList]);
  
  // Initialize form when transition data loads
  useEffect(() => {
    if (transition) {
      form.setFieldsValue({
        name: transition.name,
        description: transition.description || '',
        active: transition.active !== undefined ? transition.active : true,
        automated: transition.automated || false,
        startStateId: transition.startStateId || transition.fromState,
        endStateId: transition.endStateId || transition.toState,
        criteriaIds: transition.criteriaIds || [],
        processIds: transition.processIds || [],
      });
    } else if (isNew) {
      form.setFieldsValue({
        active: true,
        automated: false,
      });
    }
  }, [transition, isNew, form]);
  
  // Handlers
  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      
      const formData: TransitionFormType = {
        name: values.name,
        description: values.description,
        active: values.active,
        automated: values.automated,
        startStateId: values.startStateId,
        endStateId: values.endStateId,
        criteriaIds: values.criteriaIds,
        processIds: values.processIds,
        workflowId,
      };
      
      if (isNew) {
        await createTransitionMutation.mutateAsync({
          persistedType,
          workflowId,
          transitionData: formData,
        });
        message.success('Transition created successfully');
      } else {
        await updateTransitionMutation.mutateAsync({
          persistedType,
          workflowId,
          transitionId: transitionId!,
          transitionData: formData,
        });
        message.success('Transition updated successfully');
      }
      
      // Navigate back to workflow detail
      navigate(
        `/statemachine/workflow/${workflowId}?persistedType=${persistedType}&entityClassName=${entityClassName}`
      );
    } catch (error) {
      message.error('Failed to save transition');
    }
  };
  
  const handleCancel = () => {
    navigate(
      `/statemachine/workflow/${workflowId}?persistedType=${persistedType}&entityClassName=${entityClassName}`
    );
  };
  
  const pageTitle = isNew ? 'Create New Transition' : `Transition: ${transition?.name || ''}`;
  const isLoading = isLoadingTransition || createTransitionMutation.isPending || updateTransitionMutation.isPending;
  
  return (
    <div style={{ padding: '16px' }}>
      <Card>
        <Form
          form={form}
          layout="vertical"
        >
          {/* Header with title and toggles */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h2>{pageTitle}</h2>
            <Space size="large">
              <Space>
                <span>Active</span>
                <Form.Item name="active" valuePropName="checked" noStyle>
                  <Switch disabled={isRuntime} />
                </Form.Item>
              </Space>
              <Space>
                <span>Automated</span>
                <Form.Item name="automated" valuePropName="checked" noStyle>
                  <Switch disabled={isRuntime} />
                </Form.Item>
              </Space>
            </Space>
          </div>
          
          <Row gutter={24}>
            <Col span={12}>
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
            </Col>
            
            <Col span={12}>
              <Form.Item
                label="Start State"
                name="startStateId"
                rules={[{ required: true, message: 'Please select a start state' }]}
              >
                <Select
                  placeholder="Select start state"
                  disabled={isRuntime}
                  loading={isLoadingStates}
                  options={stateOptions}
                  showSearch
                  filterOption={(input, option) =>
                    (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                  }
                />
              </Form.Item>
              
              <Form.Item
                label="End State"
                name="endStateId"
                rules={[{ required: true, message: 'Please select an end state' }]}
              >
                <Select
                  placeholder="Select end state"
                  disabled={isRuntime}
                  loading={isLoadingStates}
                  options={stateOptions}
                  showSearch
                  filterOption={(input, option) =>
                    (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                  }
                />
              </Form.Item>
            </Col>
          </Row>
          
          <Row gutter={24}>
            <Col span={12}>
              <Form.Item label="Criteria" name="criteriaIds">
                <Select
                  mode="multiple"
                  placeholder="Select criteria"
                  disabled={isRuntime}
                  loading={isLoadingCriteria}
                  options={criteriaOptions}
                  showSearch
                  filterOption={(input, option) =>
                    (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                  }
                />
              </Form.Item>
            </Col>
            
            <Col span={12}>
              <Form.Item label="Processes" name="processIds">
                <Select
                  mode="multiple"
                  placeholder="Select processes"
                  disabled={isRuntime}
                  loading={isLoadingProcesses}
                  options={processOptions}
                  showSearch
                  filterOption={(input, option) =>
                    (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                  }
                />
              </Form.Item>
            </Col>
          </Row>
          
          <Form.Item>
            <Space>
              <Button
                type="primary"
                onClick={handleSubmit}
                loading={isLoading}
                disabled={isRuntime}
              >
                {isNew ? 'Create Transition' : 'Update Transition'}
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

export default Transition;


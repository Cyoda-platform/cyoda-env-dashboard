/**
 * Process Form Page
 * Create and edit processes for workflows
 * Migrated from: .old_project/packages/statemachine/src/views/Process.vue
 */

import React, { useEffect, useMemo } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { Form, Input, Button, Card, message, Space, Select, Switch } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import {
  useProcess,
  useProcessorsList,
  useEntityParentClasses,
  useCreateProcess,
  useUpdateProcess,
} from '../hooks/useStatemachine';
import type { PersistedType, ProcessForm as ProcessFormType } from '../types';

const { TextArea } = Input;

export const Process: React.FC = () => {
  const { processId } = useParams<{ processId: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  
  const persistedType = (searchParams.get('persistedType') || 'persisted') as PersistedType;
  const entityClassName = searchParams.get('entityClassName') || '';
  const workflowId = searchParams.get('workflowId') || '';
  const workflowPersistedType = searchParams.get('workflowPersistedType') || 'persisted';

  const isNew = !processId || processId === 'new';
  const isRuntime = persistedType === 'runtime';
  
  // Queries
  const { data: process, isLoading: isLoadingProcess } = useProcess(
    persistedType,
    processId || '',
    entityClassName,
    !isNew
  );
  const { data: processors = [], isLoading: isLoadingProcessors } = useProcessorsList();
  const { data: entityParentClasses = [] } = useEntityParentClasses(entityClassName);

  // Mutations
  const createProcessMutation = useCreateProcess();
  const updateProcessMutation = useUpdateProcess();

  // Processor options - filtered by entity class hierarchy
  const processorOptions = useMemo(() => {
    if (!Array.isArray(processors)) {
      return [];
    }

    // Build list of all classes (parent classes + current entity class)
    const allClasses = [...entityParentClasses, entityClassName];

    console.log('Process page - Filtering processors:', {
      entityClassName,
      entityParentClasses,
      allClasses,
      processorsCount: processors.length,
    });

    // Filter processors by entity class and map to options
    return processors
      .filter((processor: any) => {
        // Handle both string format (legacy) and object format
        if (typeof processor === 'string') {
          // Legacy format - include all processors
          return true;
        }
        // Object format with entityClass - filter by class hierarchy
        const matches = processor.entityClass && allClasses.includes(processor.entityClass);
        console.log('Processor filter:', {
          name: processor.name,
          entityClass: processor.entityClass,
          matches,
        });
        return matches;
      })
      .map((processor: any) => {
        // Handle both string format (legacy) and object format
        if (typeof processor === 'string') {
          return {
            label: processor,
            value: processor,
          };
        }
        // Object format with name and entityClass
        const fullName = processor.name || processor.value || processor;
        const shortName = fullName.split('.').pop() || fullName;
        return {
          label: shortName,
          value: fullName,
        };
      });
  }, [processors, entityParentClasses, entityClassName]);
  
  // Initialize form when process data loads
  useEffect(() => {
    if (process) {
      form.setFieldsValue({
        name: process.name,
        description: process.description || '',
        processorClassName: process.processorClassName || '',
        syncProcess: process.syncProcess || false,
        newTransactionForAsync: process.newTransactionForAsync || false,
        isTemplate: process.isTemplate || false,
      });
    } else if (isNew) {
      form.setFieldsValue({
        syncProcess: false,
        newTransactionForAsync: false,
        isTemplate: false,
      });
    }
  }, [process, isNew, form]);
  
  // Handlers
  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();

      const formData: ProcessFormType = {
        '@bean': 'com.cyoda.core.model.stateMachine.dto.ProcessDto',
        name: values.name,
        description: values.description,
        processorClassName: values.processorClassName,
        syncProcess: values.syncProcess,
        newTransactionForAsync: values.newTransactionForAsync,
        isTemplate: values.isTemplate,
        parameters: [],
        entityClassName,
      };
      
      if (isNew) {
        await createProcessMutation.mutateAsync({
          persistedType,
          form: formData,
        });
        message.success('Process created successfully');
      } else {
        await updateProcessMutation.mutateAsync({
          persistedType,
          processId: processId!,
          form: formData,
        });
        message.success('Process updated successfully');
      }
      
      // Navigate back to workflow detail
      navigate(
        `/workflow/${workflowId}?persistedType=${workflowPersistedType}&entityClassName=${entityClassName}`
      );
    } catch (error) {
      message.error('Failed to save process');
    }
  };

  const handleCancel = () => {
    navigate(
      `/workflow/${workflowId}?persistedType=${workflowPersistedType}&entityClassName=${entityClassName}`
    );
  };
  
  const pageTitle = isNew ? 'Create New Process' : `Process: ${process?.name || ''}`;
  const isLoading = isLoadingProcess || createProcessMutation.isPending || updateProcessMutation.isPending;
  const isTemplate = Form.useWatch('isTemplate', form);

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
          {/* Header with title and toggles */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '16px' }}>
            <h2>{pageTitle}</h2>
            <Space size="large">
              <Space>
                <span>Sync Process</span>
                <Form.Item name="syncProcess" valuePropName="checked" noStyle>
                  <Switch disabled={isRuntime} />
                </Form.Item>
              </Space>
              <Space>
                <span>New Transaction for Async</span>
                <Form.Item name="newTransactionForAsync" valuePropName="checked" noStyle>
                  <Switch disabled={isRuntime} />
                </Form.Item>
              </Space>
              <Space>
                <span>Template</span>
                <Form.Item name="isTemplate" valuePropName="checked" noStyle>
                  <Switch disabled={!isNew || isRuntime} />
                </Form.Item>
              </Space>
            </Space>
          </div>
          
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
          
          {isTemplate ? (
            <Form.Item
              label="Processor"
              name="processorClassName"
              rules={[{ required: true, message: 'Please enter a processor class name' }]}
            >
              <Input
                disabled={isRuntime}
                placeholder="Enter processor class name"
              />
            </Form.Item>
          ) : (
            <Form.Item
              label="Processor"
              name="processorClassName"
              rules={[{ required: true, message: 'Please select a processor' }]}
            >
              <Select
                placeholder="Select processor"
                disabled={isRuntime}
                loading={isLoadingProcessors}
                options={processorOptions}
                showSearch
                filterOption={(input, option) =>
                  (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                }
              />
            </Form.Item>
          )}
          
          <Form.Item>
            <Space>
              <Button
                type="primary"
                onClick={handleSubmit}
                loading={isLoading}
                disabled={isRuntime}
              >
                {isNew ? 'Create Process' : 'Update Process'}
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

export default Process;


/**
 * Process Form Component (Embedded)
 * Wrapper for Process page to be used in modals
 */

import React, { useEffect } from 'react';
import { Form, Input, Button, message, Space, Select, Switch } from 'antd';
import {
  useProcess,
  useProcessorsList,
  useEntityParentClasses,
  useCreateProcess,
  useUpdateProcess,
} from '../hooks/useStatemachine';
import type { PersistedType, ProcessForm as ProcessFormType } from '../types';

const { TextArea } = Input;

interface ProcessFormProps {
  processId?: string;
  entityClassName: string;
  persistedType: PersistedType;
  mode?: 'embedded' | 'standalone';
  onSubmitted?: (params: { id?: string }) => void;
}

export const ProcessForm: React.FC<ProcessFormProps> = ({
  processId = '',
  entityClassName,
  persistedType,
  mode = 'embedded',
  onSubmitted,
}) => {
  const [form] = Form.useForm();

  const isNew = !processId || processId === 'new';
  const isRuntime = persistedType === 'transient';

  console.log('ProcessForm - Props:', { entityClassName, processId, persistedType });

  // Queries
  const { data: process, isLoading: isLoadingProcess } = useProcess(
    persistedType,
    processId || '',
    entityClassName,
    !isNew
  );
  const { data: processorsList = [], isLoading: isLoadingProcessors } = useProcessorsList();
  const { data: entityParentClasses = [], isLoading: isLoadingParentClasses } = useEntityParentClasses(entityClassName);

  console.log('ProcessForm - Data loaded:', {
    processorsListLength: processorsList?.length,
    entityParentClasses,
    isLoadingParentClasses,
  });

  // Mutations
  const createProcessMutation = useCreateProcess();
  const updateProcessMutation = useUpdateProcess();

  // Processor options - filtered by entity class hierarchy
  const processorOptions = React.useMemo(() => {
    if (!Array.isArray(processorsList)) {
      return [];
    }

    // Build list of all classes (parent classes + current entity class)
    const allClasses = [...entityParentClasses, entityClassName];

    console.log('ProcessForm - Filtering processors:', {
      entityClassName,
      entityParentClasses,
      allClasses,
      processorsCount: processorsList.length,
    });

    // Filter processors by entity class and map to options
    const filtered = processorsList
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

    console.log('ProcessForm - Filtered processors:', filtered);
    return filtered;
  }, [processorsList, entityParentClasses, entityClassName]);
  
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
        description: values.description || '',
        processorClassName: values.processorClassName,
        syncProcess: values.syncProcess,
        newTransactionForAsync: values.newTransactionForAsync,
        isTemplate: values.isTemplate,
        parameters: [],
        entityClassName,
      };

      console.log('🔍 ProcessForm - Submitting data:', {
        persistedType,
        formData,
        isNew,
        entityClassName
      });

      let resultId;
      if (isNew) {
        const result = await createProcessMutation.mutateAsync({
          persistedType,
          form: formData,
        });
        console.log('✅ ProcessForm - Create result:', result);
        resultId = result?.id?.persistedId || result?.id || result?.Data?.id;
        message.success('Process created successfully');
      } else {
        await updateProcessMutation.mutateAsync({
          persistedType,
          processId: processId!,
          form: formData,
        });
        resultId = processId;
        message.success('Process updated successfully');
      }
      
      if (onSubmitted) {
        onSubmitted({ id: resultId });
      }
    } catch (error) {
      message.error('Failed to save process');
    }
  };
  
  const isLoading = isLoadingProcess || createProcessMutation.isPending || updateProcessMutation.isPending;
  const isTemplate = Form.useWatch('isTemplate', form);
  
  return (
    <Form
      form={form}
      layout="vertical"
      style={{ maxWidth: mode === 'embedded' ? '100%' : 600 }}
    >
      {/* Header with toggles */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '16px' }}>
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
              <Switch disabled={isRuntime && !isNew} />
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
            {isNew ? 'Create' : 'Update'}
          </Button>
        </Space>
      </Form.Item>
    </Form>
  );
};

export default ProcessForm;


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
  const [processParameters, setProcessParameters] = React.useState<any[]>([]);

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

  // Get parameters for the selected processor
  const getProcessorParameters = React.useCallback((processorClassName: string) => {
    if (!processorClassName || !Array.isArray(processors)) {
      return [];
    }

    const processor = processors.find((item: any) => {
      if (typeof item === 'string') {
        return item === processorClassName;
      }
      return item.name === processorClassName;
    });

    if (processor && typeof processor === 'object' && Array.isArray(processor.parameters)) {
      return processor.parameters.map((p: any) => ({
        name: p.name,
        valueType: p.type,
        availableValues: p.availableValues,
        value: {
          '@type': p.type.charAt(0).toUpperCase() + p.type.slice(1).toLowerCase(),
          value: null,
        },
      }));
    }

    return [];
  }, [processors]);

  // Watch for processor changes and update parameters
  const selectedProcessor = Form.useWatch('processorClassName', form);

  React.useEffect(() => {
    if (selectedProcessor) {
      const newParams = getProcessorParameters(selectedProcessor);

      // Only update parameters for new processes or when processor changes
      if (isNew || (process && process.processorClassName !== selectedProcessor)) {
        setProcessParameters(newParams);
      }
    }
  }, [selectedProcessor, getProcessorParameters, isNew, process]);

  // Initialize form when process data loads
  useEffect(() => {
    if (process) {
      const formValues: any = {
        name: process.name,
        description: process.description || '',
        processorClassName: process.processorClassName || '',
        syncProcess: process.syncProcess || false,
        newTransactionForAsync: process.newTransactionForAsync || false,
        isTemplate: process.isTemplate || false,
      };

      // Set parameters from loaded process
      if (process.parameters && Array.isArray(process.parameters)) {
        setProcessParameters(process.parameters);

        // Set parameter values in form
        process.parameters.forEach((param: any) => {
          formValues[`param_${param.name}`] = param.value?.value;
        });
      }

      form.setFieldsValue(formValues);
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
      // Validate required fields
      await form.validateFields();

      // Get all form values (including untouched fields with default values)
      const values = form.getFieldsValue(true);

      // Process parameters - convert integer values
      const processedParameters = processParameters.map((param) => {
        const paramValue = values[`param_${param.name}`];
        const processedParam = { ...param };

        if (paramValue !== undefined && paramValue !== null && paramValue !== '') {
          processedParam.value = {
            ...param.value,
            value: param.value['@type'].toLowerCase() === 'integer'
              ? parseInt(paramValue, 10)
              : paramValue,
          };
        }

        return processedParam;
      });

      const formData: ProcessFormType = {
        '@bean': 'com.cyoda.core.model.stateMachine.dto.ProcessDto',
        name: values.name || '',
        description: values.description || '',
        processorClassName: values.processorClassName || '',
        syncProcess: values.syncProcess ?? false,
        newTransactionForAsync: values.newTransactionForAsync ?? false,
        isTemplate: values.isTemplate ?? false,
        parameters: processedParameters,
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
    } catch (error: any) {
      console.error('❌ Process - Error saving process:', error);
      const errorMessage = error?.response?.data?.message || error?.message || 'Failed to save process';
      message.error(`Failed to save process: ${errorMessage}`);
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

          {/* Process Parameters */}
          {processParameters.length > 0 && (
            <>
              <h2 style={{ marginTop: '24px', marginBottom: '16px' }}>Process parameters</h2>
              {processParameters.map((param, index) => {
                const fieldName = `param_${param.name}`;
                const paramType = param.value['@type'];

                // If parameter has available values, render as select
                if (param.availableValues && Array.isArray(param.availableValues)) {
                  return (
                    <Form.Item
                      key={index}
                      label={param.name}
                      name={fieldName}
                      rules={[{ required: true, message: 'Please select a value' }]}
                      initialValue={param.value.value}
                    >
                      <Select
                        disabled={isRuntime}
                        placeholder={`Select ${param.name}`}
                        options={param.availableValues.map((val: any) => ({
                          label: val,
                          value: val,
                        }))}
                      />
                    </Form.Item>
                  );
                }

                // Otherwise render as input with type hint
                return (
                  <Form.Item
                    key={index}
                    label={
                      <span>
                        {param.name} <small style={{ color: '#999' }}>{paramType}</small>
                      </span>
                    }
                    name={fieldName}
                    rules={[{ required: true, message: 'Please fill field' }]}
                    initialValue={param.value.value}
                  >
                    <Input
                      disabled={isRuntime}
                      placeholder={`Enter ${param.name}`}
                      type={paramType.toLowerCase() === 'integer' ? 'number' : 'text'}
                    />
                  </Form.Item>
                );
              })}
            </>
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


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
import './ProcessForm.scss';

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
  const [processParameters, setProcessParameters] = React.useState<any[]>([]);

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

  // Get parameters for the selected processor
  const getProcessorParameters = React.useCallback((processorClassName: string) => {
    if (!processorClassName || !Array.isArray(processorsList)) {
      return [];
    }

    const processor = processorsList.find((item: any) => {
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
  }, [processorsList]);

  // Watch for processor changes and update parameters
  const selectedProcessor = Form.useWatch('processorClassName', form);

  React.useEffect(() => {
    if (selectedProcessor) {
      const newParams = getProcessorParameters(selectedProcessor);
      console.log('ProcessForm - Processor changed, updating parameters:', {
        processor: selectedProcessor,
        parameters: newParams,
        isNew,
      });

      // Only update parameters for new processes or when processor changes
      if (isNew || (process && process.processorClassName !== selectedProcessor)) {
        setProcessParameters(newParams);
      }
    }
  }, [selectedProcessor, getProcessorParameters, isNew, process]);

  // Initialize form when process data loads
  useEffect(() => {
    if (process) {
      console.log('[ProcessForm] Loading process data:', process);
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

      console.log('🔍 ProcessForm - Form values after validation:', values);

      // Process parameters - convert integer values
      const processedParameters = processParameters.map((param) => {
        const paramValue = values[`param_${param.name}`];
        const processedParam = { ...param };

        console.log('Processing parameter:', {
          name: param.name,
          type: param.value['@type'],
          rawValue: paramValue,
        });

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

      console.log('🔍 ProcessForm - Submitting data:', {
        persistedType,
        formData,
        isNew,
        entityClassName,
        processParameters,
        processedParameters,
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
    } catch (error: any) {
      console.error('❌ ProcessForm - Error saving process:', error);
      const errorMessage = error?.response?.data?.message || error?.message || 'Failed to save process';
      message.error(`Failed to save process: ${errorMessage}`);
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
            popupClassName="process-form-dropdown"
            dropdownStyle={{ minWidth: '400px' }}
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
                    popupClassName="process-form-dropdown"
                    dropdownStyle={{ minWidth: '300px' }}
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
            {isNew ? 'Create' : 'Update'}
          </Button>
        </Space>
      </Form.Item>
    </Form>
  );
};

export default ProcessForm;


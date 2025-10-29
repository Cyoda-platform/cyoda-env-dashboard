/**
 * Criteria Form Component (Embedded)
 * Wrapper for Criteria page to be used in modals
 */

import React, { useEffect } from 'react';
import { Form, Input, Button, message, Space, Select } from 'antd';
import {
  useCriteria,
  useCriteriacheckers,
  useCreateCriteria,
  useUpdateCriteria,
} from '../hooks/useStatemachine';
import type { PersistedType, CriteriaForm as CriteriaFormType } from '../types';

const { TextArea } = Input;

interface CriteriaFormProps {
  criteriaId?: string;
  entityClassName: string;
  persistedType: PersistedType;
  mode?: 'embedded' | 'standalone';
  onSubmitted?: (params: { id?: string }) => void;
}

export const CriteriaForm: React.FC<CriteriaFormProps> = ({
  criteriaId = '',
  entityClassName,
  persistedType,
  mode = 'embedded',
  onSubmitted,
}) => {
  const [form] = Form.useForm();
  const [criteriaParameters, setCriteriaParameters] = React.useState<any[]>([]);

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
  const checkerOptions = React.useMemo(() => {
    if (Array.isArray(criteriacheckers)) {
      return criteriacheckers.map((checker: any) => ({
        label: typeof checker === 'string' ? checker : (checker.name || checker.value || checker),
        value: typeof checker === 'string' ? checker : (checker.value || checker.name || checker),
      }));
    }
    return [];
  }, [criteriacheckers]);

  // Get parameters for the selected criteria checker
  const getCriteriaCheckerParameters = React.useCallback((criteriaChecker: string) => {
    if (!criteriaChecker || !Array.isArray(criteriacheckers)) {
      return [];
    }

    const checker = criteriacheckers.find((item: any) => {
      if (typeof item === 'string') {
        return item === criteriaChecker;
      }
      return item.name === criteriaChecker || item.value === criteriaChecker;
    });

    if (checker && typeof checker === 'object' && Array.isArray(checker.parameters)) {
      return checker.parameters.map((p: any) => ({
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
  }, [criteriacheckers]);

  // Watch for criteria checker changes and update parameters
  const selectedChecker = Form.useWatch('criteriaChecker', form);

  React.useEffect(() => {
    if (selectedChecker) {
      const newParams = getCriteriaCheckerParameters(selectedChecker);
      console.log('CriteriaForm - Checker changed, updating parameters:', {
        checker: selectedChecker,
        parameters: newParams,
      });

      // Only update parameters for new criteria or when checker changes
      if (isNew || (criteria && criteria.criteriaChecker !== selectedChecker)) {
        setCriteriaParameters(newParams);
      }
    }
  }, [selectedChecker, getCriteriaCheckerParameters, isNew, criteria]);

  // Initialize form when criteria data loads
  useEffect(() => {
    if (criteria) {
      const formValues: any = {
        name: criteria.name,
        description: criteria.description || '',
        criteriaChecker: criteria.criteriaChecker || '',
      };

      // Set parameters from loaded criteria
      if (criteria.parameters && Array.isArray(criteria.parameters)) {
        setCriteriaParameters(criteria.parameters);

        // Set parameter values in form
        criteria.parameters.forEach((param: any) => {
          formValues[`param_${param.name}`] = param.value?.value;
        });
      }

      form.setFieldsValue(formValues);
    }
  }, [criteria, form]);
  
  // Handlers
  const handleSubmit = async () => {
    try {
      // Validate required fields
      await form.validateFields();

      // Get all form values
      const values = form.getFieldsValue(true);

      // Process parameters - convert integer values
      const processedParameters = criteriaParameters.map((param) => {
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

      const formData: CriteriaFormType = {
        '@bean': 'com.cyoda.core.model.stateMachine.dto.CriteriaDto',
        name: values.name || '',
        description: values.description || '',
        criteriaChecker: values.criteriaChecker || '',
        entityClassName,
        condition: {
          '@bean': 'com.cyoda.core.conditions.GroupCondition',
          operator: 'AND',
          conditions: [],
        },
        parameters: processedParameters,
        colDefs: [],
        aliasDefs: [],
      };

      console.log('🔍 CriteriaForm - Submitting data:', {
        persistedType,
        formData,
        isNew,
        criteriaParameters,
        processedParameters,
      });
      
      let resultId;
      if (isNew) {
        const result = await createCriteriaMutation.mutateAsync({
          persistedType,
          form: formData,
        });
        resultId = result?.id || result?.Data?.id;
        message.success('Criteria created successfully');
      } else {
        await updateCriteriaMutation.mutateAsync({
          persistedType,
          criteriaId: criteriaId!,
          form: formData,
        });
        resultId = criteriaId;
        message.success('Criteria updated successfully');
      }
      
      if (onSubmitted) {
        onSubmitted({ id: resultId });
      }
    } catch (error: any) {
      console.error('❌ CriteriaForm - Error saving criteria:', error);
      const errorMessage = error?.response?.data?.message || error?.message || 'Failed to save criteria';
      message.error(`Failed to save criteria: ${errorMessage}`);
    }
  };
  
  const isLoading = isLoadingCriteria || createCriteriaMutation.isPending || updateCriteriaMutation.isPending;
  
  return (
    <Form
      form={form}
      layout="vertical"
      style={{ maxWidth: mode === 'embedded' ? '100%' : 600 }}
    >
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

      {/* Criteria Parameters */}
      {criteriaParameters.length > 0 && (
        <>
          <h2 style={{ marginTop: '24px', marginBottom: '16px' }}>Criteria parameters</h2>
          {criteriaParameters.map((param, index) => {
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
            {isNew ? 'Create' : 'Update'}
          </Button>
        </Space>
      </Form.Item>
    </Form>
  );
};

export default CriteriaForm;


/**
 * Criteria Form Component (Embedded)
 * Wrapper for Criteria page to be used in modals
 */

import React, { useEffect, useState, useMemo } from 'react';
import { Form, Input, Button, message, Space, Select, Alert, Tabs, Switch } from 'antd';
import {
  useCriteria,
  useCriteriacheckers,
  useCreateCriteria,
  useUpdateCriteria,
} from '../hooks/useStatemachine';
import { useStatemachineStore } from '../stores/statemachineStore';
import type { PersistedType, CriteriaForm as CriteriaFormType } from '../types';
import FilterBuilderGroup from './FilterBuilder/FilterBuilderGroup';
import HelperFilter, { type GroupCondition } from './FilterBuilder/HelperFilter';
import { ReportEditorTabModel, HelperReportDefinition } from '@cyoda/tableau-react';
import './CriteriaForm.scss';

const { TextArea } = Input;

/**
 * Extract all field paths from condition recursively
 * Excludes alias names from the result
 */
function extractFieldPathsFromCondition(conditions: any[], aliasNames: string[]): string[] {
  let colPaths: string[] = [];

  if (!conditions || !Array.isArray(conditions)) {
    return colPaths;
  }

  conditions.forEach((el) => {
    if ('conditions' in el && Array.isArray(el.conditions)) {
      // Recursively process nested groups
      colPaths = [...colPaths, ...extractFieldPathsFromCondition(el.conditions, aliasNames)];
    } else if (el.fieldName) {
      // Add fieldName if it's not an alias and not already added
      if (!aliasNames.includes(el.fieldName) && !colPaths.includes(el.fieldName)) {
        colPaths.push(el.fieldName);
      }
    }
  });

  return colPaths;
}

interface CriteriaFormProps {
  criteriaId?: string;
  entityClassName: string;
  persistedType: PersistedType;
  mode?: 'embedded' | 'standalone' | 'page';
  onSubmitted?: (params: { id?: string }) => void;
  onCancel?: () => void;
}

export const CriteriaForm: React.FC<CriteriaFormProps> = ({
  criteriaId = '',
  entityClassName,
  persistedType,
  mode = 'embedded',
  onSubmitted,
  onCancel,
}) => {
  const [form] = Form.useForm();
  const [criteriaParameters, setCriteriaParameters] = React.useState<any[]>([]);
  const [condition, setCondition] = useState<GroupCondition>(HelperFilter.getGroup());

  // Config definition for Fields tab (colDefs and aliasDefs)
  const [configDefinition, setConfigDefinition] = useState<any>({
    requestClass: entityClassName,
    colDefs: [],
    aliasDefs: [],
  });

  // Update requestClass when entityClassName changes
  useEffect(() => {
    setConfigDefinition((prev: any) => ({
      ...prev,
      requestClass: entityClassName,
    }));
  }, [entityClassName]);

  // Determine if criteria is coded (Developer Coded) or built-in UI
  // Based on condition @bean type - if it contains "ConfigurableUnaryCondition" it's coded
  const isCodeCriteria = useMemo(() => {
    return (
      condition &&
      condition['@bean'] &&
      condition['@bean'].indexOf('ConfigurableUnaryCondition') !== -1
    );
  }, [condition]);

  const isNew = !criteriaId || criteriaId === 'new';
  const isRuntime = persistedType === 'transient';

  // Track if form has been initialized to prevent loops
  const formInitializedRef = React.useRef(false);
  const colDefsLoadedRef = React.useRef(false);

  // Reset initialization flags on unmount
  React.useEffect(() => {
    return () => {
      formInitializedRef.current = false;
      colDefsLoadedRef.current = false;
    };
  }, []);

  // Build cols for FilterBuilder from configDefinition (colDefs + aliasDefs)
  const cols = useMemo(() => {
    console.log('CriteriaForm - configDefinition:', configDefinition);
    const builtCols = HelperReportDefinition.buildCols(configDefinition);
    console.log('CriteriaForm - built cols:', builtCols);
    return builtCols;
  }, [configDefinition]);

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
      return criteriacheckers.map((checker: any) => {
        // Handle both string and object formats
        if (typeof checker === 'string') {
          return {
            label: checker.split('.').pop() || checker,
            value: checker,
          };
        }
        // Object format with name property
        const fullName = checker.name || checker.value || checker;
        const shortName = fullName.split('.').pop() || fullName;
        return {
          label: shortName,
          value: fullName,
        };
      });
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

      // Only update parameters for new criteria or when checker changes
      if (isNew || (criteria && criteria.criteriaChecker !== selectedChecker)) {
        setCriteriaParameters(newParams);
      }
    }
  }, [selectedChecker, getCriteriaCheckerParameters, isNew, criteria]);

  // Initialize form when criteria data loads
  useEffect(() => {
    if (criteria && !formInitializedRef.current) {
      formInitializedRef.current = true;

      const formValues: any = {
        name: criteria.name,
        description: criteria.description || '',
        criteriaChecker: criteria.criteriaChecker || '',
      };

      // Load condition for FilterBuilder
      if (criteria.condition) {
        // Check if it's a ConfigurableUnaryCondition (coded criteria) - keep as is
        const isCodedCondition = criteria.condition['@bean'] &&
          criteria.condition['@bean'].indexOf('ConfigurableUnaryCondition') !== -1;

        if (isCodedCondition) {
          // Keep coded condition as is
          setCondition(criteria.condition);
        } else if (criteria.condition.conditions && Array.isArray(criteria.condition.conditions)) {
          // It's already a GroupCondition
          setCondition(criteria.condition);
        } else {
          // Wrap single condition in a group
          const group = HelperFilter.getGroup();
          group.conditions = [criteria.condition];
          setCondition(group);
        }
      }

      // Load aliasDefs for Fields tab
      const aliasDefs = criteria.aliasDefs || [];
      setConfigDefinition((prev: any) => ({
        ...prev,
        aliasDefs,
      }));

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

  // Load colDefs from API when criteria is loaded
  // Extract field paths from condition and fetch column definitions
  useEffect(() => {
    if (!criteria || !criteria.condition || !criteria.condition.conditions || colDefsLoadedRef.current) {
      return;
    }

    const loadColDefs = async () => {
      try {
        colDefsLoadedRef.current = true;

        // Get alias names to exclude from colPaths
        const aliasNames = (criteria.aliasDefs || []).map((el: any) => el.name);

        // Extract all field paths from condition
        const colPaths = extractFieldPathsFromCondition(criteria.condition.conditions, aliasNames);

        if (colPaths.length > 0) {
          // Fetch column definitions from API
          const { data: colDefs } = await useStatemachineStore.getState().getCriteriaDefs({
            rootClass: entityClassName,
            colPaths,
          });

          // Update configDefinition with loaded colDefs
          setConfigDefinition((prev: any) => ({
            ...prev,
            colDefs: colDefs || [],
          }));
        }
      } catch (error) {
        console.error('Failed to load column definitions:', error);
      }
    };

    loadColDefs();
  }, [criteria, entityClassName]);

  // Handlers
  const handleSubmit = async () => {
    try {
      // Validate required fields
      await form.validateFields();

      // Validate condition (only for Built-in UI criteria)
      if (!isCodeCriteria && condition.conditions) {
        const isValid = HelperReportDefinition.validateConfigDefinition(condition.conditions);
        if (!isValid) {
          message.error('Please fill all filter conditions');
          return;
        }
      }

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

      // Validate that condition is an object, not a string
      if (typeof condition === 'string') {
        console.error('❌ CriteriaForm - condition is a string, not an object!', condition);
        message.error('Invalid condition state. Please refresh the page and try again.');
        return;
      }

      if (!condition || !condition['@bean']) {
        console.error('❌ CriteriaForm - condition is missing @bean property!', condition);
        message.error('Invalid condition. Please configure the criteria properly.');
        return;
      }

      const formData: CriteriaFormType = {
        '@bean': 'com.cyoda.core.model.stateMachine.dto.CriteriaDto',
        name: values.name || '',
        description: values.description || '',
        criteriaChecker: values.criteriaChecker || '',
        entityClassName,
        condition: condition, // Always send the condition (either GroupCondition or ConfigurableUnaryCondition)
        parameters: processedParameters,
        aliasDefs: configDefinition.aliasDefs || [], // Send aliasDefs to API
        // Note: colDefs is NOT sent to the API (it's removed in the old Vue project)
        // colDefs is only used internally for the criteria builder UI
      };

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
    >
      <Form.Item
        label="Name"
        name="name"
        rules={[{ required: true, message: 'Please enter a name' }]}
        style={{ maxWidth: 600 }}
      >
        <Input disabled={isRuntime} />
      </Form.Item>

      <Form.Item
        label="Description"
        name="description"
        style={{ maxWidth: 600 }}
      >
        <TextArea
          disabled={isRuntime}
          autoSize={{ minRows: 3, maxRows: 6 }}
        />
      </Form.Item>

      {/* Criteria Section */}
      <div style={{ marginBottom: '24px' }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '16px'
        }}>
          <h3 style={{
            margin: 0,
            fontSize: '12px',
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
            color: '#888'
          }}>
            Criteria
          </h3>
          <Space>
            <span style={{ fontSize: '14px' }}>Developer Coded</span>
            <Switch
              checked={!isCodeCriteria}
              disabled={true}
            />
            <span style={{ fontSize: '14px', color: '#888' }}>Built in UI</span>
          </Space>
        </div>

        {isCodeCriteria ? (
          <Alert
            message="Criteria is coded. No filter builder available"
            type="info"
            showIcon
            style={{ marginBottom: '16px' }}
          />
        ) : (
          <Tabs
            type="card"
            className="criteria-tabs"
            items={[
              {
                key: 'filterbuilder',
                label: 'FilterBuilder',
                children: (
                  <div style={{ padding: '16px' }}>
                    <FilterBuilderGroup
                      condition={condition}
                      cols={cols}
                      readOnly={isRuntime}
                      showErrors={false}
                      onChange={setCondition}
                    />
                  </div>
                ),
              },
              {
                key: 'fields',
                label: 'Fields',
                children: (
                  <div style={{ padding: '16px' }}>
                    <ReportEditorTabModel
                      configDefinition={configDefinition}
                      onChange={(updates) => {
                        setConfigDefinition({ ...configDefinition, ...updates });
                      }}
                      readOnly={isRuntime}
                      showAliases={true}
                    />
                  </div>
                ),
              },
            ]}
          />
        )}
      </div>

      {/* Criteria Checker - always shown, not just for coded criteria */}
      <Form.Item
        label="Criteria Checker"
        name="criteriaChecker"
        rules={[{ required: isCodeCriteria, message: 'Please select a criteria checker' }]}
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
          classNames={{ popup: { root: 'criteria-form-dropdown' } }}
          styles={{ popup: { root: { minWidth: '400px' } } }}
        />
      </Form.Item>

      {/* Criteria Parameters */}
      {isCodeCriteria && criteriaParameters.length > 0 && (
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
                    popupMatchSelectWidth={false}
                    styles={{ popup: { root: { minWidth: '300px' } } }}
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


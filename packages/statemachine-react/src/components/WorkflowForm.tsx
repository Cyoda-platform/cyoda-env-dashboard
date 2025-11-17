/**
 * Workflow Form Component
 * Create and edit workflow details
 * Migrated from: .old_project/packages/statemachine/src/components/WorkflowForm.vue
 */

import React, { useEffect, useState, useMemo } from 'react';
import { Form, Input, Select, Switch, Button, Tabs, App, Space, Checkbox, Alert } from 'antd';
import type { TabsProps } from 'antd';
import { useNavigate } from 'react-router-dom';
import {
  useWorkflow,
  useWorkflowEnabledTypes,
  useCriteriaList,
  useCreateWorkflow,
  useUpdateWorkflow,
} from '../hooks/useStatemachine';
import { useQueryInvalidation } from '../hooks/useQueryInvalidation';
import type { PersistedType, WorkflowForm as WorkflowFormType } from '../types';
import './WorkflowForm.scss';

const { TextArea } = Input;

interface WorkflowFormProps {
  workflowId?: string;
  persistedType?: PersistedType;
}

export const WorkflowForm: React.FC<WorkflowFormProps> = ({
  workflowId,
  persistedType = 'persisted',
}) => {
  const { message } = App.useApp();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [activeTab, setActiveTab] = useState('settings');
  const [selectedEntityClassName, setSelectedEntityClassName] = useState<string>('');
  const [useDecisionTreeEnabled, setUseDecisionTreeEnabled] = useState<boolean>(false);

  // Query invalidation (replaces event bus)
  const { invalidateWorkflow, invalidateTransitions } = useQueryInvalidation();

  const isNew = !workflowId || workflowId === 'new';
  const isRuntime = persistedType === 'transient';

  // Queries
  const { data: workflow, isLoading: isLoadingWorkflow } = useWorkflow(
    persistedType,
    workflowId || '',
    !isNew
  );
  const { data: workflowEnabledTypes = [], isLoading: isLoadingTypes } = useWorkflowEnabledTypes();
  const { data: criteriaList = [], isLoading: isLoadingCriteria } = useCriteriaList(selectedEntityClassName);

  // Mutations
  const createWorkflowMutation = useCreateWorkflow();
  const updateWorkflowMutation = useUpdateWorkflow();
  
  // Initialize form when workflow data loads
  useEffect(() => {
    if (workflow) {
      const useDecisionTree = workflow.useDecisionTree || false;
      // Extract documentLink from metaData if it exists
      const documentLink = (workflow as any).metaData?.documentLink || '';

      console.log('[WorkflowForm] Loading workflow:', workflow);
      console.log('[WorkflowForm] criteriaIds:', workflow.criteriaIds);

      form.setFieldsValue({
        entityClassName: workflow.entityClassName,
        name: workflow.name,
        description: workflow.description || '',
        documentLink,
        criteriaIds: workflow.criteriaIds || [],
        active: workflow.active !== undefined ? workflow.active : true,
        useDecisionTree,
      });
      setSelectedEntityClassName(workflow.entityClassName);
      setUseDecisionTreeEnabled(useDecisionTree);
    } else if (isNew) {
      form.setFieldsValue({
        active: true,
        useDecisionTree: false,
      });
      setUseDecisionTreeEnabled(false);
    }
  }, [workflow, isNew, form]);
  
  // Helper function to map entity type
  const entityTypeMapper = (type: string): string => {
    const map: Record<string, string> = {
      BUSINESS: 'Business',
      PERSISTENCE: 'Technical',
    };
    return map[type] || type;
  };

  // Entity type options - NOT filtered by global entity type toggle
  // The WorkflowForm shows ALL entities regardless of the global toggle
  // This matches the Vue implementation behavior
  const entityOptions = useMemo(() => {
    return workflowEnabledTypes
      .map((type: any) => {
        // Handle both string arrays and object arrays
        if (typeof type === 'string') {
          return { label: type, value: type };
        }

        // Handle different API response formats:
        // 1. { name: 'com.example.Entity', type: 'BUSINESS' }
        // 2. { value: 'com.example.Entity', label: 'Entity' }
        // 3. { entityClass: 'com.example.Entity', workflowEnabled: true }
        const value = type.value || type.name || type.entityClass;
        if (!value || typeof value !== 'string') {
          console.warn('Invalid entity type:', type);
          return null;
        }

        // If entity has type info, add it to the label
        let label = type.label || value;
        if (type.type) {
          const typeLabel = entityTypeMapper(type.type);
          label = `${value} (${typeLabel})`;
        }

        return {
          label,
          value,
        };
      })
      .filter(Boolean); // Remove any null entries
  }, [workflowEnabledTypes]);
  
  // Criteria options
  const criteriaOptions = criteriaList.map((criteria: any) => ({
    label: criteria.name || criteria.id,
    value: criteria.id,
  }));
  
  // Handlers
  const handleEntityChange = (value: string) => {
    setSelectedEntityClassName(value);
  };
  
  const handleSave = async () => {
    try {
      const values = await form.validateFields();

      if (isNew) {
        // For new workflows, create a minimal object
        const formData: WorkflowFormType = {
          '@bean': 'com.cyoda.core.model.stateMachine.dto.WorkflowDto',
          name: values.name,
          entityClassName: values.entityClassName,
          active: values.active,
          persisted: persistedType === 'persisted',
          description: values.description,
          metaData: {
            documentLink: values.documentLink || '',
          },
          criteriaIds: values.criteriaIds || [],
          useDecisionTree: values.useDecisionTree || false,
          decisionTrees: [],
        };

        const newWorkflow = await createWorkflowMutation.mutateAsync(formData);
        message.success('Workflow created successfully');

        // Invalidate transitions list (replaces eventBus.$emit('transitions:reload'))
        invalidateTransitions(newWorkflow.id);

        navigate(
          `/workflow/${newWorkflow.id}?persistedType=persisted&entityClassName=${values.entityClassName}`
        );
      } else {
        // For updates, include all fields from the original workflow (like Vue project does)
        // This ensures backend receives all required fields including owner, creationDate, etc.
        // IMPORTANT: We must preserve transitionIds and stateIds from the original workflow
        // Backend doesn't allow changing these fields directly - they are managed through
        // separate transition/state endpoints
        const formData = {
          // Start with all fields from the original workflow
          ...workflow,
          // Override with form values
          '@bean': 'com.cyoda.core.model.stateMachine.dto.WorkflowDto',
          id: workflowId,
          name: values.name,
          entityClassName: values.entityClassName,
          active: values.active,
          description: values.description,
          metaData: {
            documentLink: values.documentLink || '',
          },
          criteriaIds: values.criteriaIds || [],
          useDecisionTree: values.useDecisionTree || false,
          decisionTrees: (workflow as any)?.decisionTrees || [],
          // Preserve transitionIds and stateIds from original workflow
          // These are read-only fields managed by backend
          transitionIds: (workflow as any)?.transitionIds || [],
          stateIds: (workflow as any)?.stateIds || [],
        };

        console.log('[WorkflowForm] Saving workflow with data:', formData);

        await updateWorkflowMutation.mutateAsync(formData);
        message.success('Workflow updated successfully');

        // Invalidate workflow data (replaces eventBus.$emit('workflow:reload'))
        invalidateWorkflow(workflowId);
      }
    } catch (error: any) {
      console.error('[WorkflowForm] Save error:', error);

      // Check for specific error codes
      const errorMessage = error?.response?.data?.message || error?.message || 'Failed to save workflow';
      const errorCode = error?.response?.data?.code;

      if (errorCode === 'NON_EXISTING_TRANSITIONS_IN_LIST' || errorMessage.includes('NON_EXISTING_TRANSITIONS_IN_LIST')) {
        message.error('At least one transition is required. Please add a transition before saving.');
      } else {
        message.error(errorMessage);
      }
    }
  };
  
  const pageTitle = isNew ? 'Create New Workflow' : workflow?.name || 'Workflow';
  const isLoading = isLoadingWorkflow || createWorkflowMutation.isPending || updateWorkflowMutation.isPending;

  // Define tabs using the new items API
  // Decision Tree tab is only shown when useDecisionTreeEnabled is true (matches Vue v-if behavior)
  const tabItems: TabsProps['items'] = useMemo(() => {
    const tabs = [
    {
      key: 'settings',
      label: 'Settings',
      children: (
        <>
            <Form.Item
              label="Entity Class Name"
              name="entityClassName"
              rules={[{ required: true, message: 'Please select an entity class' }]}
            >
              <Select
                placeholder="Select entity"
                onChange={handleEntityChange}
                disabled={!isNew}
                loading={isLoadingTypes}
                options={entityOptions}
                showSearch
                filterOption={(input, option) =>
                  String(option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                }
                popupMatchSelectWidth={false}
                dropdownStyle={{ minWidth: '400px' }}
              />
            </Form.Item>
            
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
              label="Documentation Link"
              name="documentLink"
              rules={[
                { type: 'url', message: 'Documentation Link must be a valid URL' }
              ]}
            >
              <Input disabled={isRuntime} placeholder="https://..." />
            </Form.Item>
            
            <Form.Item label="Criteria" name="criteriaIds">
              <Select
                mode="multiple"
                placeholder="Select criteria"
                disabled={isRuntime}
                loading={isLoadingCriteria}
                options={criteriaOptions}
                showSearch
                filterOption={(input, option) =>
                  String(option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                }
                popupMatchSelectWidth={false}
                dropdownStyle={{ minWidth: '400px' }}
              />
            </Form.Item>

            {/* Decision Tree feature is disabled - hidden like in Vue (v-if="false") */}
            {false && (
              <Form.Item name="useDecisionTree" valuePropName="checked">
                <Checkbox
                  disabled={isRuntime}
                  onChange={(e) => setUseDecisionTreeEnabled(e.target.checked)}
                >
                  Use Decision Tree
                </Checkbox>
              </Form.Item>
            )}
          </>
      ),
    }];

    // Only add Decision Tree tab if useDecisionTreeEnabled is true (matches Vue v-if="form.useDecisionTree")
    if (useDecisionTreeEnabled) {
      tabs.push({
        key: 'decisionTree',
        label: 'Decision Tree',
        children: (
          <>
            <Alert
              message="Decision Tree Configuration"
              description="Decision trees allow you to define complex conditional logic for state transitions. This feature enables you to create branching logic based on criteria evaluation."
              type="info"
              showIcon
              style={{ marginBottom: '16px' }}
            />
            <div style={{ padding: '20px', textAlign: 'center', color: '#999' }}>
              <p>Decision tree visual editor coming soon...</p>
              <p style={{ fontSize: '12px', marginTop: '8px' }}>
                Enable "Use Decision Tree" checkbox in Settings tab to activate this feature.
              </p>
            </div>
          </>
        ),
      });
    }

    return tabs;
  }, [entityOptions, isNew, isRuntime, isLoadingTypes, isLoadingCriteria, criteriaOptions, useDecisionTreeEnabled, handleEntityChange]);

  return (
    <div className="workflow-form">
      <Form
        form={form}
        layout="vertical"
        style={{ maxWidth: 600 }}
      >
        {/* Header with title and active toggle */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h2>{pageTitle}</h2>
          <Space>
            <span>Active</span>
            <Form.Item name="active" valuePropName="checked" noStyle>
              <Switch disabled={isRuntime} />
            </Form.Item>
          </Space>
        </div>

        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          items={tabItems}
          className="workflow-form-tabs"
          tabBarStyle={{
            background: 'transparent',
            backgroundColor: 'transparent',
          }}
        />

        <Form.Item>
          <Button
            type="primary"
            onClick={handleSave}
            loading={isLoading}
            disabled={isRuntime}
          >
            Save
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default WorkflowForm;


/**
 * Workflow Form Component
 * Create and edit workflow details
 * Migrated from: .old_project/packages/statemachine/src/components/WorkflowForm.vue
 */

import React, { useEffect, useState, useMemo } from 'react';
import { Form, Input, Select, Switch, Button, Tabs, message, Space, Checkbox, Alert } from 'antd';
import { useNavigate } from 'react-router-dom';
import {
  useWorkflow,
  useWorkflowEnabledTypes,
  useCriteriaList,
  useCreateWorkflow,
  useUpdateWorkflow,
} from '../hooks/useStatemachine';
import { useGlobalUiSettingsStore } from '../stores/globalUiSettingsStore';
import type { PersistedType, WorkflowForm as WorkflowFormType } from '../types';

const { TextArea } = Input;
const { TabPane } = Tabs;

interface WorkflowFormProps {
  workflowId?: string;
  persistedType?: PersistedType;
}

export const WorkflowForm: React.FC<WorkflowFormProps> = ({
  workflowId,
  persistedType = 'persisted',
}) => {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [activeTab, setActiveTab] = useState('settings');
  const [selectedEntityClassName, setSelectedEntityClassName] = useState<string>('');
  const [useDecisionTreeEnabled, setUseDecisionTreeEnabled] = useState<boolean>(false);

  const isNew = !workflowId || workflowId === 'new';
  const isRuntime = persistedType === 'transient';

  // Global UI settings
  const { entityType, isEnabledTechView } = useGlobalUiSettingsStore();

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
      form.setFieldsValue({
        entityClassName: workflow.entityClassName,
        name: workflow.name,
        description: workflow.description || '',
        documentLink: workflow.documentLink || '',
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

  // Entity type options - filtered by selected entity type
  const entityOptions = useMemo(() => {
    return workflowEnabledTypes
      .filter((type: any) => {
        // If tech view is enabled, filter by entity type
        if (isEnabledTechView && typeof type === 'object' && type.type) {
          return type.type === entityType;
        }
        return true;
      })
      .map((type: any) => {
        // Handle both string arrays and object arrays
        if (typeof type === 'string') {
          return { label: type, value: type };
        }

        // If entity has type info, add it to the label
        let label = type.name || type.value || type;
        if (type.type) {
          const typeLabel = entityTypeMapper(type.type);
          label = `${type.name} (${typeLabel})`;
        }

        return {
          label,
          value: type.value || type.name || type,
        };
      });
  }, [workflowEnabledTypes, entityType, isEnabledTechView]);
  
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
      
      const formData: WorkflowFormType = {
        name: values.name,
        entityClassName: values.entityClassName,
        active: values.active,
        persisted: persistedType === 'persisted',
        description: values.description,
        documentLink: values.documentLink,
        criteriaIds: values.criteriaIds,
        useDecisionTree: values.useDecisionTree,
      };
      
      if (isNew) {
        const newWorkflow = await createWorkflowMutation.mutateAsync(formData);
        message.success('Workflow created successfully');
        navigate(
          `/workflow/${newWorkflow.id}?persistedType=persisted&entityClassName=${values.entityClassName}`
        );
      } else {
        await updateWorkflowMutation.mutateAsync({
          ...formData,
          id: workflowId!,
        });
        message.success('Workflow updated successfully');
      }
    } catch (error) {
      message.error('Failed to save workflow');
    }
  };
  
  const pageTitle = isNew ? 'Create New Workflow' : workflow?.name || 'Workflow';
  const isLoading = isLoadingWorkflow || createWorkflowMutation.isPending || updateWorkflowMutation.isPending;
  
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
        
        <Tabs activeKey={activeTab} onChange={setActiveTab}>
          <TabPane tab="Settings" key="settings">
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
              />
            </Form.Item>

            <Form.Item name="useDecisionTree" valuePropName="checked">
              <Checkbox
                disabled={isRuntime}
                onChange={(e) => setUseDecisionTreeEnabled(e.target.checked)}
              >
                Use Decision Tree
              </Checkbox>
            </Form.Item>
          </TabPane>

          {/* Decision Tree tab */}
          <TabPane tab="Decision Tree" key="decisionTree" disabled={!useDecisionTreeEnabled}>
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
          </TabPane>
        </Tabs>
        
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


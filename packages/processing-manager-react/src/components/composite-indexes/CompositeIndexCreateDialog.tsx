/**
 * CompositeIndexCreateDialog Component
 * Dialog for creating new composite indexes with 3 steps
 * Migrated from: .old_project/packages/http-api/src/views/CompositeIndexes/CompositeIndexesNew.vue
 */

import React, { useState, useEffect } from 'react';
import { Modal, Steps, Form, Input, Button, Space, App } from 'antd';
import { ModellingRangeDefs, ModellingColDefs } from '@cyoda/tableau-react';
import type { ColDef } from '@cyoda/tableau-react';
import './CompositeIndexCreateDialog.scss';

interface CompositeIndexCreateDialogProps {
  open: boolean;
  entityClass: string;
  onCancel: () => void;
  onCreate: (data: CompositeIndexFormData) => void;
  loading?: boolean;
}

export interface CompositeIndexFormData {
  '@bean': string;
  entityClass: string;
  name: string;
  rangeColPath: string;
  columns: string[];
}

const steps = ['Name', 'Range Field', 'None Range Fields'];

export const CompositeIndexCreateDialog: React.FC<CompositeIndexCreateDialogProps> = ({
  open,
  entityClass,
  onCancel,
  onCreate,
  loading = false,
}) => {
  const { message } = App.useApp();
  const [currentStep, setCurrentStep] = useState(0);
  const [form] = Form.useForm();

  // Form data state
  const [formData, setFormData] = useState<CompositeIndexFormData>({
    '@bean': 'com.cyoda.core.model.index.dto.IndexParametersDefDto',
    entityClass: entityClass,
    name: '',
    rangeColPath: '',
    columns: [],
  });

  // Config definition for ModellingColDefs
  const [configDefinition, setConfigDefinition] = useState<any>({
    requestClass: entityClass,
    colDefs: [],
  });

  // Range column state
  const [configDefinitionColRanges, setConfigDefinitionColRanges] = useState<ColDef[]>([]);

  // Reset form when dialog opens/closes or entityClass changes
  useEffect(() => {
    if (open) {
      setCurrentStep(0);
      setFormData({
        '@bean': 'com.cyoda.core.model.index.dto.IndexParametersDefDto',
        entityClass: entityClass,
        name: '',
        rangeColPath: '',
        columns: [],
      });
      setConfigDefinition({
        requestClass: entityClass,
        colDefs: [],
      });
      setConfigDefinitionColRanges([]);
      form.resetFields();
    }
  }, [open, entityClass, form]);

  // Update formData when range columns change
  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      rangeColPath: configDefinitionColRanges.length > 0 ? configDefinitionColRanges[0].fullPath : '',
    }));
  }, [configDefinitionColRanges]);

  // Update formData when columns change
  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      columns: configDefinition.colDefs?.map((el: ColDef) => el.fullPath) || [],
    }));
  }, [configDefinition.colDefs]);

  const handleNext = async () => {
    const stepName = steps[currentStep];

    // Validation for each step
    if (stepName === 'Name') {
      try {
        await form.validateFields(['name']);
        const name = form.getFieldValue('name');
        setFormData((prev) => ({ ...prev, name }));
        setCurrentStep(currentStep + 1);
      } catch (error) {
        // Form validation will show error
      }
    } else if (stepName === 'Range Field') {
      if (!formData.rangeColPath) {
        message.error('Please select rangeColPath');
        return;
      }
      setCurrentStep(currentStep + 1);
    } else if (stepName === 'None Range Fields') {
      if (formData.columns.length === 0) {
        message.error('Please select columns');
        return;
      }
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrev = () => {
    setCurrentStep(currentStep - 1);
  };

  const handleAdd = () => {
    if (formData.columns.length === 0) {
      message.error('Please select columns');
      return;
    }
    onCreate(formData);
  };

  const handleCancel = () => {
    onCancel();
  };

  const handleRangeChange = (ranges: ColDef[]) => {
    setConfigDefinitionColRanges(ranges);
  };

  const handleConfigDefinitionChange = (updates: any) => {
    setConfigDefinition((prev: any) => ({
      ...prev,
      ...updates,
    }));
  };

  return (
    <Modal
      title="Create New Composite Indexes"
      open={open}
      onCancel={handleCancel}
      width="90%"
      confirmLoading={loading}
      footer={
        <Space>
          <Button onClick={handleCancel}>Cancel</Button>
          <Button disabled={currentStep === 0} onClick={handlePrev}>
            Previous step
          </Button>
          <Button disabled={currentStep === steps.length - 1} onClick={handleNext}>
            Next step
          </Button>
          <Button
            type="primary"
            disabled={formData.columns.length === 0}
            onClick={handleAdd}
            loading={loading}
          >
            Add
          </Button>
        </Space>
      }
    >
      <Steps current={currentStep} style={{ marginBottom: 24 }}>
        {steps.map((step) => (
          <Steps.Step key={step} title={step} />
        ))}
      </Steps>

      <Form form={form} layout="vertical">
        {steps[currentStep] === 'Name' && (
          <Form.Item
            label="Name"
            name="name"
            rules={[{ required: true, message: 'Please enter name' }]}
            initialValue={formData.name}
          >
            <Input placeholder="Enter composite index name" />
          </Form.Item>
        )}

        {steps[currentStep] === 'Range Field' && (
          <div>
            <ModellingRangeDefs
              configDefinition={configDefinition}
              configDefinitionColRanges={configDefinitionColRanges}
              onChange={handleRangeChange}
            />
          </div>
        )}

        {steps[currentStep] === 'None Range Fields' && (
          <div>
            <ModellingColDefs
              configDefinition={configDefinition}
              onChange={handleConfigDefinitionChange}
            />
          </div>
        )}
      </Form>
    </Modal>
  );
};

export default CompositeIndexCreateDialog;


/**
 * CreateReportDialog Component
 * Migrated from: .old_project/packages/http-api/src/views/ConfigEditor/popup/ConfigEditorNew.vue
 */

import React, { useState, useEffect, useImperativeHandle, forwardRef, useMemo } from 'react';
import { Modal, Steps, Form, Input, Select, Button, message } from 'antd';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { HelperStorage } from '@cyoda/ui-lib-react';
import './CreateReportDialog.scss';

const { Step } = Steps;
const { TextArea } = Input;

export interface CreateReportDialogRef {
  open: () => void;
  close: () => void;
}

interface CreateReportDialogProps {
  title?: string;
  hideFields?: {
    name?: boolean;
    description?: boolean;
    requestClass?: boolean;
  };
  onConfirm: (formData: CreateReportFormData) => void | Promise<void>;
}

export interface CreateReportFormData {
  name: string;
  description: string;
  requestClass: string;
}

interface EntityOption {
  value: string;
  label: string;
  type?: string;
}

const ENTITY_TYPE_KEY = 'ConfigEditorNew:entityType';

const CreateReportDialog = forwardRef<CreateReportDialogRef, CreateReportDialogProps>(
  ({ title = 'Create New Report Definition', hideFields = {}, onConfirm }, ref) => {
    const storage = useMemo(() => new HelperStorage(), []);
    const [visible, setVisible] = useState(false);
    const [loading, setLoading] = useState(false);
    const [currentStep, setCurrentStep] = useState(0);
    const [form] = Form.useForm();
    const [entityType, setEntityType] = useState<string>(
      storage.get(ENTITY_TYPE_KEY, 'BUSINESS') || 'BUSINESS'
    );

    // Load entity types
    const { data: entityData = [] } = useQuery({
      queryKey: ['reportingTypes'],
      queryFn: async () => {
        try {
          const { data } = await axios.get('/platform-api/reporting/types/fetch?withModels=true');
          return data || [];
        } catch (error) {
          console.error('Failed to load entity types:', error);
          return [];
        }
      },
    });

    // Filter entity options based on entity type
    const entityOptions = useMemo((): EntityOption[] => {
      if (!entityData || !Array.isArray(entityData) || entityData.length === 0) return [];

      return entityData
        .filter((entity: any) => {
          if (entityType === 'ALL') return true;
          return entity.type === entityType;
        })
        .map((entity: any) => ({
          value: entity.name,
          label: entity.label || entity.name,
          type: entity.type,
        }))
        .sort((a: { label: string }, b: { label: string }) => a.label.localeCompare(b.label));
    }, [entityData, entityType]);

    // Expose methods to parent
    useImperativeHandle(ref, () => ({
      open: () => {
        setVisible(true);
        setCurrentStep(0);
        form.resetFields();
      },
      close: () => {
        setVisible(false);
      },
    }));

    // Handle form submission
    const handleConfirm = async () => {
      try {
        const values = await form.validateFields();
        
        if (!values.requestClass) {
          message.error('Please select an entity class');
          return;
        }

        setLoading(true);
        await onConfirm(values);
        setVisible(false);
        form.resetFields();
        setCurrentStep(0);
      } catch (error: any) {
        if (error.errorFields) {
          // Form validation error
          message.error('Please fill in all required fields');
        } else {
          console.error('Failed to create report:', error);
          message.error(error.message || 'Failed to create report');
        }
      } finally {
        setLoading(false);
      }
    };

    // Handle next step
    const handleNext = async () => {
      try {
        if (currentStep === 0) {
          await form.validateFields(['name', 'description']);
          setCurrentStep(1);
        }
      } catch (error) {
        message.error('Please fill in all required fields');
      }
    };

    // Handle previous step
    const handlePrev = () => {
      setCurrentStep(currentStep - 1);
    };

    // Handle name input change (replace / with -)
    const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value.replace(/\//g, '-');
      form.setFieldValue('name', value);
    };

    // Save entity type to storage
    useEffect(() => {
      storage.set(ENTITY_TYPE_KEY, entityType);
    }, [entityType, storage]);

    return (
      <Modal
        title={title}
        open={visible}
        onCancel={() => setVisible(false)}
        width="80%"
        maskClosable={false}
        footer={[
          <Button key="prev" disabled={currentStep === 0} onClick={handlePrev}>
            Previous step
          </Button>,
          <Button key="next" disabled={currentStep === 1} onClick={handleNext}>
            Next step
          </Button>,
          <Button key="cancel" onClick={() => setVisible(false)}>
            Cancel
          </Button>,
          <Button
            key="confirm"
            type="primary"
            loading={loading}
            onClick={handleConfirm}
          >
            Confirm
          </Button>,
        ]}
      >
        <div className="create-report-dialog">
          <Steps current={currentStep} style={{ marginBottom: 24 }}>
            <Step title="Step 1" description="Please Enter Name and Description" />
            <Step title="Step 2" description="Please Select Class" />
          </Steps>

          <Form
            form={form}
            layout="horizontal"
            labelCol={{ span: 6 }}
            wrapperCol={{ span: 18 }}
            className="create-report-form"
          >
            <div style={{ display: currentStep === 0 ? 'block' : 'none' }}>
              <Form.Item
                label="Name"
                name="name"
                rules={[{ required: true, message: 'Please input Name' }]}
              >
                <Input onChange={handleNameChange} placeholder="Enter report name" />
              </Form.Item>

              {hideFields.description !== false && (
                <Form.Item
                  label="Description"
                  name="description"
                  rules={[{ required: true, message: 'Please input Description' }]}
                >
                  <TextArea rows={4} placeholder="Enter report description" />
                </Form.Item>
              )}
            </div>

            <div style={{ display: currentStep === 1 ? 'block' : 'none' }}>
                <Form.Item label="Entity Type" style={{ marginBottom: 16 }}>
                  <Select
                    value={entityType}
                    onChange={setEntityType}
                    options={[
                      { value: 'BUSINESS', label: 'Business' },
                      { value: 'TECHNICAL', label: 'Technical' },
                      { value: 'ALL', label: 'All' },
                    ]}
                  />
                </Form.Item>

                <Form.Item
                  label="Entity Class"
                  name="requestClass"
                  rules={[{ required: true, message: 'Please select Entity Class' }]}
                >
                  <Select
                    showSearch
                    placeholder="Select Entity Class"
                    filterOption={(input, option) =>
                      (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                    }
                    options={entityOptions}
                  />
                </Form.Item>
            </div>
          </Form>
        </div>
      </Modal>
    );
  }
);

CreateReportDialog.displayName = 'CreateReportDialog';

export default CreateReportDialog;


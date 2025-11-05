/**
 * CreateReportDialog Component
 * Migrated from: .old_project/packages/http-api/src/views/ConfigEditor/popup/ConfigEditorNew.vue
 */

import React, { useState, useImperativeHandle, forwardRef, useMemo } from 'react';
import { Modal, Steps, Form, Input, Select, Button, message } from 'antd';
import { useQuery } from '@tanstack/react-query';
import { getReportingFetchTypes } from '@cyoda/http-api-react/api/entities';
import { useGlobalUiSettingsStore } from '@cyoda/http-api-react/stores/globalUiSettingsStore';
import HelperEntities from '@cyoda/http-api-react/utils/HelperEntities';
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
  onConfirm?: (formData: CreateReportFormData) => void | Promise<void>;
  onCreate?: (formData: CreateReportFormData) => void | Promise<void>;
  visible?: boolean;
  onCancel?: () => void;
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

const CreateReportDialog = forwardRef<CreateReportDialogRef, CreateReportDialogProps>(
  ({
    title = 'Create New Report Definition',
    hideFields = {},
    onConfirm,
    onCreate,
    visible: visibleProp,
    onCancel
  }, ref) => {
    const [visibleState, setVisibleState] = useState(false);
    const [loading, setLoading] = useState(false);
    const [currentStep, setCurrentStep] = useState(0);
    const [form] = Form.useForm();

    // Get entity type from global store (like the Vue version)
    const { entityType } = useGlobalUiSettingsStore();

    // Support both controlled (via props) and uncontrolled (via ref) modes
    const visible = visibleProp !== undefined ? visibleProp : visibleState;
    const setVisible = (value: boolean) => {
      if (visibleProp !== undefined) {
        // Controlled mode - call onCancel
        if (!value && onCancel) {
          onCancel();
        }
      } else {
        // Uncontrolled mode - update internal state
        setVisibleState(value);
      }
    };

    // Load entity types using the API function (like Vue version)
    const { data: entityData = [] } = useQuery({
      queryKey: ['reportingTypes'],
      queryFn: async () => {
        try {
          const { data } = await getReportingFetchTypes(true);
          console.log('Entity types loaded:', data);
          return data || [];
        } catch (error) {
          console.error('Failed to load entity types:', error);
          return [];
        }
      },
    });

    // Filter entity options based on entity type using HelperEntities (like Vue version)
    const entityOptions = useMemo((): EntityOption[] => {
      console.log('Filtering entity options:', { entityData, entityType });
      if (!entityData || !Array.isArray(entityData) || entityData.length === 0) {
        console.log('No entity data available');
        return [];
      }

      // Use HelperEntities.getOptionsFromData to filter and format options
      const options = HelperEntities.getOptionsFromData(entityData, entityType);
      console.log('Filtered options:', options);
      return options;
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

        // Support both onConfirm and onCreate callbacks
        const callback = onConfirm || onCreate;
        if (callback) {
          await callback(values);
        }

        setVisible(false);
        form.resetFields();
        setCurrentStep(0);
      } catch (error: any) {
        if (error.errorFields) {
          // Form validation error
          message.error('Please fill in all required fields');
        } else {
          console.error('Failed to create report:', error);
          // Don't show error message here - let the parent handle it
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
      // Use setFieldsValue instead of setFieldValue to avoid circular reference warning
      form.setFieldsValue({ name: value });
    };

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
                    popupClassName="create-report-dialog-dropdown"
                    dropdownStyle={{ minWidth: '400px' }}
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


/**
 * Mapper Parameters Dialog Component
 * Migrated from: .old_project/packages/http-api/src/views/ConfigEditor/tabs/CyodaModelling/CyodaModellingAlias/CyodaModellingPopUpAliasMappersParameters.vue
 * 
 * Dialog for adding/editing mapper parameters with name, type, and value fields
 */

import React, { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import { Modal, Form, Input, Select } from 'antd';
import type { NamedParameter } from '@cyoda/http-api-react';
import './MapperParametersDialog.scss';

export interface MapperParametersDialogProps {
  onAdd: (parameter: NamedParameter) => void;
  onUpdate: (parameter: NamedParameter) => void;
}

export interface MapperParametersDialogRef {
  open: (parameter?: NamedParameter) => void;
  close: () => void;
}

const PARAMETER_TYPES = [
  'java.lang.Integer',
  'java.lang.Double',
  'java.lang.String',
];

export const MapperParametersDialog = forwardRef<MapperParametersDialogRef, MapperParametersDialogProps>(
  ({ onAdd, onUpdate }, ref) => {
    const [visible, setVisible] = useState(false);
    const [form] = Form.useForm();
    const [editParameter, setEditParameter] = useState<NamedParameter | null>(null);

    useImperativeHandle(ref, () => ({
      open: (parameter?: NamedParameter) => {
        setVisible(true);
        setEditParameter(parameter || null);
        
        if (parameter) {
          // Edit mode
          form.setFieldsValue({
            name: parameter.name,
            value: parameter.value,
            parameterType: parameter.parameterType,
          });
        } else {
          // Create mode
          form.resetFields();
        }
      },
      close: () => setVisible(false),
    }));

    const handleOk = async () => {
      try {
        const values = await form.validateFields();
        
        const parameter: NamedParameter = {
          '@bean': 'com.cyoda.core.namedparameters.NamedParameter',
          name: values.name,
          value: values.value,
          parameterType: values.parameterType,
        };

        if (editParameter) {
          // Update mode - preserve old name for replacement
          parameter.oldName = editParameter.name;
          onUpdate(parameter);
        } else {
          // Add mode
          onAdd(parameter);
        }

        setVisible(false);
        form.resetFields();
      } catch (error) {
        // Validation failed
      }
    };

    const handleCancel = () => {
      setVisible(false);
      form.resetFields();
    };

    return (
      <Modal
        title="Mapper Parameter"
        open={visible}
        onOk={handleOk}
        onCancel={handleCancel}
        width={700}
        className="mapper-parameters-dialog"
      >
        <Form
          form={form}
          layout="vertical"
          style={{ marginTop: 16 }}
        >
          <Form.Item
            label="Name"
            name="name"
            rules={[{ required: true, message: 'Please input name' }]}
          >
            <Input placeholder="Enter parameter name" />
          </Form.Item>

          <Form.Item
            label="Parameter Type"
            name="parameterType"
            rules={[{ required: true, message: 'Please select parameter type' }]}
          >
            <Select placeholder="Select parameter type">
              {PARAMETER_TYPES.map((type) => (
                <Select.Option key={type} value={type}>
                  {type.split('.').pop()}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            label="Value"
            name="value"
            rules={[{ required: true, message: 'Please input value' }]}
          >
            <Input placeholder="Enter parameter value" />
          </Form.Item>
        </Form>
      </Modal>
    );
  }
);

MapperParametersDialog.displayName = 'MapperParametersDialog';

export default MapperParametersDialog;


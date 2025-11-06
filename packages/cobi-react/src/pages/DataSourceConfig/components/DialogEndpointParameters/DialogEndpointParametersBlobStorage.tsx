import React, { forwardRef, useImperativeHandle, useState, useEffect } from 'react';
import { Modal, Form, Input, Switch } from 'antd';

interface BlobStorageParameter {
  name: string;
  required: boolean;
  defaultValue: string;
  secure: boolean;
  template: boolean;
  templateValue: string;
}

interface DialogEndpointParametersBlobStorageProps {
  parameters: BlobStorageParameter[];
  onChange?: (parameters: BlobStorageParameter[]) => void;
}

export interface DialogEndpointParametersBlobStorageRef {
  openDialogAndCreateNew: () => void;
  openDialogAndEditRecord: (data: BlobStorageParameter) => void;
}

const defaultParameter: BlobStorageParameter = {
  name: '',
  required: false,
  defaultValue: '',
  secure: false,
  template: false,
  templateValue: '',
};

const DialogEndpointParametersBlobStorage = forwardRef<
  DialogEndpointParametersBlobStorageRef,
  DialogEndpointParametersBlobStorageProps
>((props, ref) => {
  const { parameters, onChange } = props;
  const [form] = Form.useForm();
  const [dialogVisible, setDialogVisible] = useState(false);
  const [editingParameter, setEditingParameter] = useState<BlobStorageParameter | null>(null);
  const [isTemplate, setIsTemplate] = useState(false);

  useImperativeHandle(ref, () => ({
    openDialogAndCreateNew: () => {
      setEditingParameter(null);
      form.resetFields();
      form.setFieldsValue(defaultParameter);
      setIsTemplate(false);
      setDialogVisible(true);
    },
    openDialogAndEditRecord: (data: BlobStorageParameter) => {
      setEditingParameter(data);
      form.setFieldsValue(data);
      setIsTemplate(data.template || false);
      setDialogVisible(true);
    },
  }));

  const handleOk = async () => {
    try {
      const values = await form.validateFields();

      if (!onChange) return;

      if (editingParameter) {
        // Edit existing parameter
        const index = parameters.indexOf(editingParameter);
        if (index > -1) {
          const newParams = [...parameters];
          newParams[index] = values;
          onChange(newParams);
        }
      } else {
        // Add new parameter
        onChange([...parameters, values]);
      }

      setDialogVisible(false);
    } catch (error) {
      console.error('Validation failed:', error);
    }
  };

  return (
    <Modal
      title="Endpoint Parameters"
      open={dialogVisible}
      onCancel={() => setDialogVisible(false)}
      onOk={handleOk}
      okText={editingParameter ? 'Edit' : 'Apply'}
      width="90%"
      destroyOnClose
    >
      <Form form={form} layout="horizontal" labelCol={{ span: 6 }}>
        <Form.Item label="Required" name="required" valuePropName="checked">
          <Switch />
        </Form.Item>

        <Form.Item label="Secure" name="secure" valuePropName="checked">
          <Switch />
        </Form.Item>

        <Form.Item label="Template" name="template" valuePropName="checked">
          <Switch onChange={(checked) => setIsTemplate(checked)} />
        </Form.Item>

        <Form.Item
          label="Name"
          name="name"
          rules={[{ required: true, message: 'Please input name' }]}
        >
          <Input placeholder="Enter parameter name" />
        </Form.Item>

        <Form.Item
          label="Default Value"
          name="defaultValue"
          dependencies={['required']}
          rules={[
            ({ getFieldValue }) => ({
              required: !getFieldValue('required'),
              message: 'Please input Default Value',
            }),
          ]}
        >
          <Input placeholder="Enter default value" />
        </Form.Item>

        {isTemplate && (
          <Form.Item
            label="Template Value"
            name="templateValue"
            rules={[{ required: true, message: 'Please input Template Value' }]}
          >
            <Input placeholder="Enter template value" />
          </Form.Item>
        )}
      </Form>
    </Modal>
  );
});

DialogEndpointParametersBlobStorage.displayName = 'DialogEndpointParametersBlobStorage';

export default DialogEndpointParametersBlobStorage;


import React, { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import { Modal, Form, Input } from 'antd';

export interface VariableDialogRef {
  open: () => void;
}

interface VariableDialogProps {
  onAdd: (name: string) => void;
}

const VariableDialog = forwardRef<VariableDialogRef, VariableDialogProps>(({ onAdd }, ref) => {
  const [visible, setVisible] = useState(false);
  const [form] = Form.useForm();

  useImperativeHandle(ref, () => ({
    open: () => {
      setVisible(true);
    },
  }));

  useEffect(() => {
    if (visible) {
      form.resetFields();
    }
  }, [visible, form]);

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      onAdd(values.name);
      setVisible(false);
    } catch (error) {
      console.error('Validation failed:', error);
    }
  };

  const handleCancel = () => {
    setVisible(false);
  };

  return (
    <Modal
      title="Add New Variable"
      open={visible}
      onOk={handleOk}
      onCancel={handleCancel}
      okText="Add"
      cancelText="Cancel"
      width={400}
      maskClosable={false}
    >
      <Form form={form} layout="vertical">
        <Form.Item
          label="Variable Name"
          name="name"
          rules={[{ required: true, message: 'Please input variable name!' }]}
        >
          <Input placeholder="Enter variable name" />
        </Form.Item>
      </Form>
    </Modal>
  );
});

VariableDialog.displayName = 'VariableDialog';

export default VariableDialog;


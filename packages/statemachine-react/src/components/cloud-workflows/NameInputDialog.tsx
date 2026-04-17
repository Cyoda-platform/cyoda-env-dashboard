/**
 * NameInputDialog — reusable name-input modal for Duplicate and Rename flows.
 *
 * Receives `existingNames` to enforce uniqueness client-side. Submits the
 * entered name via `onSubmit`. The page wires this to `useCopyWorkflow` (for
 * Duplicate) or `useRenameWorkflow` (for Rename).
 */

import React, { useEffect } from 'react';
import { Modal, Form, Input } from 'antd';

export interface NameInputDialogProps {
  open: boolean;
  title: string;
  existingNames: string[];
  initialValue?: string;
  onSubmit: (newName: string) => void;
  onCancel: () => void;
}

export const NameInputDialog: React.FC<NameInputDialogProps> = ({
  open,
  title,
  existingNames,
  initialValue,
  onSubmit,
  onCancel,
}) => {
  const [form] = Form.useForm<{ name: string }>();

  // Reset the form whenever the dialog opens.
  useEffect(() => {
    if (open) {
      form.resetFields();
      form.setFieldsValue({ name: initialValue ?? '' });
    }
  }, [open, initialValue, form]);

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      onSubmit(values.name.trim());
    } catch {
      // form validation errors are surfaced inline by Ant Design.
    }
  };

  return (
    <Modal title={title} open={open} onOk={handleOk} onCancel={onCancel} destroyOnClose>
      <Form form={form} layout="vertical">
        <Form.Item
          name="name"
          label="New name"
          rules={[
            {
              validator: (_rule, value: string) => {
                const trimmed = (value ?? '').trim();
                if (!trimmed) return Promise.reject(new Error('Name is required'));
                if (existingNames.includes(trimmed)) {
                  return Promise.reject(new Error(`A workflow named "${trimmed}" already exists`));
                }
                return Promise.resolve();
              },
            },
          ]}
        >
          <Input autoFocus aria-label="new name" />
        </Form.Item>
      </Form>
    </Modal>
  );
};

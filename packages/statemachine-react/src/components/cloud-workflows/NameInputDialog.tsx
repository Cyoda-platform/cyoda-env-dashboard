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
  /**
   * Optional helper text rendered above the form. Used by callers to
   * distinguish Duplicate ("Enter the new name for the copy") from Rename
   * ("Enter the new name for this workflow").
   */
  description?: string;
  /**
   * If set, this name is excluded from the uniqueness check. Used by the
   * Rename flow to allow keeping the same name (e.g., the user opens Rename
   * but doesn't change anything) without rejecting the existing name as a
   * conflict against itself.
   */
  allowedValue?: string;
  /** When true, the OK button shows a spinner and is disabled. Wire to a mutation's isPending. */
  confirmLoading?: boolean;
  onSubmit: (newName: string) => void;
  onCancel: () => void;
}

export const NameInputDialog: React.FC<NameInputDialogProps> = ({
  open,
  title,
  existingNames,
  initialValue,
  description,
  allowedValue,
  confirmLoading,
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
    <Modal
      title={title}
      open={open}
      onOk={handleOk}
      onCancel={onCancel}
      confirmLoading={confirmLoading}
      destroyOnHidden
    >
      {description && <p style={{ marginBottom: 16 }}>{description}</p>}
      <Form form={form} layout="vertical">
        <Form.Item
          name="name"
          label="New name"
          rules={[
            {
              validator: (_rule, value: string) => {
                const trimmed = (value ?? '').trim();
                if (!trimmed) return Promise.reject(new Error('Name is required'));
                // Allow the caller-specified value through (Rename uses this so
                // the workflow's current name doesn't conflict with itself).
                if (trimmed === allowedValue) return Promise.resolve();
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

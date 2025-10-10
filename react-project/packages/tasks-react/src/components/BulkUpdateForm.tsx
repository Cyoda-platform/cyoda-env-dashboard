/**
 * BulkUpdateForm Component
 * Form for bulk updating multiple tasks
 * Migrated from: .old_project/packages/tasks/src/views/tasks/index/BulkUpdateForm.vue
 */

import React, { useState } from 'react';
import { Form, Select, Button, Modal, message } from 'antd';
import { HelperDictionary } from '@cyoda/ui-lib-react';
import { useUpdateTask } from '../hooks/useTasks';
import type { TableRow } from '../types';

const { Option } = Select;

interface BulkUpdateFormProps {
  multipleSelection: TableRow[];
  onUpdated: () => void;
}

export const BulkUpdateForm: React.FC<BulkUpdateFormProps> = ({
  multipleSelection,
  onUpdated,
}) => {
  const [form] = Form.useForm();
  const [isLoading, setIsLoading] = useState(false);
  const updateTaskMutation = useUpdateTask();

  const optionsAssignee = HelperDictionary.users || [];
  const optionsPriority = HelperDictionary.priorities || [];

  const handleSubmit = () => {
    const values = form.getFieldsValue();

    // Check if at least one field is filled
    if (!values.priority && !values.assignee) {
      message.warning('Please select at least one field to update');
      return;
    }

    Modal.confirm({
      title: 'Confirm',
      content: `Do you really want to update ${multipleSelection.length} task(s)?`,
      onOk: async () => {
        setIsLoading(true);
        try {
          // Update all selected tasks
          await Promise.all(
            multipleSelection.map((row) => {
              const updatedTask = { ...row.task };

              // Apply updates
              if (values.priority) {
                updatedTask.priority = values.priority;
              }
              if (values.assignee) {
                updatedTask.assignee = values.assignee;
              }

              return updateTaskMutation.mutateAsync({
                transition: 'AMEND',
                task: updatedTask,
              });
            })
          );

          message.success('Bulk updates completed successfully!');
          form.resetFields();
          onUpdated();
        } catch (error) {
          message.error('Failed to update tasks');
          console.error('Bulk update error:', error);
        } finally {
          setIsLoading(false);
        }
      },
    });
  };

  return (
    <div className="bulk-update-form" style={{ marginTop: 15 }}>
      <Form form={form} layout="inline">
        <Form.Item label="Priority" name="priority">
          <Select
            placeholder="-- Select --"
            allowClear
            disabled={isLoading}
            style={{ width: 220 }}
          >
            {optionsPriority.map((item: any) => (
              <Option key={item.key} value={item.key}>
                {item.value}
              </Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item label="Assigned To" name="assignee">
          <Select
            placeholder="-- Select --"
            allowClear
            disabled={isLoading}
            style={{ width: 220 }}
          >
            {optionsAssignee.map((item: any) => (
              <Option key={item.name} value={item.name}>
                {item.name}
              </Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item>
          <Button type="primary" onClick={handleSubmit} loading={isLoading}>
            Submit
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};


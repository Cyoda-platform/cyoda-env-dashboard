/**
 * BulkUpdateForm Component
 * Form for bulk updating multiple tasks
 * Migrated from: .old_project/packages/tasks/src/views/tasks/index/BulkUpdateForm.vue
 */

import React, { useState, memo, useCallback, useMemo } from 'react';
import { Form, Select, Button, Modal, message, Alert } from 'antd';
import { HelperDictionary } from '@cyoda/ui-lib-react';
import { useUpdateTask } from '../hooks/useTasks';
import { useErrorHandler } from '../hooks/useErrorHandler';
import type { TableRow } from '../types';

const { Option } = Select;

interface BulkUpdateFormProps {
  multipleSelection: TableRow[];
  onUpdated: () => void;
}

export const BulkUpdateForm: React.FC<BulkUpdateFormProps> = memo(({
  multipleSelection,
  onUpdated,
}) => {
  const [form] = Form.useForm();
  const [isLoading, setIsLoading] = useState(false);
  const [failedTasks, setFailedTasks] = useState<string[]>([]);
  const updateTaskMutation = useUpdateTask();
  const { handleError } = useErrorHandler();

  // Memoize options to prevent re-creating on every render
  const optionsAssignee = useMemo(() => HelperDictionary.users || [], []);
  const optionsPriority = useMemo(() => HelperDictionary.priorities || [], []);

  const handleSubmit = useCallback(() => {
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
        setFailedTasks([]);
        const failed: string[] = [];
        let successCount = 0;

        try {
          // Update all selected tasks with individual error handling
          const results = await Promise.allSettled(
            multipleSelection.map(async (row) => {
              const updatedTask = { ...row.task };

              // Apply updates
              if (values.priority) {
                // Convert string priority to number
                updatedTask.priority = typeof values.priority === 'string'
                  ? parseInt(values.priority, 10)
                  : values.priority;
              }
              if (values.assignee) {
                updatedTask.assignee = values.assignee;
              }

              try {
                await updateTaskMutation.mutateAsync({
                  transition: 'AMEND',
                  task: updatedTask,
                });
                return { success: true, taskId: row.id };
              } catch (error) {
                handleError(error, `updating task ${row.title}`);
                return { success: false, taskId: row.id, title: row.title };
              }
            })
          );

          // Count successes and failures
          results.forEach((result) => {
            if (result.status === 'fulfilled' && result.value.success) {
              successCount++;
            } else if (result.status === 'fulfilled' && !result.value.success) {
              failed.push(result.value.title || result.value.taskId);
            }
          });

          setFailedTasks(failed);

          if (failed.length === 0) {
            message.success(`Successfully updated ${successCount} task(s)!`);
            form.resetFields();
            onUpdated();
          } else if (successCount > 0) {
            message.warning(
              `Updated ${successCount} task(s), but ${failed.length} failed. See details below.`
            );
            // Don't reset form or call onUpdated to allow retry
          } else {
            message.error('All bulk updates failed. Please try again.');
          }
        } catch (error) {
          handleError(error, 'bulk update');
        } finally {
          setIsLoading(false);
        }
      },
    });
  }, [form, multipleSelection, updateTaskMutation, onUpdated, handleError]);

  return (
    <div className="bulk-update-form" style={{ marginTop: 15 }}>
      {failedTasks.length > 0 && (
        <Alert
          message="Some Updates Failed"
          description={
            <div>
              <p>The following tasks could not be updated:</p>
              <ul>
                {failedTasks.map((task, index) => (
                  <li key={index}>{task}</li>
                ))}
              </ul>
              <p>Please try again or contact support if the problem persists.</p>
            </div>
          }
          type="error"
          closable
          onClose={() => setFailedTasks([])}
          style={{ marginBottom: 16 }}
        />
      )}

      <Form form={form} layout="inline" aria-label="Bulk update form">
        <Form.Item label="Priority" name="priority">
          <Select
            placeholder="-- Select --"
            allowClear
            disabled={isLoading}
            style={{ width: 220 }}
            aria-label="Select priority for bulk update"
            aria-describedby="bulk-priority-description"
          >
            {optionsPriority.map((item: any) => (
              <Option key={item.key} value={item.key}>
                {item.value}
              </Option>
            ))}
          </Select>
        </Form.Item>
        <span id="bulk-priority-description" className="sr-only">
          Update priority for {multipleSelection.length} selected task(s)
        </span>

        <Form.Item label="Assigned To" name="assignee">
          <Select
            placeholder="-- Select --"
            allowClear
            disabled={isLoading}
            style={{ width: 220 }}
            aria-label="Select assignee for bulk update"
            aria-describedby="bulk-assignee-description"
          >
            {optionsAssignee.map((item: any) => (
              <Option key={item.name} value={item.name}>
                {item.name}
              </Option>
            ))}
          </Select>
        </Form.Item>
        <span id="bulk-assignee-description" className="sr-only">
          Update assignee for {multipleSelection.length} selected task(s)
        </span>

        <Form.Item>
          <Button
            type="primary"
            onClick={handleSubmit}
            loading={isLoading}
            aria-label={`Submit bulk update for ${multipleSelection.length} task(s)`}
            aria-busy={isLoading}
          >
            Submit
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
});
BulkUpdateForm.displayName = 'BulkUpdateForm';


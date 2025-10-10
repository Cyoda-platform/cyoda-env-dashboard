/**
 * TaskDetail Page
 * Task detail view with edit functionality
 * Migrated from: .old_project/packages/tasks/src/views/tasks/detail/TasksDetail.vue
 */

import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Form, Input, Select, Button, Space, Spin, message, Modal } from 'antd';
import { ArrowLeftOutlined, EditOutlined, SaveOutlined, CloseOutlined } from '@ant-design/icons';
import { useTask, useUpdateTask, useTasksState } from '../hooks/useTasks';
import { HelperFormat } from '@cyoda/ui-lib-react';
import type { Task } from '../types';

const { Option } = Select;
const { TextArea } = Input;

export const TaskDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [isEdit, setIsEdit] = useState(false);
  const { addReadedId } = useTasksState();

  // Fetch task data
  const { data, isLoading } = useTask(id!, {
    enabled: !!id,
  });

  // Update task mutation
  const updateTaskMutation = useUpdateTask({
    onSuccess: () => {
      message.success('Task was updated');
      navigate('/tasks');
    },
    onError: (error) => {
      message.error(`Failed to update task: ${error.message}`);
    },
  });

  // Load task data into form
  useEffect(() => {
    if (data?.alertTask) {
      form.setFieldsValue({
        task: data.alertTask,
        transition: '',
      });
      addReadedId(data.alertTask.id);
    }
  }, [data, form, addReadedId]);

  const handleBack = () => {
    navigate('/tasks');
  };

  const handleEdit = () => {
    setIsEdit(true);
  };

  const handleCancel = () => {
    setIsEdit(false);
    if (data?.alertTask) {
      form.setFieldsValue({
        task: data.alertTask,
        transition: '',
      });
    }
  };

  const handleUpdate = () => {
    form.validateFields().then((values) => {
      Modal.confirm({
        title: 'Confirm',
        content: 'Do you really want to update task?',
        onOk: () => {
          setIsEdit(false);
          updateTaskMutation.mutate({
            transition: values.transition,
            task: values.task,
          });
        },
      });
    });
  };

  if (isLoading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!data?.alertTask) {
    return (
      <Card>
        <p>Task not found</p>
        <Button onClick={handleBack}>Back to Tasks</Button>
      </Card>
    );
  }

  const task = data.alertTask;
  const transitions = data.transitions || [];

  return (
    <div>
      <Card
        title={
          <Space>
            <Button icon={<ArrowLeftOutlined />} onClick={handleBack}>
              Back
            </Button>
            <span>Task Detail: {task.title}</span>
          </Space>
        }
        extra={
          <Space>
            {!isEdit ? (
              <Button type="primary" icon={<EditOutlined />} onClick={handleEdit}>
                Edit
              </Button>
            ) : (
              <>
                <Button icon={<CloseOutlined />} onClick={handleCancel}>
                  Cancel
                </Button>
                <Button
                  type="primary"
                  icon={<SaveOutlined />}
                  onClick={handleUpdate}
                  loading={updateTaskMutation.isPending}
                >
                  Update
                </Button>
              </>
            )}
          </Space>
        }
      >
        <Form form={form} layout="vertical" disabled={!isEdit}>
          <Form.Item label="Transition" name="transition">
            <Select placeholder="Select transition" disabled={!isEdit}>
              {transitions.map((transition: string) => (
                <Option key={transition} value={transition}>
                  {transition}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item label="Title" name={['task', 'title']}>
            <Input />
          </Form.Item>

          <Form.Item label="Status" name={['task', 'state']}>
            <Input disabled />
          </Form.Item>

          <Form.Item label="Priority" name={['task', 'priority']}>
            <Input type="number" />
          </Form.Item>

          <Form.Item label="Assignee" name={['task', 'assignee']}>
            <Input />
          </Form.Item>

          <Form.Item label="Message" name={['task', 'message']}>
            <TextArea rows={4} />
          </Form.Item>

          <Form.Item label="Created">
            <Input value={HelperFormat.date(task.createdDatetime)} disabled />
          </Form.Item>

          <Form.Item label="Last Modified">
            <Input value={HelperFormat.date(task.lastModifiedDatetime)} disabled />
          </Form.Item>

          <Form.Item label="Source Entity Class" name={['task', 'srcEntityClass']}>
            <Input disabled />
          </Form.Item>

          <Form.Item label="Source Entity ID" name={['task', 'srcEntityId']}>
            <Input disabled />
          </Form.Item>
        </Form>

        {/* TODO: Add AdaptableBlotterEntity component for entity details */}
      </Card>
    </div>
  );
};


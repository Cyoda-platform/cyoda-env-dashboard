/**
 * TaskDetail Page
 * Task detail view with edit functionality
 * Migrated from: .old_project/packages/tasks/src/views/tasks/detail/TasksDetail.vue
 */

import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Form, Input, Select, Button, Space, Spin, message, Modal, Row, Col, Divider, Alert } from 'antd';
import { ArrowLeftOutlined, EditOutlined, SaveOutlined, CloseOutlined, SearchOutlined, InfoCircleOutlined } from '@ant-design/icons';
import { useTask, useUpdateTask, useTasksState } from '../hooks/useTasks';
import { HelperFormat, EntityDetailModal } from '@cyoda/ui-lib-react';
import { HelperEntities } from '@cyoda/http-api-react';
import { useErrorHandler } from '../hooks/useErrorHandler';
import { TaskDetailSkeleton } from '../components/TaskDetailSkeleton';
import type { Task } from '../types';

const { Option } = Select;
const { TextArea } = Input;

export const TaskDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [isEdit, setIsEdit] = useState(false);
  const [showEntityModal, setShowEntityModal] = useState(false);
  const { addReadedId } = useTasksState();
  const { handleError } = useErrorHandler();

  // Fetch task data
  const { data, isLoading, error: fetchError } = useTask(id!, {
    enabled: !!id,
  });

  // Update task mutation
  const updateTaskMutation = useUpdateTask({
    onSuccess: () => {
      message.success('Task was updated');
      navigate('/tasks');
    },
    onError: (error) => {
      handleError(error, 'updating task');
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
      // Validate transition is selected
      if (!values.transition) {
        message.error('Please select a transition before updating the task');
        return;
      }

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
    }).catch((errorInfo) => {
      console.error('Validation failed:', errorInfo);
      message.error('Please fill in all required fields');
    });
  };

  if (isLoading) {
    return <TaskDetailSkeleton />;
  }

  if (fetchError) {
    return (
      <Card bordered={false}>
        <Alert
          message="Error Loading Task"
          description="Failed to load task details. Please try again."
          type="error"
          showIcon
          action={
            <Space>
              <Button onClick={handleBack}>Back to Tasks</Button>
              <Button type="primary" onClick={() => window.location.reload()}>
                Retry
              </Button>
            </Space>
          }
        />
      </Card>
    );
  }

  if (!data?.alertTask) {
    return (
      <Card bordered={false}>
        <Alert
          message="Task Not Found"
          description="The requested task could not be found. It may have been deleted or you may not have permission to view it."
          type="warning"
          showIcon
          action={
            <Button onClick={handleBack}>Back to Tasks</Button>
          }
        />
      </Card>
    );
  }

  const task = data.alertTask;
  const transitions = data.transitions || [];

  // Get entity short name
  const entityShortName = task.srcEntityClass
    ? HelperEntities.getShortNameOfEntity(task.srcEntityClass)
    : '';

  return (
    <div role="main" aria-labelledby="task-detail-heading">
      <Card
        bordered={false}
        title={
          <Space>
            <Button
              icon={<ArrowLeftOutlined />}
              onClick={handleBack}
              aria-label="Go back to tasks list"
            >
              Back
            </Button>
            <span id="task-detail-heading">Task Detail: {task.title}</span>
          </Space>
        }
        extra={
          <Space role="group" aria-label="Task actions">
            {!isEdit ? (
              <Button
                type="primary"
                icon={<EditOutlined />}
                onClick={handleEdit}
                aria-label="Edit task"
              >
                Edit
              </Button>
            ) : (
              <>
                <Button
                  icon={<CloseOutlined />}
                  onClick={handleCancel}
                  aria-label="Cancel editing"
                >
                  Cancel
                </Button>
                <Button
                  type="primary"
                  icon={<SaveOutlined />}
                  onClick={handleUpdate}
                  loading={updateTaskMutation.isPending}
                  aria-label="Save task changes"
                  aria-busy={updateTaskMutation.isPending}
                >
                  Update
                </Button>
              </>
            )}
          </Space>
        }
      >
        <Row gutter={24}>
          {/* Left Column - Task Form */}
          <Col span={16} style={{ borderRight: '1px solid #f0f0f0', paddingRight: 24 }}>
            {isEdit && (
              <Alert
                message="Required Fields"
                description="You must select a Transition, Priority, and Assignee to update the task."
                type="info"
                icon={<InfoCircleOutlined />}
                showIcon
                closable
                style={{ marginBottom: 16 }}
              />
            )}

            <Form form={form} layout="vertical" disabled={!isEdit}>
              <Form.Item
                label="Transition"
                name="transition"
                rules={[
                  {
                    required: isEdit,
                    message: 'Please select a transition to update the task'
                  }
                ]}
                tooltip={isEdit ? "You must select a transition to update the task" : undefined}
              >
                <Select
                  placeholder={isEdit ? "Select transition (required)" : "Select transition"}
                  disabled={!isEdit}
                  allowClear={isEdit}
                >
                  {transitions.map((transition: string) => (
                    <Option key={transition} value={transition}>
                      {transition.toLowerCase()}
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

              <Form.Item
                label="Priority"
                name={['task', 'priority']}
                rules={[
                  {
                    required: isEdit,
                    message: 'Please select a priority'
                  }
                ]}
              >
                <Input type="number" min={1} max={10} />
              </Form.Item>

              <Form.Item
                label="Assignee"
                name={['task', 'assignee']}
                rules={[
                  {
                    required: isEdit,
                    message: 'Please select an assignee'
                  }
                ]}
              >
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
            </Form>
          </Col>

          {/* Right Column - Entity Information */}
          <Col span={8}>
            <section aria-labelledby="entity-info-heading">
              <h4 id="entity-info-heading" style={{ marginBottom: 16 }}>Information</h4>

              {task.srcEntityClass && (
                <>
                  <p>
                    <strong>Entity:</strong> <span aria-label="Entity type">{entityShortName}</span>
                  </p>
                  <p>
                    <strong>Id:</strong> <span aria-label="Entity ID">{task.srcEntityId}</span>
                  </p>

                  <Button
                    type="primary"
                    icon={<SearchOutlined />}
                    onClick={() => setShowEntityModal(true)}
                    style={{ marginTop: 16 }}
                    aria-label={`View details for entity ${entityShortName}`}
                  >
                    Detail Entity
                  </Button>
                </>
              )}

              {!task.srcEntityClass && (
                <p style={{ color: '#999' }} role="status">No entity information available</p>
              )}
            </section>
          </Col>
        </Row>
      </Card>

      {/* Entity Detail Modal */}
      {task.srcEntityClass && task.srcEntityId && showEntityModal && (
        <React.Suspense
          fallback={
            <Modal
              open={true}
              title="Loading Entity Details"
              footer={null}
              onCancel={() => setShowEntityModal(false)}
            >
              <div style={{ textAlign: 'center', padding: '40px 0' }}>
                <Spin size="large" />
                <p style={{ marginTop: 16 }}>Loading entity information...</p>
              </div>
            </Modal>
          }
        >
          <EntityDetailModal
            visible={showEntityModal}
            selectedRow={{ id: task.srcEntityId }}
            configDefinition={{ requestClass: task.srcEntityClass }}
            onClose={() => setShowEntityModal(false)}
          />
        </React.Suspense>
      )}
    </div>
  );
};


/**
 * Transition Form Page
 * Create and edit transitions within a workflow
 * Migrated from: .old_project/packages/statemachine/src/views/Transition.vue
 */

import React, { useEffect, useMemo, useState } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { Form, Input, Button, Card, message, Space, Row, Col, Select, Switch, Modal, Popover } from 'antd';
import { PlusOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import {
  useTransition,
  useStatesList,
  useCreateTransition,
  useUpdateTransition,
  useCriteriaList,
  useProcessesList,
  useCreateState,
} from '../hooks/useStatemachine';
import type { PersistedType, TransitionForm as TransitionFormType } from '../types';
import CriteriaForm from '../components/CriteriaForm';
import ProcessForm from '../components/ProcessForm';

const { TextArea } = Input;

export const Transition: React.FC = () => {
  const { transitionId } = useParams<{ transitionId: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  
  const workflowId = searchParams.get('workflowId') || '';
  const persistedType = (searchParams.get('persistedType') || 'persisted') as PersistedType;
  const entityClassName = searchParams.get('entityClassName') || '';
  
  const isNew = !transitionId || transitionId === 'new';
  const isRuntime = persistedType === 'transient';

  // Local state for modals and new state creation
  const [isCriteriaModalVisible, setIsCriteriaModalVisible] = useState(false);
  const [isProcessModalVisible, setIsProcessModalVisible] = useState(false);
  const [selectedCriteriaId, setSelectedCriteriaId] = useState<string>('');
  const [selectedProcessId, setSelectedProcessId] = useState<string>('');
  const [isAddNewState, setIsAddNewState] = useState(false);
  const [newStateName, setNewStateName] = useState('');
  const [newStateDescription, setNewStateDescription] = useState('');

  // Queries
  const { data: transition, isLoading: isLoadingTransition } = useTransition(
    persistedType,
    workflowId,
    transitionId || '',
    !isNew
  );
  const { data: states = [], isLoading: isLoadingStates, refetch: refetchStates } = useStatesList(persistedType, workflowId);
  const { data: criteriaList = [], isLoading: isLoadingCriteria, refetch: refetchCriteria } = useCriteriaList(entityClassName);
  const { data: processesList = [], isLoading: isLoadingProcesses, refetch: refetchProcesses } = useProcessesList(entityClassName);

  // Mutations
  const createTransitionMutation = useCreateTransition();
  const updateTransitionMutation = useUpdateTransition();
  const createStateMutation = useCreateState();
  
  // State options
  const startStateOptions = useMemo(() => {
    const options = states.map((state: any) => ({
      label: state.name,
      value: state.id,
      description: state.description,
    }));

    // Add NONE option at the beginning for start state
    if (!options.find(opt => opt.value === 'noneState')) {
      options.unshift({
        label: 'NONE',
        value: 'noneState',
        description: 'No start state',
      });
    }

    return options;
  }, [states]);

  const endStateOptions = useMemo(() => {
    return states.map((state: any) => ({
      label: state.name,
      value: state.id,
      description: state.description,
    }));
  }, [states]);
  
  // Criteria options
  const criteriaOptions = useMemo(() => {
    return criteriaList.map((criteria: any) => ({
      label: criteria.name || criteria.id,
      value: criteria.id,
    }));
  }, [criteriaList]);
  
  // Process options
  const processOptions = useMemo(() => {
    return processesList.map((process: any) => ({
      label: process.name,
      value: process.id?.persistedId || process.id?.runtimeId || process.id,
    }));
  }, [processesList]);
  
  // Initialize form when transition data loads
  useEffect(() => {
    if (transition) {
      form.setFieldsValue({
        name: transition.name,
        description: transition.description || '',
        active: transition.active !== undefined ? transition.active : true,
        automated: transition.automated || false,
        startStateId: transition.startStateId || transition.fromState,
        endStateId: transition.endStateId || transition.toState,
        criteriaIds: transition.criteriaIds || [],
        processIds: transition.processIds || [],
      });
    } else if (isNew) {
      form.setFieldsValue({
        active: true,
        automated: false,
      });
    }
  }, [transition, isNew, form]);
  
  // Handlers
  const handleSubmit = async (continueEditing = false, addAnother = false) => {
    try {
      const values = await form.validateFields();

      // Note: New state creation will be handled after transition is created
      // The Vue version creates the state after the transition is created
      let finalEndStateId = values.endStateId;
      if (isAddNewState) {
        // Use a placeholder for now, will create state after transition
        finalEndStateId = 'noneState';
      }

      const formData: TransitionFormType = {
        name: values.name,
        description: values.description,
        active: values.active,
        automated: values.automated,
        startStateId: values.startStateId,
        endStateId: finalEndStateId,
        criteriaIds: values.criteriaIds || [],
        processIds: values.processIds || [],
        workflowId,
      };

      if (isNew) {
        const result = await createTransitionMutation.mutateAsync({
          persistedType,
          workflowId,
          form: formData,
        });

        // Create new state if needed (after transition is created)
        if (isAddNewState && newStateName && result?.id) {
          const newStateData = {
            name: newStateName,
            description: newStateDescription,
            entityClassName,
          };

          await createStateMutation.mutateAsync({
            persistedType,
            workflowId,
            transitionId: result.id,
            form: newStateData,
          });

          await refetchStates();
          setIsAddNewState(false);
          setNewStateName('');
          setNewStateDescription('');
        }

        message.success('Transition created successfully');

        if (addAnother) {
          // Reset form for new transition
          form.resetFields();
          form.setFieldsValue({
            active: true,
            automated: false,
          });
        } else {
          // Navigate back to workflow detail
          navigate(
            `/workflow/${workflowId}?persistedType=${persistedType}&entityClassName=${entityClassName}`
          );
        }
      } else {
        const result = await updateTransitionMutation.mutateAsync({
          persistedType,
          workflowId,
          transitionId: transitionId!,
          form: formData,
        });

        // Create new state if needed (after transition is updated)
        if (isAddNewState && newStateName && transitionId) {
          const newStateData = {
            name: newStateName,
            description: newStateDescription,
            entityClassName,
          };

          await createStateMutation.mutateAsync({
            persistedType,
            workflowId,
            transitionId,
            form: newStateData,
          });

          await refetchStates();
          setIsAddNewState(false);
          setNewStateName('');
          setNewStateDescription('');
        }

        message.success('Transition updated successfully');

        if (!continueEditing) {
          // Navigate back to workflow detail
          navigate(
            `/workflow/${workflowId}?persistedType=${persistedType}&entityClassName=${entityClassName}`
          );
        }
      }
    } catch (error) {
      message.error('Failed to save transition');
    }
  };

  const handleCancel = () => {
    navigate(
      `/workflow/${workflowId}?persistedType=${persistedType}&entityClassName=${entityClassName}`
    );
  };

  const handleAddNewCriteria = () => {
    setSelectedCriteriaId('');
    setIsCriteriaModalVisible(true);
  };

  const handleEditCriteria = (criteriaId: string) => {
    setSelectedCriteriaId(criteriaId);
    setIsCriteriaModalVisible(true);
  };

  const handleCriteriaSubmitted = async (params: any) => {
    setIsCriteriaModalVisible(false);
    await refetchCriteria();

    if (params?.id) {
      const currentCriteriaIds = form.getFieldValue('criteriaIds') || [];
      if (!currentCriteriaIds.includes(params.id)) {
        form.setFieldsValue({
          criteriaIds: [...currentCriteriaIds, params.id],
        });
      }
    }
  };

  const handleAddNewProcess = () => {
    setSelectedProcessId('');
    setIsProcessModalVisible(true);
  };

  const handleEditProcess = (processId: string) => {
    setSelectedProcessId(processId);
    setIsProcessModalVisible(true);
  };

  const handleProcessSubmitted = async (params: any) => {
    setIsProcessModalVisible(false);
    await refetchProcesses();

    if (params?.id) {
      const currentProcessIds = form.getFieldValue('processIds') || [];
      if (!currentProcessIds.includes(params.id)) {
        form.setFieldsValue({
          processIds: [...currentProcessIds, params.id],
        });
      }
    }
  };

  const handleAddNewState = () => {
    setIsAddNewState(true);
    form.setFieldsValue({ endStateId: 'noneState' });
  };

  const handleCancelNewState = () => {
    setIsAddNewState(false);
    setNewStateName('');
    setNewStateDescription('');
    form.setFieldsValue({ endStateId: null });
  };
  
  const pageTitle = isNew ? 'Create New Transition' : `Transition: ${transition?.name || ''}`;
  const isLoading = isLoadingTransition || createTransitionMutation.isPending || updateTransitionMutation.isPending;

  return (
    <div style={{ padding: '16px' }}>
      {/* Back Button */}
      <div style={{ marginBottom: '16px' }}>
        <Button
          icon={<ArrowLeftOutlined />}
          onClick={handleCancel}
        >
          Back to Workflow
        </Button>
      </div>

      <Card>
        <Form
          form={form}
          layout="vertical"
        >
          {/* Header with title and toggles */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h2>{pageTitle}</h2>
            <Space size="large">
              <Space>
                <span>Active</span>
                <Form.Item name="active" valuePropName="checked" noStyle>
                  <Switch disabled={isRuntime} />
                </Form.Item>
              </Space>
              <Space>
                <span>Automated</span>
                <Form.Item name="automated" valuePropName="checked" noStyle>
                  <Switch disabled={isRuntime} />
                </Form.Item>
              </Space>
            </Space>
          </div>
          
          <Row gutter={24}>
            <Col span={12}>
              <Form.Item
                label="Name"
                name="name"
                rules={[{ required: true, message: 'Please enter a name' }]}
              >
                <Input disabled={isRuntime} />
              </Form.Item>
              
              <Form.Item label="Description" name="description">
                <TextArea
                  disabled={isRuntime}
                  autoSize={{ minRows: 3, maxRows: 6 }}
                />
              </Form.Item>
            </Col>
            
            <Col span={12}>
              <Form.Item
                label="Start State"
                name="startStateId"
                rules={[{ required: true, message: 'Please select a start state' }]}
              >
                <Select
                  placeholder="Select start state"
                  disabled={isRuntime}
                  loading={isLoadingStates}
                  options={startStateOptions}
                  showSearch
                  filterOption={(input, option) =>
                    (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                  }
                />
              </Form.Item>

              {isAddNewState ? (
                <>
                  <Form.Item
                    label="New state name"
                    rules={[{ required: true, message: 'Please input new state name' }]}
                  >
                    <Input
                      value={newStateName}
                      onChange={(e) => setNewStateName(e.target.value)}
                      disabled={isRuntime}
                    />
                  </Form.Item>

                  <Form.Item label="New state description">
                    <TextArea
                      value={newStateDescription}
                      onChange={(e) => setNewStateDescription(e.target.value)}
                      autoSize={{ minRows: 3, maxRows: 6 }}
                      disabled={isRuntime}
                    />
                  </Form.Item>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                    <span>or</span>
                    <Button danger onClick={handleCancelNewState} disabled={isRuntime}>
                      Discard and go back to selection
                    </Button>
                  </div>
                </>
              ) : (
                <>
                  <Form.Item
                    label="End State"
                    name="endStateId"
                    rules={[{ required: true, message: 'Please select an end state' }]}
                  >
                    <Select
                      placeholder="Select end state"
                      disabled={isRuntime}
                      loading={isLoadingStates}
                      options={endStateOptions}
                      showSearch
                      filterOption={(input, option) =>
                        (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                      }
                    />
                  </Form.Item>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                    <span>or</span>
                    <Button onClick={handleAddNewState} disabled={isRuntime}>
                      <PlusOutlined /> Create new State
                    </Button>
                  </div>
                </>
              )}
            </Col>
          </Row>
          
          <Row gutter={24}>
            <Col span={12}>
              <Form.Item label="Criteria" name="criteriaIds">
                <Select
                  mode="multiple"
                  placeholder="Select criteria"
                  disabled={isRuntime}
                  loading={isLoadingCriteria}
                  options={criteriaOptions}
                  showSearch
                  filterOption={(input, option) =>
                    (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                  }
                />
              </Form.Item>
            </Col>

            <Col span={12}>
              {!isRuntime && (
                <div style={{ marginTop: '30px' }}>
                  <Button type="primary" size="large" onClick={handleAddNewCriteria}>
                    Add new <PlusOutlined />
                  </Button>

                  <Form.Item noStyle shouldUpdate>
                    {() => {
                      const selectedCriteriaIds = form.getFieldValue('criteriaIds') || [];
                      if (selectedCriteriaIds.length > 0) {
                        return (
                          <div style={{ marginTop: '5px' }}>
                            <span style={{ fontSize: '16px' }}>Edit: </span>
                            {selectedCriteriaIds.map((criteriaId: string, index: number) => {
                              const criteria = criteriaList.find((c: any) => c.id === criteriaId);
                              return (
                                <span key={criteriaId}>
                                  <Popover
                                    content={criteria?.description || '-'}
                                    title={criteria?.name}
                                    trigger="hover"
                                  >
                                    <Button
                                      type="link"
                                      onClick={() => handleEditCriteria(criteriaId)}
                                      style={{ fontSize: '16px', padding: 0 }}
                                    >
                                      {criteria?.name || criteriaId}
                                    </Button>
                                  </Popover>
                                  {index < selectedCriteriaIds.length - 1 && <span> | </span>}
                                </span>
                              );
                            })}
                          </div>
                        );
                      }
                      return null;
                    }}
                  </Form.Item>
                </div>
              )}
            </Col>
          </Row>

          <Row gutter={24}>
            <Col span={12}>
              <Form.Item label="Process" name="processIds">
                <Select
                  mode="multiple"
                  placeholder="Select processes"
                  disabled={isRuntime}
                  loading={isLoadingProcesses}
                  options={processOptions}
                  showSearch
                  filterOption={(input, option) =>
                    (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                  }
                />
              </Form.Item>
            </Col>

            <Col span={12}>
              {!isRuntime && (
                <div style={{ marginTop: '30px' }}>
                  <Button type="primary" size="large" onClick={handleAddNewProcess}>
                    Add new <PlusOutlined />
                  </Button>

                  <Form.Item noStyle shouldUpdate>
                    {() => {
                      const selectedProcessIds = form.getFieldValue('processIds') || [];
                      if (selectedProcessIds.length > 0) {
                        return (
                          <div style={{ marginTop: '5px' }}>
                            <span style={{ fontSize: '16px' }}>Edit: </span>
                            {selectedProcessIds.map((processId: string, index: number) => {
                              const process = processesList.find((p: any) => {
                                const pId = p.id?.persistedId || p.id?.runtimeId || p.id;
                                return pId === processId;
                              });
                              return (
                                <span key={processId}>
                                  <Popover
                                    content={process?.description || '-'}
                                    title={process?.name}
                                    trigger="hover"
                                  >
                                    <Button
                                      type="link"
                                      onClick={() => handleEditProcess(processId)}
                                      style={{ fontSize: '16px', padding: 0 }}
                                    >
                                      {process?.name || processId}
                                    </Button>
                                  </Popover>
                                  {index < selectedProcessIds.length - 1 && <span> | </span>}
                                </span>
                              );
                            })}
                          </div>
                        );
                      }
                      return null;
                    }}
                  </Form.Item>
                </div>
              )}
            </Col>
          </Row>
          
          <Form.Item>
            <Space>
              <Button onClick={handleCancel}>
                Cancel
              </Button>

              {!isNew ? (
                <>
                  <Button
                    type="primary"
                    onClick={() => handleSubmit(true)}
                    loading={isLoading}
                    disabled={isRuntime}
                  >
                    Update & Continue Editing
                  </Button>
                  <Button
                    type="primary"
                    onClick={() => handleSubmit(false)}
                    loading={isLoading}
                    disabled={isRuntime}
                  >
                    Update
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    type="primary"
                    onClick={() => handleSubmit(false, true)}
                    loading={isLoading}
                    disabled={isRuntime}
                  >
                    Create & Add Another
                  </Button>
                  <Button
                    type="primary"
                    onClick={() => handleSubmit(false, false)}
                    loading={isLoading}
                    disabled={isRuntime}
                  >
                    Create
                  </Button>
                </>
              )}
            </Space>
          </Form.Item>
        </Form>
      </Card>

      {/* Criteria Modal */}
      <Modal
        title="Criteria"
        open={isCriteriaModalVisible}
        onCancel={() => setIsCriteriaModalVisible(false)}
        footer={null}
        width="90%"
        destroyOnClose
      >
        {isCriteriaModalVisible && (
          <CriteriaForm
            criteriaId={selectedCriteriaId}
            entityClassName={entityClassName}
            persistedType={persistedType}
            mode="embedded"
            onSubmitted={handleCriteriaSubmitted}
          />
        )}
      </Modal>

      {/* Process Modal */}
      <Modal
        title="Process"
        open={isProcessModalVisible}
        onCancel={() => setIsProcessModalVisible(false)}
        footer={null}
        width="90%"
        destroyOnClose
      >
        {isProcessModalVisible && (
          <ProcessForm
            processId={selectedProcessId}
            entityClassName={entityClassName}
            persistedType={persistedType}
            mode="embedded"
            onSubmitted={handleProcessSubmitted}
          />
        )}
      </Modal>
    </div>
  );
};

export default Transition;


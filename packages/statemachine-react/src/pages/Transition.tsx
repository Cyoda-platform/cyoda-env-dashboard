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
  const isRuntime = persistedType === 'runtime';

  // Local state for modals and new state creation
  const [isCriteriaModalVisible, setIsCriteriaModalVisible] = useState(false);
  const [isProcessModalVisible, setIsProcessModalVisible] = useState(false);
  const [selectedCriteriaId, setSelectedCriteriaId] = useState<string>('');
  const [selectedProcessId, setSelectedProcessId] = useState<string>('');
  const [isAddNewState, setIsAddNewState] = useState(false);
  const [newStateName, setNewStateName] = useState('');
  const [newStateDescription, setNewStateDescription] = useState('');

  // Queries
  const { data: transition, isLoading: isLoadingTransition, refetch: refetchTransition } = useTransition(
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
  
  // Process options - serialize objects to JSON strings for Select
  const processOptions = useMemo(() => {
    return processesList.map((process: any) => ({
      label: process.name,
      value: JSON.stringify(process.id), // Serialize to string for Select
      description: process.description,
      processId: process.id, // Keep original for reference
    }));
  }, [processesList]);

  // Custom tag render for processes to show name instead of JSON
  const processTagRender = (props: any) => {
    const { value, closable, onClose } = props;
    try {
      const processIdObj = JSON.parse(value);
      const process = processesList.find((p: any) => {
        const pId = p.id?.persistedId || p.id?.runtimeId;
        const selectedId = processIdObj?.persistedId || processIdObj?.runtimeId;
        return pId === selectedId;
      });

      return (
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            padding: '0 7px',
            marginRight: '4px',
            background: 'rgba(255, 255, 255, 0.08)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            borderRadius: '2px',
            color: '#fff',
          }}
        >
          <span>{process?.name || value}</span>
          {closable && (
            <span
              onClick={onClose}
              style={{
                marginLeft: '4px',
                cursor: 'pointer',
                fontSize: '12px',
              }}
            >
              ×
            </span>
          )}
        </span>
      );
    } catch (e) {
      return value;
    }
  };
  
  // Initialize form when transition data loads
  useEffect(() => {
    if (transition) {
      // Convert process objects to JSON strings for the form
      const processIds = (transition.endProcessesIds || []).map((p: any) => JSON.stringify(p));

      form.setFieldsValue({
        name: transition.name,
        description: transition.description || '',
        active: transition.active !== undefined ? transition.active : true,
        automated: transition.automated || false,
        startStateId: transition.startStateId || transition.fromState,
        endStateId: transition.endStateId || transition.toState,
        criteriaIds: transition.criteriaIds || [],
        processIds,
      });
    } else if (isNew) {
      form.setFieldsValue({
        active: true,
        automated: true,
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

      // Convert JSON strings back to objects
      const endProcessesIds = (values.processIds || []).map((p: string) => JSON.parse(p));

      // Build the form data
      // For updates, include all fields from the original transition (like Vue project does)
      const formData: TransitionFormType = isNew
        ? {
            '@bean': 'com.cyoda.core.model.stateMachine.dto.TransitionDto',
            name: values.name,
            description: values.description,
            active: values.active,
            automated: values.automated,
            startStateId: values.startStateId,
            endStateId: finalEndStateId,
            criteriaIds: values.criteriaIds || [],
            endProcessesIds,
            workflowId,
            entityClassName,
          }
        : {
            // For updates, include all fields from the original transition
            ...transition,
            '@bean': 'com.cyoda.core.model.stateMachine.dto.TransitionDto',
            id: transitionId,
            name: values.name,
            description: values.description,
            active: values.active,
            automated: values.automated,
            startStateId: values.startStateId,
            endStateId: finalEndStateId,
            criteriaIds: values.criteriaIds || [],
            endProcessesIds,
            workflowId,
            entityClassName,
          };

      console.log('=== Transition Form Data ===', formData);

      if (isNew) {
        const result = await createTransitionMutation.mutateAsync({
          persistedType,
          workflowId,
          form: formData,
        });

        // Extract transition ID from result
        const transitionId = (result as any)?.Data?.id;
        console.log('=== Transition created ===', { transitionId });

        // Create new state if needed (after transition is created)
        if (isAddNewState && newStateName && transitionId) {
          const newStateData = {
            name: newStateName,
            description: newStateDescription,
            entityClassName,
          };

          const stateResult = await createStateMutation.mutateAsync({
            persistedType,
            workflowId,
            transitionId,
            form: newStateData,
          });

          console.log('=== Created new state ===', stateResult);
          console.log('=== State ID ===', stateResult?.id || stateResult?.Data?.id);

          // The postState API automatically updates the transition's endStateId on the backend
          // Refresh states list only (don't refetch transition for new transitions to avoid 500 error)
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
            automated: true,
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

          const stateResult = await createStateMutation.mutateAsync({
            persistedType,
            workflowId,
            transitionId,
            form: newStateData,
          });

          console.log('=== Created new state ===', stateResult);

          // The postState API automatically updates the transition's endStateId on the backend
          // Refresh states list and transition (to get updated endStateId)
          const [, updatedTransitionResult] = await Promise.all([
            refetchStates(),
            refetchTransition(),
          ]);

          // Update form with the new endStateId from the backend
          if (updatedTransitionResult.data) {
            form.setFieldsValue({
              endStateId: updatedTransitionResult.data.endStateId,
            });
          }

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
      // Find the process object by ID
      const process = processesList.find((p: any) => {
        const pId = p.id?.persistedId || p.id?.runtimeId;
        const paramId = typeof params.id === 'object' ? params.id.persistedId : params.id;
        return pId === paramId;
      });

      if (process?.id) {
        const processIdStr = JSON.stringify(process.id);
        // Check if not already added
        if (!currentProcessIds.includes(processIdStr)) {
          form.setFieldsValue({
            processIds: [...currentProcessIds, processIdStr],
          });
        }
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

      <Card variant="borderless">
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
                  <Button type="primary" onClick={handleAddNewCriteria}>
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
                  tagRender={processTagRender}
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
                  <Button type="primary" onClick={handleAddNewProcess}>
                    Add new <PlusOutlined />
                  </Button>

                  <Form.Item noStyle shouldUpdate>
                    {() => {
                      const selectedProcessIds = form.getFieldValue('processIds') || [];
                      if (selectedProcessIds.length > 0) {
                        return (
                          <div style={{ marginTop: '5px' }}>
                            <span style={{ fontSize: '16px' }}>Edit: </span>
                            {selectedProcessIds.map((processIdStr: string, index: number) => {
                              // Parse the JSON string back to object
                              const processIdObj = JSON.parse(processIdStr);
                              const process = processesList.find((p: any) => {
                                const pId = p.id?.persistedId || p.id?.runtimeId;
                                const selectedId = processIdObj?.persistedId || processIdObj?.runtimeId;
                                return pId === selectedId;
                              });

                              const displayId = processIdObj?.persistedId || processIdObj?.runtimeId;

                              return (
                                <span key={processIdStr}>
                                  <Popover
                                    content={process?.description || '-'}
                                    title={process?.name}
                                    trigger="hover"
                                  >
                                    <Button
                                      type="link"
                                      onClick={() => handleEditProcess(displayId)}
                                      style={{ fontSize: '16px', padding: 0 }}
                                    >
                                      {process?.name || displayId}
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


/**
 * Instances Page
 * State machine instances list view
 * Migrated from: .old_project/packages/statemachine/src/views/Instances.vue
 */

import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Table, Button, Input, Select, Space, Card, Row, Col, message, Divider, Collapse } from 'antd';
import { SearchOutlined, LeftOutlined, RightOutlined, ArrowLeftOutlined, WarningOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import {
  useWorkflowEnabledTypes,
  useWorkflowsList,
  useInstances,
} from '../hooks/useStatemachine';
import { EntityTypeSwitch } from '@cyoda/ui-lib-react';
import { useGlobalUiSettingsStore } from '../stores/globalUiSettingsStore';
import { RangeCondition, type RangeConditionForm } from '../components/RangeCondition';
import type { Instance, InstanceTableRow, InstancesResponse } from '../types';

const PAGE_SIZE = 20;

export const Instances: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [entityClassName, setEntityClassName] = useState(searchParams.get('entityClassName') || '');
  const [filter, setFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [instancesData, setInstancesData] = useState<InstancesResponse | null>(null);
  const [isShowAdvanced, setIsShowAdvanced] = useState(false);

  // Range condition form state
  const [rangeConditionForm, setRangeConditionForm] = useState<RangeConditionForm>({
    entityClassName: entityClassName,
    rangeOrder: 'ASC',
    rangeCondition: {
      '@bean': '',
      fieldName: '',
      operation: '',
      value: {
        '@type': '',
        value: '',
      },
    },
  });

  // Global UI settings
  const { entityType, isEnabledTechView, setEntityType } = useGlobalUiSettingsStore();

  // Queries
  const { data: workflowEnabledTypes = [], isLoading: isLoadingEntities } = useWorkflowEnabledTypes();
  const { data: workflows = [] } = useWorkflowsList(entityClassName);
  const instancesMutation = useInstances();
  
  // Update rangeConditionForm when entityClassName changes
  useEffect(() => {
    setRangeConditionForm(prev => ({
      ...prev,
      entityClassName: entityClassName,
    }));
  }, [entityClassName]);

  // Load instances
  const loadInstances = async (offset = 0) => {
    if (!entityClassName) {
      message.warning('Please select an entity');
      return;
    }

    try {
      const requestData: any = {
        entityClassName,
        rangeOrder: rangeConditionForm.rangeOrder,
        paging: {
          offset,
          maxResults: PAGE_SIZE,
        },
      };

      // Add rangeCondition if it's configured
      if (rangeConditionForm.rangeCondition['@bean']) {
        requestData.rangeCondition = rangeConditionForm.rangeCondition;
      }

      // Add entity IDs filter if provided
      if (filter.trim()) {
        requestData.entityIds = filter
          .split(',')
          .map((id) => id.trim())
          .filter((id) => id);
      }

      const response = await instancesMutation.mutateAsync(requestData);
      setInstancesData(response);
    } catch (error) {
      message.error('Failed to load instances');
    }
  };
  
  // Handlers
  const handleEntityChange = (value: string) => {
    setEntityClassName(value);
    setCurrentPage(1);
    setInstancesData(null);
  };

  const handleSearch = () => {
    setCurrentPage(1);
    loadInstances(0);
  };

  const handleToggleAdvanced = () => {
    setIsShowAdvanced(!isShowAdvanced);
  };

  const handleRangeConditionChange = (form: RangeConditionForm) => {
    setRangeConditionForm(form);
  };
  
  const handlePrevPage = () => {
    const newPage = currentPage - 1;
    const newOffset = (newPage - 1) * PAGE_SIZE;
    setCurrentPage(newPage);
    loadInstances(newOffset);
  };
  
  const handleNextPage = () => {
    const newPage = currentPage + 1;
    const newOffset = (newPage - 1) * PAGE_SIZE;
    setCurrentPage(newPage);
    loadInstances(newOffset);
  };
  
  const handleViewDetail = (record: InstanceTableRow) => {
    navigate(
      `/instances/${record.entityId}?entityClassName=${record.entityClassName}`
    );
  };
  
  const getWorkflowName = (record: Instance) => {
    if (!record.currentWorkflowId) return '';
    const workflow = workflows.find((w: any) => w.id === record.currentWorkflowId);
    return workflow ? workflow.name : record.currentWorkflowId;
  };
  
  const getWorkflowLink = (record: Instance) => {
    if (!record.currentWorkflowId) return '';
    const persistedType = 'persisted'; // Default to persisted
    return `/statemachine/workflow/${record.currentWorkflowId}?persistedType=${persistedType}&entityClassName=${record.entityClassName}`;
  };

  // Helper function to map entity type
  const entityTypeMapper = (type: string): string => {
    const map: Record<string, string> = {
      BUSINESS: 'Business',
      PERSISTENCE: 'Technical',
    };
    return map[type] || type;
  };

  // Entity options - filtered by selected entity type
  const entityOptions = useMemo(() => {
    return workflowEnabledTypes
      .filter((type: any) => {
        // If tech view is enabled, filter by entity type
        if (isEnabledTechView && typeof type === 'object' && type.type) {
          return type.type === entityType;
        }
        return true;
      })
      .map((type: any) => {
        // Handle both string arrays and object arrays
        if (typeof type === 'string') {
          return { label: type, value: type };
        }

        // Handle different API response formats:
        // 1. { name: 'com.example.Entity', type: 'BUSINESS' }
        // 2. { value: 'com.example.Entity', label: 'Entity' }
        // 3. { entityClass: 'com.example.Entity', workflowEnabled: true }
        const value = type.value || type.name || type.entityClass;
        if (!value || typeof value !== 'string') {
          console.warn('Invalid entity type:', type);
          return null;
        }

        // If entity has type info, add it to the label
        let label = type.label || value;
        if (type.type) {
          const typeLabel = entityTypeMapper(type.type);
          label = `${value} (${typeLabel})`;
        }

        return {
          label,
          value,
        };
      })
      .filter(Boolean); // Remove any null entries
  }, [workflowEnabledTypes, entityType, isEnabledTechView]);
  
  // Table data
  const tableData: InstanceTableRow[] = (instancesData?.instances || []).map((instance) => ({
    ...instance,
    key: instance.entityId,
    entityClassNameLabel: entityOptions.find((opt) => opt.value === instance.entityClassName)?.label || instance.entityClassName,
  }));
  
  // Table columns
  const columns: ColumnsType<InstanceTableRow> = [
    {
      title: 'Entity Id',
      dataIndex: 'entityId',
      key: 'entityId',
      render: (entityId: string, record) => (
        <span style={{ color: record.deleted ? '#ff4d4f' : 'inherit' }}>
          {entityId} {record.deleted && <small>(deleted)</small>}
        </span>
      ),
    },
    {
      title: 'Entity Name',
      dataIndex: 'entityClassNameLabel',
      key: 'entityClassNameLabel',
    },
    {
      title: 'Current Workflow',
      dataIndex: 'currentWorkflowId',
      key: 'currentWorkflowId',
      render: (_, record) => {
        if (!record.currentWorkflowId) return null;
        return (
          <a href={getWorkflowLink(record)} onClick={(e) => {
            e.preventDefault();
            navigate(getWorkflowLink(record));
          }}>
            {getWorkflowName(record)}
          </a>
        );
      },
    },
    {
      title: 'State',
      dataIndex: 'state',
      key: 'state',
    },
    {
      title: 'Created',
      dataIndex: 'creationDate',
      key: 'creationDate',
      render: (date: number) => new Date(date).toLocaleString(),
    },
    {
      title: 'Updated',
      dataIndex: 'lastUpdateTime',
      key: 'lastUpdateTime',
      render: (date: number) => new Date(date).toLocaleString(),
    },
    {
      title: 'Action',
      key: 'action',
      width: 100,
      render: (_, record) => (
        <Button
          type="primary"
          size="small"
          icon={<SearchOutlined />}
          onClick={() => handleViewDetail(record)}
        />
      ),
    },
  ];
  
  // Load instances on mount if entity is selected
  useEffect(() => {
    if (entityClassName) {
      loadInstances(0);
    }
  }, [entityClassName]);
  
  const hasMore = instancesData?.hasMore || false;
  const hasPrev = currentPage > 1;
  
  return (
    <div style={{ padding: '16px' }}>
      {/* Header with Entity Type Switch */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <h1 style={{ margin: 0 }}>Instances</h1>
        <EntityTypeSwitch
          value={entityType}
          onChange={setEntityType}
          visible={isEnabledTechView}
        />
      </div>

      <Card>
        <Space direction="vertical" size="middle" style={{ width: '100%' }}>
          {/* Filters */}
          <Row gutter={[16, 16]}>
            <Col span={6}>
              <Select
                placeholder="Select entity"
                value={entityClassName || undefined}
                onChange={handleEntityChange}
                loading={isLoadingEntities}
                options={entityOptions}
                showSearch
                allowClear
                style={{ width: '100%' }}
              />
            </Col>
            <Col span={6}>
              <Input
                placeholder="Search by id (comma-separated)"
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                disabled={!entityClassName}
                allowClear
              />
              <div style={{ fontSize: '12px', color: '#999', marginTop: '4px' }}>
                To search for multiple values, please enter the IDs separated by commas
              </div>
            </Col>
            <Col span={6}>
              <Space>
                <Button
                  type="primary"
                  icon={<SearchOutlined />}
                  onClick={handleSearch}
                  disabled={!entityClassName}
                  loading={instancesMutation.isPending}
                >
                  Search
                </Button>
                <Button
                  type="default"
                  icon={<WarningOutlined />}
                  onClick={handleToggleAdvanced}
                  style={{
                    backgroundColor: isShowAdvanced ? '#faad14' : undefined,
                    borderColor: isShowAdvanced ? '#faad14' : undefined,
                    color: isShowAdvanced ? '#fff' : undefined,
                  }}
                >
                  Advanced
                </Button>
              </Space>
            </Col>
          </Row>

          {/* Advanced Filtering */}
          <Collapse
            activeKey={isShowAdvanced ? ['advanced'] : []}
            ghost
            items={[
              {
                key: 'advanced',
                label: null,
                showArrow: false,
                children: (
                  <>
                    <Divider />
                    <RangeCondition
                      form={rangeConditionForm}
                      onChange={handleRangeConditionChange}
                      disabled={!entityClassName}
                    />
                  </>
                ),
              },
            ]}
          />

          {/* Table */}
          <Table
            columns={columns}
            dataSource={tableData}
            loading={instancesMutation.isPending}
            pagination={false}
            bordered
          />
          
          {/* Pagination */}
          {instancesData && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <Button
                type="primary"
                icon={<LeftOutlined />}
                onClick={handlePrevPage}
                disabled={!hasPrev || instancesMutation.isPending}
              >
                Prev
              </Button>
              <Button
                type="primary"
                onClick={handleNextPage}
                disabled={!hasMore || instancesMutation.isPending}
              >
                Next
                <RightOutlined />
              </Button>
              {(hasMore || currentPage > 1) && (
                <span>Page {currentPage}</span>
              )}
            </div>
          )}
        </Space>
      </Card>
    </div>
  );
};

export default Instances;


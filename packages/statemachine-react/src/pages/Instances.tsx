/**
 * Instances Page
 * State machine instances list view
 * Migrated from: .old_project/packages/statemachine/src/views/Instances.vue
 */

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Table, Button, Input, Select, Space, Row, Col, message, Divider, Collapse } from 'antd';
import { SearchOutlined, LeftOutlined, RightOutlined, ArrowLeftOutlined, WarningOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import type { ResizeCallbackData } from 'react-resizable';
import {
  useWorkflowEnabledTypes,
  useWorkflowsList,
  useInstances,
} from '../hooks/useStatemachine';
import { useTableState } from '../hooks/useTableState';
import { useGlobalUiSettingsStore, HelperFeatureFlags, HelperStorage } from '@cyoda/http-api-react';
import { RangeCondition, type RangeConditionForm } from '../components/RangeCondition';
import type { Instance, InstanceTableRow, InstancesResponse } from '../types';
import { ResizableTitle } from '../components/ResizableTitle';
import './Instances.scss';

const PAGE_SIZE = 20;

export const Instances: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const storage = useMemo(() => new HelperStorage(), []);

  // Column widths state
  const [columnWidths, setColumnWidths] = useState<Record<string, number>>(() => {
    const saved = storage.get('instances:columnWidths', {});
    const defaultWidths = {
      entityId: 150,
      entityClassNameLabel: 180,
      currentWorkflowId: 180,
      state: 150,
    };
    return saved && Object.keys(saved).length > 0 ? saved : defaultWidths;
  });

  // Save column widths to localStorage
  useEffect(() => {
    if (Object.keys(columnWidths).length > 0) {
      storage.set('instances:columnWidths', columnWidths);
    }
  }, [columnWidths, storage]);

  // Handle column resize
  const handleResize = useCallback((key: string) => {
    return (_: React.SyntheticEvent, { size }: ResizeCallbackData) => {
      setColumnWidths((prev) => {
        const oldWidth = prev[key];
        const newWidth = size.width;
        const delta = newWidth - oldWidth;

        const otherKeys = Object.keys(prev).filter(k => k !== key);
        if (otherKeys.length === 0) {
          return { ...prev, [key]: newWidth };
        }

        const totalOtherWidth = otherKeys.reduce((sum, k) => sum + prev[k], 0);
        const newWidths = { ...prev, [key]: newWidth };

        otherKeys.forEach(k => {
          const proportion = prev[k] / totalOtherWidth;
          const adjustment = delta * proportion;
          newWidths[k] = Math.max(50, prev[k] - adjustment);
        });

        return newWidths;
      });
    };
  }, []);

  // Table state persistence
  const { tableState, setFilter, updateTableState } = useTableState({
    storageKey: 'instancesTable',
    defaultPageSize: PAGE_SIZE,
    syncWithUrl: true,
  });

  const [entityClassName, setEntityClassName] = useState(searchParams.get('entityClassName') || '');
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
  const { entityType } = useGlobalUiSettingsStore();

  // Check if entity type filtering is enabled via feature flag
  const hasEntityTypeInfo = HelperFeatureFlags.isUseModelsInfo();

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
      const filterValue = tableState.filter || '';
      if (filterValue.trim()) {
        requestData.entityIds = filterValue
          .split(',')
          .map((id) => id.trim())
          .filter((id) => id);
      }

      console.log('[Instances] Request data:', requestData);
      const response = await instancesMutation.mutateAsync(requestData);
      console.log('[Instances] Response:', response);
      setInstancesData(response);
    } catch (error) {
      console.error('[Instances] Error loading instances:', error);
      message.error('Failed to load instances');
    }
  };
  
  // Handlers
  const handleEntityChange = (value: string) => {
    console.log('[Instances] handleEntityChange called with value:', value);
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

  // Entity options - filtered by selected entity type
  const entityOptions = useMemo(() => {
    console.log('[Instances] Building entityOptions from workflowEnabledTypes:', workflowEnabledTypes);
    console.log('[Instances] hasEntityTypeInfo:', hasEntityTypeInfo, 'entityType:', entityType);

    const options = workflowEnabledTypes
      .filter((type: any) => {
        // If feature flag is enabled and entity has type info, filter by entity type
        if (hasEntityTypeInfo && typeof type === 'object' && type.type) {
          const matches = type.type === entityType;
          console.log('[Instances] Filtering type:', type, 'matches:', matches);
          return matches;
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
          const parts = value.split(".");
        const shortName = parts.length >= 2 ? parts.slice(-2).join(".") : value;
        label = shortName;
        }

        return {
          label,
          value,
        };
      })
      .filter(Boolean); // Remove any null entries

    console.log('[Instances] Final entityOptions:', options);
    return options;
  }, [workflowEnabledTypes, entityType, hasEntityTypeInfo]);
  
  // Table data
  const tableData: InstanceTableRow[] = (instancesData?.items || []).map((instance) => ({
    ...instance,
    key: instance.entityId,
    entityClassNameLabel: entityOptions.find((opt) => opt.value === instance.entityClassName)?.label || instance.entityClassName,
  }));
  
  // Table columns with resizable support
  const columns: ColumnsType<InstanceTableRow> = useMemo(() => [
    {
      title: 'Entity Id',
      dataIndex: 'entityId',
      key: 'entityId',
      width: columnWidths.entityId,
      render: (entityId: string, record) => (
        <span style={{ color: record.deleted ? '#ff4d4f' : 'inherit' }}>
          {entityId} {record.deleted && <small>(deleted)</small>}
        </span>
      ),
      onHeaderCell: () => ({
        width: columnWidths.entityId,
        onResize: handleResize('entityId'),
      }),
    },
    {
      title: entityType === 'BUSINESS' ? 'Business Entity' : 'Technical Entity',
      dataIndex: 'entityClassNameLabel',
      key: 'entityClassNameLabel',
      width: columnWidths.entityClassNameLabel,
      onHeaderCell: () => ({
        width: columnWidths.entityClassNameLabel,
        onResize: handleResize('entityClassNameLabel'),
      }),
    },
    {
      title: 'Current Workflow',
      dataIndex: 'currentWorkflowId',
      key: 'currentWorkflowId',
      width: columnWidths.currentWorkflowId,
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
      onHeaderCell: () => ({
        width: columnWidths.currentWorkflowId,
        onResize: handleResize('currentWorkflowId'),
      }),
    },
    {
      title: 'State',
      dataIndex: 'state',
      key: 'state',
      width: columnWidths.state,
      onHeaderCell: () => ({
        width: columnWidths.state,
        onResize: handleResize('state'),
      }),
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
  ], [columnWidths, handleResize, getWorkflowLink, getWorkflowName, handleViewDetail, navigate, entityType]);
  
  // Load instances on mount if entity is selected
  useEffect(() => {
    console.log('[Instances] useEffect triggered, entityClassName:', entityClassName);
    if (entityClassName) {
      console.log('[Instances] Loading instances for entity:', entityClassName);
      loadInstances(0);
    } else {
      console.log('[Instances] No entityClassName selected, skipping load');
    }
  }, [entityClassName]);
  
  const hasMore = instancesData?.hasMore || false;
  const hasPrev = currentPage > 1;
  
  return (
    <div className="instances-page">
      {/* Header */}
      <h1 className="page-title">Instances</h1>

      {/* Filters */}
      <div className="instances-filters">
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
                popupMatchSelectWidth={false}
                styles={{ popup: { root: { minWidth: '400px' } } }}
              />
            </Col>
            <Col span={6}>
              <Input
                placeholder="Search by id (comma-separated)"
                value={tableState.filter || ''}
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
      </div>

      {/* Table */}
      <Table
          columns={columns}
          dataSource={tableData}
          loading={instancesMutation.isPending}
          components={{
            header: {
              cell: ResizableTitle,
            },
          }}
          pagination={false}
          bordered
        />

      {/* Pagination */}
      {instancesData && (
        <div className="instances-pagination">
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
    </div>
  );
};

export default Instances;


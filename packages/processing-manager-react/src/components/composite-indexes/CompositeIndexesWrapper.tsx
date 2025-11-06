/**
 * Composite Indexes Wrapper Component
 * Migrated from @cyoda/processing-manager/src/components/PmShardsDetailTab/PmShardsDetailTabCompositeIndexes/PmCompositeIndexes.vue
 */

import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { Table, Form, Select, Input, Button, Space, Tag, Tooltip, Alert, message, Modal } from 'antd';
import { PlusOutlined, SyncOutlined, DeleteOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import type { ResizeCallbackData } from 'react-resizable';
import { HelperStorage } from '@cyoda/http-api-react';
import { ResizableTitle } from '../ResizableTitle';
import moment from 'moment';
import {
  useEntityTypes,
  useCompositeIndexes,
  useReindexCompositeIndex,
  useDeleteCompositeIndex,
} from '../../hooks/usePlatformCommon';
import './CompositeIndexesWrapper.scss';

interface CompositeIndex {
  indexId: string;
  indexName: string;
  rangeField?: {
    columnName: string;
  };
  noneRangeFields?: Array<{
    columnName: string;
  }>;
  decision?: string;
  persisted: boolean;
  createDate?: string;
}

export const CompositeIndexesWrapper: React.FC = () => {
  const storage = useMemo(() => new HelperStorage(), []);
  const [entityClass, setEntityClass] = useState<string | undefined>(undefined);
  const [search, setSearch] = useState<string>('');
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);

  // Fetch entity types for dropdown
  const { data: entityTypes = [], isLoading: entityTypesLoading } = useEntityTypes();

  // Fetch composite indexes for selected entity
  const { data: compositeIndexData, isLoading: indexesLoading, refetch } = useCompositeIndexes(entityClass);

  // Mutations
  const reindexMutation = useReindexCompositeIndex();
  const deleteMutation = useDeleteCompositeIndex();

  const [columnWidths, setColumnWidths] = useState<Record<string, number>>(() => {
    const saved = storage.get('compositeIndexes:columnWidths', {});
    const defaultWidths = {
      indexName: 250,
      rangeField: 150,
      noneRangeFields: 250,
      decision: 150,
      persisted: 120,
      createDate: 180,
      actions: 150,
    };
    return saved && Object.keys(saved).length > 0 ? saved : defaultWidths;
  });

  useEffect(() => {
    if (Object.keys(columnWidths).length > 0) {
      storage.set('compositeIndexes:columnWidths', columnWidths);
    }
  }, [columnWidths, storage]);

  const handleResize = useCallback((key: string) => {
    return (_: React.SyntheticEvent, { size }: ResizeCallbackData) => {
      setColumnWidths((prev) => {
        const oldWidth = prev[key];
        const newWidth = size.width;
        const delta = newWidth - oldWidth;
        const otherKeys = Object.keys(prev).filter(k => k !== key && k !== 'actions');
        if (otherKeys.length === 0) return { ...prev, [key]: newWidth };
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

  const entityClassOptions = useMemo(() => {
    return entityTypes.map((type: string) => ({ label: type, value: type }));
  }, [entityTypes]);

  const filteredData = useMemo(() => {
    // Ensure compositeIndexData is always an array
    const dataArray = Array.isArray(compositeIndexData) ? compositeIndexData : [];

    return dataArray.filter((item: CompositeIndex) => {
      if (!search) return true;
      return item.indexName.toLowerCase().includes(search.toLowerCase());
    });
  }, [compositeIndexData, search]);

  const columns: ColumnsType<CompositeIndex> = useMemo(() => [
    {
      title: 'Name',
      dataIndex: 'indexName',
      key: 'indexName',
      width: columnWidths.indexName,
      sorter: (a, b) => a.indexName.localeCompare(b.indexName),
      onHeaderCell: () => ({ width: columnWidths.indexName, onResize: handleResize('indexName') }),
    },
    {
      title: 'Range Field',
      dataIndex: ['rangeField', 'columnName'],
      key: 'rangeField',
      width: columnWidths.rangeField,
      sorter: (a, b) => {
        const aVal = a.rangeField?.columnName || '';
        const bVal = b.rangeField?.columnName || '';
        return aVal.localeCompare(bVal);
      },
      onHeaderCell: () => ({ width: columnWidths.rangeField, onResize: handleResize('rangeField') }),
    },
    {
      title: 'None Range Fields',
      dataIndex: 'noneRangeFields',
      key: 'noneRangeFields',
      width: columnWidths.noneRangeFields,
      onHeaderCell: () => ({ width: columnWidths.noneRangeFields, onResize: handleResize('noneRangeFields') }),
      render: (fields: Array<{ columnName: string }>) => (
        <ol style={{ margin: 0, paddingLeft: 20 }}>
          {fields?.map((field, index) => (
            <li key={index}>{field.columnName}</li>
          ))}
        </ol>
      ),
    },
    {
      title: 'Decision',
      dataIndex: 'decision',
      key: 'decision',
      width: columnWidths.decision,
      sorter: (a, b) => (a.decision || '').localeCompare(b.decision || ''),
      onHeaderCell: () => ({ width: columnWidths.decision, onResize: handleResize('decision') }),
    },
    {
      title: 'Index Type',
      dataIndex: 'persisted',
      key: 'persisted',
      width: columnWidths.persisted,
      onHeaderCell: () => ({ width: columnWidths.persisted, onResize: handleResize('persisted') }),
      render: (persisted: boolean) => (
        <Tag color={persisted ? 'blue' : 'default'}>
          {persisted ? 'Custom' : 'System'}
        </Tag>
      ),
      sorter: (a, b) => Number(a.persisted) - Number(b.persisted),
    },
    {
      title: 'Created',
      dataIndex: 'createDate',
      key: 'createDate',
      width: columnWidths.createDate,
      onHeaderCell: () => ({ width: columnWidths.createDate, onResize: handleResize('createDate') }),
      render: (date: string) => (date ? moment(date).format('YYYY-MM-DD HH:mm:ss') : '-'),
      sorter: (a, b) => {
        const aDate = a.createDate ? moment(a.createDate).valueOf() : 0;
        const bDate = b.createDate ? moment(b.createDate).valueOf() : 0;
        return aDate - bDate;
      },
      defaultSortOrder: 'descend',
    },
    {
      title: 'Action',
      key: 'action',
      fixed: 'right',
      width: columnWidths.actions,
      render: (_, record) => (
        record.persisted ? (
          <Space>
            <Tooltip title="Reindex">
              <Button
                type="primary"
                icon={<SyncOutlined />}
                onClick={() => handleReindex(record)}
              />
            </Tooltip>
            <Tooltip title="Delete">
              <Button
                danger
                icon={<DeleteOutlined />}
                onClick={() => handleDelete(record)}
              />
            </Tooltip>
          </Space>
        ) : null
      ),
    },
  ], [columnWidths, handleResize]);

  const handleReindex = async (record: CompositeIndex) => {
    try {
      await reindexMutation.mutateAsync(record.indexId);
      message.success(`Reindexing started for ${record.indexName}`);
      refetch();
    } catch (error) {
      message.error(`Failed to reindex: ${error}`);
    }
  };

  const handleDelete = (record: CompositeIndex) => {
    Modal.confirm({
      title: 'Delete Composite Index',
      icon: <ExclamationCircleOutlined />,
      content: `Are you sure you want to delete "${record.indexName}"?`,
      okText: 'Delete',
      okType: 'danger',
      cancelText: 'Cancel',
      onOk: async () => {
        try {
          await deleteMutation.mutateAsync(record.indexId);
          message.success(`Deleted ${record.indexName}`);
          refetch();
        } catch (error) {
          message.error(`Failed to delete: ${error}`);
        }
      },
    });
  };

  const handleCreateNew = () => {
    message.info('Create new composite index dialog - To be implemented');
    // TODO: Implement create new dialog
  };

  const handleEntityChange = (value: string) => {
    setEntityClass(value);
    setSelectedRowKeys([]);
  };

  const rowSelection = {
    selectedRowKeys,
    onChange: (newSelectedRowKeys: React.Key[]) => {
      setSelectedRowKeys(newSelectedRowKeys);
    },
    getCheckboxProps: (record: CompositeIndex) => ({
      disabled: !record.persisted,
    }),
  };

  const emptyText = !entityClass
    ? 'No Data. Please, select entity'
    : 'No Data';

  return (
    <div className="composite-indexes-wrapper" style={{ padding: '20px' }}>
      <h1 style={{ fontSize: '24px', marginBottom: 16 }}>Composite indexes</h1>

      <Form layout="vertical" style={{ marginBottom: 16 }}>
        <Form.Item label="Entity">
          <Select
            value={entityClass}
            onChange={handleEntityChange}
            placeholder="Entity Class"
            allowClear
            showSearch
            loading={entityTypesLoading}
            style={{ width: '100%' }}
          >
            {entityClassOptions.map((option: { label: string; value: string }) => (
              <Select.Option key={option.value} value={option.value}>
                {option.label}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>
      </Form>

      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16, gap: 16 }}>
        <Input
          placeholder="Search Composite Index name here..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ flex: 1 }}
        />
        <Space>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            disabled={!entityClass}
            onClick={handleCreateNew}
          >
            Create New
          </Button>
          <Button disabled={selectedRowKeys.length === 0}>
            Export/Import
          </Button>
        </Space>
      </div>

      <Table
        columns={columns}
        dataSource={filteredData}
        rowKey="indexId"
        rowSelection={rowSelection}
        bordered
        size="small"
        loading={indexesLoading || reindexMutation.isPending || deleteMutation.isPending}
        locale={{ emptyText }}
        pagination={{
          pageSizeOptions: ['5', '10', '15', '20', '50'],
          defaultPageSize: 10,
          showSizeChanger: true,
          position: ['bottomCenter'],
        }}
        scroll={{ x: 1200 }}
        components={{
          header: {
            cell: ResizableTitle,
          },
        }}
      />
    </div>
  );
};

export default CompositeIndexesWrapper;


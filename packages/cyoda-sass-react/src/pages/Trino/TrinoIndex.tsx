import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Input, Table, Space, Tooltip, Modal, message } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, ReloadOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import moment from 'moment';
import { useSchemas, useDeleteSchema } from '../../hooks/useSqlSchema';
import { useTableSaveState } from '../../hooks/useTableSaveState';
import { getTimeFromUuid } from '../../utils/validation';
import type { SqlSchema } from '../../types';
import './TrinoIndex.css';

const TrinoIndex: React.FC = () => {
  const navigate = useNavigate();
  const [filter, setFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Fetch schemas
  const { data: schemas = [], isLoading, refetch } = useSchemas();
  const deleteSchema = useDeleteSchema();

  // Table state persistence
  const { deleteState } = useTableSaveState('trinoIndexTable');

  // Process schemas with timestamps
  const processedSchemas = useMemo(() => {
    return schemas.map((schema) => ({
      ...schema,
      timestamp: schema.id ? getTimeFromUuid(schema.id) : Date.now(),
    })).sort((a, b) => b.timestamp - a.timestamp);
  }, [schemas]);

  // Filter schemas
  const filteredSchemas = useMemo(() => {
    if (!filter) return processedSchemas;
    const lowerFilter = filter.toLowerCase();
    return processedSchemas.filter((schema) =>
      schema.schemaName.toLowerCase().includes(lowerFilter)
    );
  }, [processedSchemas, filter]);

  // Handle create schema
  const handleCreate = () => {
    navigate('/trino/schema');
  };

  // Handle edit schema
  const handleEdit = (schema: SqlSchema) => {
    navigate(`/trino/schema/${schema.id}`);
  };

  // Handle delete schema
  const handleDelete = (schema: SqlSchema) => {
    Modal.confirm({
      title: 'Delete Schema',
      content: `Are you sure you want to delete schema "${schema.schemaName}"?`,
      okText: 'Delete',
      okType: 'danger',
      cancelText: 'Cancel',
      onOk: async () => {
        if (schema.id) {
          await deleteSchema.mutateAsync(schema.id);
          refetch();
        }
      },
    });
  };

  // Handle reset state
  const handleResetState = () => {
    setFilter('');
    setCurrentPage(1);
    setPageSize(10);
    deleteState();
    message.success('State reset successfully');
  };

  // Table columns
  const columns: ColumnsType<SqlSchema> = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      sorter: (a, b) => (a.id || '').localeCompare(b.id || ''),
      ellipsis: true,
      width: 300,
    },
    {
      title: 'Schema Name',
      dataIndex: 'schemaName',
      key: 'schemaName',
      sorter: (a, b) => a.schemaName.localeCompare(b.schemaName),
    },
    {
      title: 'Created',
      dataIndex: 'timestamp',
      key: 'timestamp',
      sorter: (a, b) => (a.timestamp || 0) - (b.timestamp || 0),
      render: (timestamp: number) => moment(timestamp).format('DD.MM.YYYY HH:mm:ss'),
      width: 200,
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 220,
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="Edit">
            <Button
              type="default"
              icon={<EditOutlined />}
              onClick={() => handleEdit(record)}
            />
          </Tooltip>
          <Tooltip title="Delete">
            <Button
              type="default"
              danger
              icon={<DeleteOutlined />}
              onClick={() => handleDelete(record)}
              loading={deleteSchema.isPending}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <div className="trino-index">
      <h1 className="page-title">Trino SQL schemas</h1>
      <div className="card">
        <div className="card-body">
          <div className="trino-index-header">
            <div className="trino-index-filter">
              <Input
                placeholder="Filter"
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                style={{ width: 300 }}
              />
            </div>
            <div className="trino-index-actions">
              <Tooltip title="Reset state: filters, table settings, etc.">
                <Button
                  type="default"
                  icon={<ReloadOutlined />}
                  onClick={handleResetState}
                >
                  Reset state
                </Button>
              </Tooltip>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={handleCreate}
              >
                Create schema
              </Button>
            </div>
          </div>

          <Table
            columns={columns}
            dataSource={filteredSchemas}
            rowKey="id"
            loading={isLoading}
            pagination={{
              current: currentPage,
              pageSize: pageSize,
              total: filteredSchemas.length,
              showSizeChanger: true,
              pageSizeOptions: ['5', '10', '20', '50'],
              onChange: (page, size) => {
                setCurrentPage(page);
                setPageSize(size);
              },
            }}
            bordered
          />
        </div>
      </div>
    </div>
  );
};

export default TrinoIndex;


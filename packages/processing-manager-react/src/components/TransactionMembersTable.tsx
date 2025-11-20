/**
 * Transaction Members Table Component
 * Displays transaction members with filtering and pagination
 */

import { useState, useMemo, useEffect, useCallback } from 'react';
import { Table, Input, Select, Space, Tag } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import type { ResizeCallbackData } from 'react-resizable';
import type { TransactionMember } from '../types';
import { useTransactionMembers } from '../hooks';
import { HelperStorage } from '@cyoda/http-api-react';
import { ResizableTitle } from './ResizableTitle';
import './TransactionMembersTable.scss';

const { Search } = Input;
const { Option } = Select;

interface TransactionMembersTableProps {
  transactionId: string;
}

export default function TransactionMembersTable({ transactionId }: TransactionMembersTableProps) {
  const storage = useMemo(() => new HelperStorage(), []);

  const [filters, setFilters] = useState({
    entityType: undefined as string | undefined,
    operation: undefined as string | undefined,
    search: '',
  });

  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
  });

  // Column widths state
  const [columnWidths, setColumnWidths] = useState<Record<string, number>>(() => {
    const saved = storage.get('transactionMembers:columnWidths', {});
    const defaultWidths = {
      entityId: 200,
      entityType: 150,
      operation: 120,
      status: 120,
      timestamp: 180,
    };
    return saved && Object.keys(saved).length > 0 ? saved : defaultWidths;
  });

  // Save column widths to localStorage
  useEffect(() => {
    if (Object.keys(columnWidths).length > 0) {
      storage.set('transactionMembers:columnWidths', columnWidths);
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

  const { data: response, isLoading, error } = useTransactionMembers(transactionId, {
    entityType: filters.entityType,
    operation: filters.operation,
    pageNum: pagination.current,
    pageSize: pagination.pageSize,
  });

  // Extract rows from response (API returns { rows: [], firstPage: boolean, lastPage: boolean })
  const data = useMemo(() => {
    if (!response) return [];
    // If response is an array, use it directly
    if (Array.isArray(response)) return response;
    // If response has rows property, use that
    if (response && typeof response === 'object' && 'rows' in response) {
      return (response as any).rows || [];
    }
    return [];
  }, [response]);

  const columns: ColumnsType<TransactionMember> = useMemo(() => [
    {
      title: 'Entity ID',
      dataIndex: 'entityId',
      key: 'entityId',
      width: columnWidths.entityId,
      ellipsis: true,
      onHeaderCell: () => ({
        width: columnWidths.entityId,
        onResize: handleResize('entityId'),
      }),
    },
    {
      title: 'Entity Type',
      dataIndex: 'entityType',
      key: 'entityType',
      width: columnWidths.entityType,
      filters: [
        { text: 'BUSINESS', value: 'BUSINESS' },
        { text: 'TECHNICAL', value: 'TECHNICAL' },
        { text: 'REFERENCE', value: 'REFERENCE' },
      ],
      onFilter: (value, record) => record.entityType === value,
      onHeaderCell: () => ({
        width: columnWidths.entityType,
        onResize: handleResize('entityType'),
      }),
    },
    {
      title: 'Operation',
      dataIndex: 'operation',
      key: 'operation',
      width: columnWidths.operation,
      render: (operation: string) => {
        const color = operation === 'CREATE' ? 'green' :
                     operation === 'UPDATE' ? 'blue' :
                     operation === 'DELETE' ? 'red' : 'default';
        return <Tag color={color}>{operation}</Tag>;
      },
      onHeaderCell: () => ({
        width: columnWidths.operation,
        onResize: handleResize('operation'),
      }),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: columnWidths.status,
      render: (status: string) => {
        const color = status === 'COMPLETED' ? 'success' :
                     status === 'FAILED' ? 'error' :
                     status === 'PENDING' ? 'warning' : 'default';
        return <Tag color={color}>{status}</Tag>;
      },
      onHeaderCell: () => ({
        width: columnWidths.status,
        onResize: handleResize('status'),
      }),
    },
    {
      title: 'Timestamp',
      dataIndex: 'timestamp',
      key: 'timestamp',
      width: columnWidths.timestamp,
      render: (timestamp: string) => new Date(timestamp).toLocaleString(),
      sorter: (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime(),
      onHeaderCell: () => ({
        width: columnWidths.timestamp,
        onResize: handleResize('timestamp'),
      }),
    },
  ], [columnWidths, handleResize]);

  const handleTableChange = (newPagination: any, filters: any, sorter: any) => {
    setPagination({
      current: newPagination.current,
      pageSize: newPagination.pageSize,
    });
  };

  const filteredData = useMemo(() => {
    return data?.filter((member) => {
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        return (
          member.entityId?.toLowerCase().includes(searchLower) ||
          member.entityType?.toLowerCase().includes(searchLower) ||
          member.operation?.toLowerCase().includes(searchLower)
        );
      }
      return true;
    });
  }, [data, filters.search]);

  return (
    <div>
      <Space style={{ marginBottom: 16 }} wrap>
        <Search
          placeholder="Search members..."
          allowClear
          style={{ width: 250 }}
          onSearch={(value) => setFilters({ ...filters, search: value })}
          onChange={(e) => setFilters({ ...filters, search: e.target.value })}
        />

        <Select
          placeholder="Entity Type"
          allowClear
          style={{ width: 150 }}
          onChange={(value) => setFilters({ ...filters, entityType: value })}
        >
          <Option value="BUSINESS">BUSINESS</Option>
          <Option value="TECHNICAL">TECHNICAL</Option>
          <Option value="REFERENCE">REFERENCE</Option>
        </Select>

        <Select
          placeholder="Operation"
          allowClear
          style={{ width: 120 }}
          onChange={(value) => setFilters({ ...filters, operation: value })}
        >
          <Option value="CREATE">CREATE</Option>
          <Option value="UPDATE">UPDATE</Option>
          <Option value="DELETE">DELETE</Option>
        </Select>
      </Space>

      <Table
        columns={columns}
        dataSource={filteredData}
        loading={isLoading}
        rowKey="id"
        components={{
          header: {
            cell: ResizableTitle,
          },
        }}
        locale={{
          emptyText: 'No transaction members found',
        }}
        pagination={{
          ...pagination,
          total: filteredData?.length || 0,
          showSizeChanger: true,
          showTotal: (total) => `Total ${total} members`,
          position: ['bottomCenter'],
        }}
        onChange={handleTableChange}
        scroll={{ x: 800 }}
      />
    </div>
  );
}


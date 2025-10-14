/**
 * Transaction Members Table Component
 * Displays transaction members with filtering and pagination
 */

import { useState } from 'react';
import { Table, Input, Select, Space, Tag } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import type { TransactionMember } from '../types';
import { useTransactionMembers } from '../hooks';

const { Search } = Input;
const { Option } = Select;

interface TransactionMembersTableProps {
  transactionId: string;
}

export default function TransactionMembersTable({ transactionId }: TransactionMembersTableProps) {
  const [filters, setFilters] = useState({
    entityType: undefined as string | undefined,
    operation: undefined as string | undefined,
    search: '',
  });

  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
  });

  const { data, isLoading } = useTransactionMembers(transactionId, {
    entityType: filters.entityType,
    operation: filters.operation,
    pageNum: pagination.current,
    pageSize: pagination.pageSize,
  });

  const columns: ColumnsType<TransactionMember> = [
    {
      title: 'Entity ID',
      dataIndex: 'entityId',
      key: 'entityId',
      width: 200,
      ellipsis: true,
    },
    {
      title: 'Entity Type',
      dataIndex: 'entityType',
      key: 'entityType',
      width: 150,
      filters: [
        { text: 'BUSINESS', value: 'BUSINESS' },
        { text: 'TECHNICAL', value: 'TECHNICAL' },
        { text: 'REFERENCE', value: 'REFERENCE' },
      ],
      onFilter: (value, record) => record.entityType === value,
    },
    {
      title: 'Operation',
      dataIndex: 'operation',
      key: 'operation',
      width: 120,
      render: (operation: string) => {
        const color = operation === 'CREATE' ? 'green' : 
                     operation === 'UPDATE' ? 'blue' : 
                     operation === 'DELETE' ? 'red' : 'default';
        return <Tag color={color}>{operation}</Tag>;
      },
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (status: string) => {
        const color = status === 'COMPLETED' ? 'success' : 
                     status === 'FAILED' ? 'error' : 
                     status === 'PENDING' ? 'warning' : 'default';
        return <Tag color={color}>{status}</Tag>;
      },
    },
    {
      title: 'Timestamp',
      dataIndex: 'timestamp',
      key: 'timestamp',
      width: 180,
      render: (timestamp: string) => new Date(timestamp).toLocaleString(),
      sorter: (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime(),
    },
  ];

  const handleTableChange = (newPagination: any, filters: any, sorter: any) => {
    setPagination({
      current: newPagination.current,
      pageSize: newPagination.pageSize,
    });
  };

  const filteredData = data?.filter((member) => {
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
        pagination={{
          ...pagination,
          total: filteredData?.length || 0,
          showSizeChanger: true,
          showTotal: (total) => `Total ${total} members`,
        }}
        onChange={handleTableChange}
        scroll={{ x: 800 }}
      />
    </div>
  );
}


/**
 * Transaction Events Table Component
 * Displays transaction events with filtering
 */

import { useState } from 'react';
import { Table, Input, Select, Space, Tag, Button, Modal } from 'antd';
import { EyeOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import type { TransactionEvent } from '../types';
import { useTransactionEvents } from '../hooks';

const { Search } = Input;
const { Option } = Select;

interface TransactionEventsTableProps {
  transactionId: string;
}

export default function TransactionEventsTable({ transactionId }: TransactionEventsTableProps) {
  const [filters, setFilters] = useState({
    eventType: undefined as string | undefined,
    search: '',
  });

  const [selectedEvent, setSelectedEvent] = useState<TransactionEvent | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);

  const { data, isLoading } = useTransactionEvents(transactionId, {
    eventType: filters.eventType,
  });

  const showEventDetails = (event: TransactionEvent) => {
    setSelectedEvent(event);
    setIsModalVisible(true);
  };

  const columns: ColumnsType<TransactionEvent> = [
    {
      title: 'Event Type',
      dataIndex: 'eventType',
      key: 'eventType',
      width: 200,
      filters: [
        { text: 'STARTED', value: 'STARTED' },
        { text: 'COMPLETED', value: 'COMPLETED' },
        { text: 'FAILED', value: 'FAILED' },
        { text: 'ROLLBACK', value: 'ROLLBACK' },
      ],
      onFilter: (value, record) => record.eventType === value,
    },
    {
      title: 'Timestamp',
      dataIndex: 'timestamp',
      key: 'timestamp',
      width: 180,
      render: (timestamp: string) => new Date(timestamp).toLocaleString(),
      sorter: (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime(),
      defaultSortOrder: 'descend',
    },
    {
      title: 'Status',
      key: 'status',
      width: 120,
      render: (_, record) => {
        if (record.error) {
          return <Tag color="error">ERROR</Tag>;
        }
        return <Tag color="success">SUCCESS</Tag>;
      },
    },
    {
      title: 'Error',
      dataIndex: 'error',
      key: 'error',
      width: 200,
      ellipsis: true,
      render: (error: string) => error || '-',
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 100,
      render: (_, record) => (
        <Button
          type="link"
          icon={<EyeOutlined />}
          onClick={() => showEventDetails(record)}
        >
          Details
        </Button>
      ),
    },
  ];

  const filteredData = data?.filter((event) => {
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      return (
        event.eventType?.toLowerCase().includes(searchLower) ||
        event.error?.toLowerCase().includes(searchLower)
      );
    }
    return true;
  });

  return (
    <div>
      <Space style={{ marginBottom: 16 }} wrap>
        <Search
          placeholder="Search events..."
          allowClear
          style={{ width: 250 }}
          onSearch={(value) => setFilters({ ...filters, search: value })}
          onChange={(e) => setFilters({ ...filters, search: e.target.value })}
        />
        
        <Select
          placeholder="Event Type"
          allowClear
          style={{ width: 150 }}
          onChange={(value) => setFilters({ ...filters, eventType: value })}
        >
          <Option value="STARTED">STARTED</Option>
          <Option value="COMPLETED">COMPLETED</Option>
          <Option value="FAILED">FAILED</Option>
          <Option value="ROLLBACK">ROLLBACK</Option>
        </Select>
      </Space>

      <Table
        columns={columns}
        dataSource={filteredData}
        loading={isLoading}
        rowKey="id"
        pagination={{
          pageSize: 10,
          showSizeChanger: true,
          showTotal: (total) => `Total ${total} events`,
        }}
        scroll={{ x: 800 }}
      />

      <Modal
        title="Event Details"
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setIsModalVisible(false)}>
            Close
          </Button>,
        ]}
        width={700}
      >
        {selectedEvent && (
          <div>
            <p><strong>Event Type:</strong> {selectedEvent.eventType}</p>
            <p><strong>Timestamp:</strong> {new Date(selectedEvent.timestamp).toLocaleString()}</p>
            {selectedEvent.error && (
              <p><strong>Error:</strong> <span style={{ color: 'red' }}>{selectedEvent.error}</span></p>
            )}
            {selectedEvent.data && (
              <div>
                <strong>Data:</strong>
                <pre style={{ 
                  background: '#f5f5f5', 
                  padding: '12px', 
                  borderRadius: '4px',
                  maxHeight: '300px',
                  overflow: 'auto'
                }}>
                  {JSON.stringify(selectedEvent.data, null, 2)}
                </pre>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}


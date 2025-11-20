/**
 * Transaction Events Table Component
 * Displays transaction events with filtering
 */

import { useState, useMemo, useEffect, useCallback } from 'react';
import { Table, Input, Select, Space, Tag, Button, Modal } from 'antd';
import { EyeOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import type { ResizeCallbackData } from 'react-resizable';
import type { TransactionEvent } from '../types';
import { useTransactionEvents } from '../hooks';
import { HelperStorage } from '@cyoda/http-api-react';
import { ResizableTitle } from './ResizableTitle';
import './TransactionEventsTable.scss';

const { Search } = Input;
const { Option } = Select;

interface TransactionEventsTableProps {
  transactionId: string;
}

export default function TransactionEventsTable({ transactionId }: TransactionEventsTableProps) {
  const storage = useMemo(() => new HelperStorage(), []);

  const [filters, setFilters] = useState({
    eventType: undefined as string | undefined,
    search: '',
  });

  const [selectedEvent, setSelectedEvent] = useState<TransactionEvent | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);

  // Column widths state
  const [columnWidths, setColumnWidths] = useState<Record<string, number>>(() => {
    const saved = storage.get('transactionEvents:columnWidths', {});
    const defaultWidths = {
      eventType: 200,
      timestamp: 180,
      status: 120,
      error: 200,
      actions: 100,
    };
    return saved && Object.keys(saved).length > 0 ? saved : defaultWidths;
  });

  // Save column widths to localStorage
  useEffect(() => {
    if (Object.keys(columnWidths).length > 0) {
      storage.set('transactionEvents:columnWidths', columnWidths);
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

  const { data: response, isLoading } = useTransactionEvents(transactionId, {
    eventType: filters.eventType,
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

  const showEventDetails = (event: TransactionEvent) => {
    setSelectedEvent(event);
    setIsModalVisible(true);
  };

  const columns: ColumnsType<TransactionEvent> = useMemo(() => [
    {
      title: 'Event Type',
      dataIndex: 'eventType',
      key: 'eventType',
      width: columnWidths.eventType,
      filters: [
        { text: 'STARTED', value: 'STARTED' },
        { text: 'COMPLETED', value: 'COMPLETED' },
        { text: 'FAILED', value: 'FAILED' },
        { text: 'ROLLBACK', value: 'ROLLBACK' },
      ],
      onFilter: (value, record) => record.eventType === value,
      onHeaderCell: () => ({
        width: columnWidths.eventType,
        onResize: handleResize('eventType'),
      }),
    },
    {
      title: 'Timestamp',
      dataIndex: 'timestamp',
      key: 'timestamp',
      width: columnWidths.timestamp,
      render: (timestamp: string) => new Date(timestamp).toLocaleString(),
      sorter: (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime(),
      defaultSortOrder: 'descend',
      onHeaderCell: () => ({
        width: columnWidths.timestamp,
        onResize: handleResize('timestamp'),
      }),
    },
    {
      title: 'Status',
      key: 'status',
      width: columnWidths.status,
      render: (_, record) => {
        if (record.error) {
          return <Tag color="error">ERROR</Tag>;
        }
        return <Tag color="success">SUCCESS</Tag>;
      },
      onHeaderCell: () => ({
        width: columnWidths.status,
        onResize: handleResize('status'),
      }),
    },
    {
      title: 'Error',
      dataIndex: 'error',
      key: 'error',
      width: columnWidths.error,
      ellipsis: true,
      render: (error: string) => error || '-',
      onHeaderCell: () => ({
        width: columnWidths.error,
        onResize: handleResize('error'),
      }),
    },
    {
      title: 'Actions',
      key: 'actions',
      width: columnWidths.actions,
      render: (_, record) => (
        <Button
          type="link"
          icon={<EyeOutlined />}
          onClick={() => showEventDetails(record)}
        >
          Details
        </Button>
      ),
      onHeaderCell: () => ({
        width: columnWidths.actions,
        onResize: handleResize('actions'),
      }),
    },
  ], [columnWidths, handleResize, showEventDetails]);

  const filteredData = useMemo(() => {
    return data?.filter((event) => {
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        return (
          event.eventType?.toLowerCase().includes(searchLower) ||
          event.error?.toLowerCase().includes(searchLower)
        );
      }
      return true;
    });
  }, [data, filters.search]);

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
        components={{
          header: {
            cell: ResizableTitle,
          },
        }}
        locale={{
          emptyText: 'No transaction events found',
        }}
        pagination={{
          pageSize: 10,
          showSizeChanger: true,
          showTotal: (total) => `Total ${total} events`,
          position: ['bottomCenter'],
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


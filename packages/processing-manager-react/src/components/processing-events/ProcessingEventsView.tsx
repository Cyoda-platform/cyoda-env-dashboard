/**
 * Processing Events View Component
 * Migrated from @cyoda/processing-manager/src/components/PmShardsDetailTab/ProcessingEvents/PmProcessingEventsView.vue
 */

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Form, Select, DatePicker, Button, Table, Row, Col, Spin, Card } from 'antd';
import { SyncOutlined } from '@ant-design/icons';
import { Link, useParams } from 'react-router-dom';
import { useProcessingQueueEvents, useSummary, useProcessingQueues } from '../../hooks';
import dayjs from 'dayjs';
import type { ColumnsType } from 'antd/es/table';
import type { ResizeCallbackData } from 'react-resizable';
import { HelperStorage } from '@cyoda/http-api-react';
import { ResizableTitle } from '../ResizableTitle';
import './ProcessingEventsView.scss';

interface ProcessingEvent {
  createTime: string;
  doneTime: string;
  errorTime: string;
  queue: string;
  shard: number;
  status: string;
  timeUUID: string;
  entityClassName: string;
  entityId: string;
  hasErrors: string;
  errorEventTimeUUID: string;
  coreDataClassName: string;
  clientDataClassName: string;
}

interface Filters {
  queue?: string;
  shard?: string;
  status?: string;
  from?: string;
  to?: string;
}

const createUniqMap = (key: string, data: any[]) => {
  const uniqueValues = [...new Set(data.map((item) => item[key]))];
  return uniqueValues.map((value) => ({ value, label: value }));
};

export const ProcessingEventsView: React.FC = () => {
  const { name } = useParams<{ name: string }>();
  const storage = useMemo(() => new HelperStorage(), []);
  const [filters, setFilters] = useState<Filters>({
    from: dayjs().startOf('day').format('YYYY-MM-DD HH:mm:ss'),
    to: dayjs().endOf('day').format('YYYY-MM-DD HH:mm:ss'),
  });

  const { data: eventsData, isLoading } = useProcessingQueueEvents(filters);
  const { data: summaryData } = useSummary({});
  const { data: queuesData } = useProcessingQueues({});

  // Column widths state
  const [columnWidths, setColumnWidths] = useState<Record<string, number>>(() => {
    const saved = storage.get('processingEventsView:columnWidths', {});
    const defaultWidths = {
      createTime: 300,
      doneTime: 300,
      errorTime: 130,
      queue: 300,
      shard: 200,
      status: 400,
      timeUUID: 400,
      entityClassName: 400,
      entityId: 400,
      hasErrors: 400,
      errorEventTimeUUID: 400,
      coreDataClassName: 400,
      clientDataClassName: 400,
    };
    return saved && Object.keys(saved).length > 0 ? saved : defaultWidths;
  });

  // Save column widths to localStorage
  useEffect(() => {
    if (Object.keys(columnWidths).length > 0) {
      storage.set('processingEventsView:columnWidths', columnWidths);
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

  // Debug: Log what queuesData actually is
  React.useEffect(() => {
    console.log('🔍 queuesData received:', queuesData);
    console.log('🔍 queuesData type:', typeof queuesData);
    console.log('🔍 queuesData isArray:', Array.isArray(queuesData));
    if (Array.isArray(queuesData) && queuesData.length > 0) {
      console.log('🔍 First queue item:', queuesData[0]);
      console.log('🔍 First queue item type:', typeof queuesData[0]);
    }
  }, [queuesData]);

  const tableData: ProcessingEvent[] = useMemo(() => {
    if (!eventsData || !Array.isArray(eventsData)) return [];
    return eventsData.map((el: any) => ({
      createTime: el.createTime,
      doneTime: el.doneTime,
      errorTime: el.errorTime || '',
      queue: el.queueName,
      shard: Number(el.shardId),
      status: el.status,
      timeUUID: el.timeUUID,
      entityClassName: el.entityClassName,
      entityId: el.entityId,
      hasErrors: el.entityHasErrors ? 'Yes' : 'No',
      errorEventTimeUUID: el.errorEventTimeUUID || '',
      coreDataClassName: el.coreDataClassName || '',
      clientDataClassName: el.clientDataClassName || '',
    }));
  }, [eventsData]);

  const queueOptions = useMemo(() => {
    if (!queuesData || !Array.isArray(queuesData)) {
      console.warn('⚠️ queuesData is not an array:', queuesData);
      return [];
    }
    // Ensure all items are strings
    const validQueues = queuesData.filter(q => typeof q === 'string');
    if (validQueues.length !== queuesData.length) {
      console.error('❌ Some queue items are not strings:', queuesData);
    }
    return validQueues;
  }, [queuesData]);

  const shardOptions = useMemo(() => {
    if (!summaryData?.actualShards) return [];
    return summaryData.actualShards.map((el: any) => Number(el.shardId));
  }, [summaryData]);

  const statusOptions = useMemo(() => {
    return createUniqMap('status', tableData);
  }, [tableData]);

  const isDisableFilter = useMemo(() => {
    return !filters.queue && !filters.shard && !filters.status;
  }, [filters]);

  const handleFilterChange = (key: string, value: any) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleDateChange = (field: 'from' | 'to', date: any) => {
    const value = date ? dayjs(date).format('YYYY-MM-DD HH:mm:ss') : '';
    setFilters((prev) => ({ ...prev, [field]: value }));
  };

  const resetFilter = () => {
    setFilters({
      from: dayjs().startOf('day').format('YYYY-MM-DD HH:mm:ss'),
      to: dayjs().endOf('day').format('YYYY-MM-DD HH:mm:ss'),
    });
  };

  const columns: ColumnsType<ProcessingEvent> = useMemo(() => [
    {
      title: 'Create Time',
      dataIndex: 'createTime',
      key: 'createTime',
      width: columnWidths.createTime,
      fixed: 'left',
      sorter: (a, b) => a.createTime.localeCompare(b.createTime),
      onHeaderCell: () => ({
        width: columnWidths.createTime,
        onResize: handleResize('createTime'),
      }),
    },
    {
      title: 'Done Time',
      dataIndex: 'doneTime',
      key: 'doneTime',
      width: columnWidths.doneTime,
      sorter: (a, b) => a.doneTime.localeCompare(b.doneTime),
      onHeaderCell: () => ({
        width: columnWidths.doneTime,
        onResize: handleResize('doneTime'),
      }),
    },
    {
      title: 'Error Time',
      dataIndex: 'errorTime',
      key: 'errorTime',
      width: columnWidths.errorTime,
      sorter: (a, b) => a.errorTime.localeCompare(b.errorTime),
      onHeaderCell: () => ({
        width: columnWidths.errorTime,
        onResize: handleResize('errorTime'),
      }),
    },
    {
      title: 'Queue',
      dataIndex: 'queue',
      key: 'queue',
      width: columnWidths.queue,
      sorter: (a, b) => a.queue.localeCompare(b.queue),
      onHeaderCell: () => ({
        width: columnWidths.queue,
        onResize: handleResize('queue'),
      }),
    },
    {
      title: 'Shard',
      dataIndex: 'shard',
      key: 'shard',
      width: columnWidths.shard,
      sorter: (a, b) => a.shard - b.shard,
      onHeaderCell: () => ({
        width: columnWidths.shard,
        onResize: handleResize('shard'),
      }),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: columnWidths.status,
      sorter: (a, b) => a.status.localeCompare(b.status),
      onHeaderCell: () => ({
        width: columnWidths.status,
        onResize: handleResize('status'),
      }),
    },
    {
      title: 'Time UUID',
      dataIndex: 'timeUUID',
      key: 'timeUUID',
      width: columnWidths.timeUUID,
      sorter: (a, b) => a.timeUUID.localeCompare(b.timeUUID),
      onHeaderCell: () => ({
        width: columnWidths.timeUUID,
        onResize: handleResize('timeUUID'),
      }),
      render: (timeUUID: string, record: ProcessingEvent) => (
        <Link to={`/nodes/${name}/event-view?queue=${record.entityClassName}&shard=${record.shard}&timeUUID=${timeUUID}`}>
          {timeUUID}
        </Link>
      ),
    },
    {
      title: 'Entity Class',
      dataIndex: 'entityClassName',
      key: 'entityClassName',
      width: columnWidths.entityClassName,
      sorter: (a, b) => a.entityClassName.localeCompare(b.entityClassName),
      onHeaderCell: () => ({
        width: columnWidths.entityClassName,
        onResize: handleResize('entityClassName'),
      }),
    },
    {
      title: 'Entity ID',
      dataIndex: 'entityId',
      key: 'entityId',
      width: columnWidths.entityId,
      sorter: (a, b) => a.entityId.localeCompare(b.entityId),
      onHeaderCell: () => ({
        width: columnWidths.entityId,
        onResize: handleResize('entityId'),
      }),
    },
    {
      title: 'Has Errors',
      dataIndex: 'hasErrors',
      key: 'hasErrors',
      width: columnWidths.hasErrors,
      sorter: (a, b) => a.hasErrors.localeCompare(b.hasErrors),
      onHeaderCell: () => ({
        width: columnWidths.hasErrors,
        onResize: handleResize('hasErrors'),
      }),
    },
    {
      title: 'Error Event Time UUID',
      dataIndex: 'errorEventTimeUUID',
      key: 'errorEventTimeUUID',
      width: columnWidths.errorEventTimeUUID,
      sorter: (a, b) => a.errorEventTimeUUID.localeCompare(b.errorEventTimeUUID),
      onHeaderCell: () => ({
        width: columnWidths.errorEventTimeUUID,
        onResize: handleResize('errorEventTimeUUID'),
      }),
    },
    {
      title: 'Core Event Data Class',
      dataIndex: 'coreDataClassName',
      key: 'coreDataClassName',
      width: columnWidths.coreDataClassName,
      sorter: (a, b) => a.coreDataClassName.localeCompare(b.coreDataClassName),
      onHeaderCell: () => ({
        width: columnWidths.coreDataClassName,
        onResize: handleResize('coreDataClassName'),
      }),
    },
    {
      title: 'Client Event Data Class',
      dataIndex: 'clientDataClassName',
      key: 'clientDataClassName',
      width: columnWidths.clientDataClassName,
      sorter: (a, b) => a.clientDataClassName.localeCompare(b.clientDataClassName),
      onHeaderCell: () => ({
        width: columnWidths.clientDataClassName,
        onResize: handleResize('clientDataClassName'),
      }),
    },
  ], [columnWidths, handleResize, name]);

  return (
    <div className="pm-processing-events-view">
      <Card>
        <Form layout="vertical" className="form-filter">
          <h3>Filter</h3>
          <Row gutter={20}>
            <Col span={6}>
              <Form.Item label="Queue">
                <Select
                  value={filters.queue}
                  onChange={(value) => handleFilterChange('queue', value)}
                  placeholder="Select queue"
                  allowClear
                  showSearch
                  options={queueOptions.map((q) => {
                    // Defensive: ensure q is a string
                    const queueValue = typeof q === 'string' ? q : String(q);
                    return { value: queueValue, label: queueValue };
                  })}
                />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item label="Shard">
                <Select
                  value={filters.shard}
                  onChange={(value) => handleFilterChange('shard', value)}
                  placeholder="Select shard"
                  allowClear
                  showSearch
                  options={shardOptions.map((s) => ({ value: s, label: s }))}
                />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item label="Event Status">
                <Select
                  value={filters.status}
                  onChange={(value) => handleFilterChange('status', value)}
                  placeholder="Select status"
                  allowClear
                  showSearch
                  options={statusOptions}
                />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={20}>
            <Col span={6}>
              <Form.Item label="Time From">
                <DatePicker
                  showTime
                  format="YYYY-MM-DD HH:mm:ss"
                  value={filters.from ? dayjs(filters.from) : null}
                  onChange={(date) => handleDateChange('from', date)}
                  placeholder="Pick a day"
                  style={{ width: '100%' }}
                />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item label="Time To">
                <DatePicker
                  showTime
                  format="YYYY-MM-DD HH:mm:ss"
                  value={filters.to ? dayjs(filters.to) : null}
                  onChange={(date) => handleDateChange('to', date)}
                  placeholder="Pick a day"
                  style={{ width: '100%' }}
                />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item label=" ">
                <Button
                  className="reset-button"
                  disabled={isDisableFilter}
                  onClick={resetFilter}
                  icon={<SyncOutlined />}
                >
                  Reset Filter
                </Button>
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Card>

      <Table
        columns={columns}
        dataSource={tableData}
        rowKey="timeUUID"
        loading={isLoading}
        bordered
        scroll={{ x: 3000 }}
        pagination={{
          pageSizeOptions: ['5', '10', '15', '20', '50'],
          showSizeChanger: true,
          defaultPageSize: 10,
          showTotal: (total) => `Total ${total}`,
          position: ['bottomCenter'],
        }}
        components={{
          header: {
            cell: ResizableTitle,
          },
        }}
      />
    </div>
  );
};

export default ProcessingEventsView;


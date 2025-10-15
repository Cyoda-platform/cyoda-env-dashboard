/**
 * Processing Events View Component
 * Migrated from @cyoda/processing-manager/src/components/PmShardsDetailTab/ProcessingEvents/PmProcessingEventsView.vue
 */

import React, { useState, useEffect, useMemo } from 'react';
import { Form, Select, DatePicker, Button, Table, Row, Col, Spin, Card } from 'antd';
import { SyncOutlined } from '@ant-design/icons';
import { Link, useParams } from 'react-router-dom';
import { useProcessingQueueEvents, useSummary, useProcessingQueues } from '../../hooks';
import dayjs from 'dayjs';
import type { ColumnsType } from 'antd/es/table';
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
  const [filters, setFilters] = useState<Filters>({
    from: dayjs().startOf('day').format('YYYY-MM-DD HH:mm:ss'),
    to: dayjs().endOf('day').format('YYYY-MM-DD HH:mm:ss'),
  });

  const { data: eventsData, isLoading } = useProcessingQueueEvents(filters);
  const { data: summaryData } = useSummary({});
  const { data: queuesData } = useProcessingQueues({});

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
    if (!queuesData || !Array.isArray(queuesData)) return [];
    return queuesData;
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

  const columns: ColumnsType<ProcessingEvent> = [
    {
      title: 'Create Time',
      dataIndex: 'createTime',
      key: 'createTime',
      width: 300,
      fixed: 'left',
      sorter: (a, b) => a.createTime.localeCompare(b.createTime),
    },
    {
      title: 'Done Time',
      dataIndex: 'doneTime',
      key: 'doneTime',
      width: 300,
      sorter: (a, b) => a.doneTime.localeCompare(b.doneTime),
    },
    {
      title: 'Error Time',
      dataIndex: 'errorTime',
      key: 'errorTime',
      width: 130,
      sorter: (a, b) => a.errorTime.localeCompare(b.errorTime),
    },
    {
      title: 'Queue',
      dataIndex: 'queue',
      key: 'queue',
      width: 300,
      sorter: (a, b) => a.queue.localeCompare(b.queue),
    },
    {
      title: 'Shard',
      dataIndex: 'shard',
      key: 'shard',
      width: 200,
      sorter: (a, b) => a.shard - b.shard,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: 400,
      sorter: (a, b) => a.status.localeCompare(b.status),
    },
    {
      title: 'Time UUID',
      dataIndex: 'timeUUID',
      key: 'timeUUID',
      width: 400,
      sorter: (a, b) => a.timeUUID.localeCompare(b.timeUUID),
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
      width: 400,
      sorter: (a, b) => a.entityClassName.localeCompare(b.entityClassName),
    },
    {
      title: 'Entity ID',
      dataIndex: 'entityId',
      key: 'entityId',
      width: 400,
      sorter: (a, b) => a.entityId.localeCompare(b.entityId),
    },
    {
      title: 'Has Errors',
      dataIndex: 'hasErrors',
      key: 'hasErrors',
      width: 400,
      sorter: (a, b) => a.hasErrors.localeCompare(b.hasErrors),
    },
    {
      title: 'Error Event Time UUID',
      dataIndex: 'errorEventTimeUUID',
      key: 'errorEventTimeUUID',
      width: 400,
      sorter: (a, b) => a.errorEventTimeUUID.localeCompare(b.errorEventTimeUUID),
    },
    {
      title: 'Core Event Data Class',
      dataIndex: 'coreDataClassName',
      key: 'coreDataClassName',
      width: 400,
      sorter: (a, b) => a.coreDataClassName.localeCompare(b.coreDataClassName),
    },
    {
      title: 'Client Event Data Class',
      dataIndex: 'clientDataClassName',
      key: 'clientDataClassName',
      width: 400,
      sorter: (a, b) => a.clientDataClassName.localeCompare(b.clientDataClassName),
    },
  ];

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
                  options={queueOptions.map((q) => ({ value: q, label: q }))}
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
              <Button
                className="reset-button"
                disabled={isDisableFilter}
                onClick={resetFilter}
                icon={<SyncOutlined />}
              >
                Reset Filter
              </Button>
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
        }}
      />
    </div>
  );
};

export default ProcessingEventsView;


/**
 * Process Events Statistics Component
 * Displays process events statistics with filtering
 * Migrated from @cyoda/processing-manager/src/components/PmShardsDetailTab/ProcessingEvents/PmProcessEventsStatistics.vue
 */

import React, { useState, useMemo } from 'react';
import { Table, Form, Select, Row, Col } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { useProcessEventsStats, useSummary, useProcessingQueueEvents } from '../../hooks/useProcessing';

interface ProcessEventStat {
  queue: string;
  shard: number;
  class: string;
  processor: string;
  count: number;
}

const createUniqMap = (prop: string, data: any[]): { label: string; value: any }[] => {
  const uniqueValues = Array.from(new Set(data.map(item => item[prop])));
  return uniqueValues.map(value => ({ label: String(value), value }));
};

export const ProcessEventsStatistics: React.FC = () => {
  const { data: statsData, isLoading: statsLoading } = useProcessEventsStats();
  const { data: summaryData } = useSummary();
  const { data: queuesData } = useProcessingQueueEvents();

  const [queueFilter, setQueueFilter] = useState<string | undefined>(undefined);
  const [shardFilter, setShardFilter] = useState<number | undefined>(undefined);
  const [classFilter, setClassFilter] = useState<string | undefined>(undefined);
  const [processorFilter, setProcessorFilter] = useState<string | undefined>(undefined);

  const tableData = useMemo(() => {
    if (!statsData) return [];
    return statsData.map((el: any) => {
      const { key } = el;
      return {
        queue: key.entityClass,
        shard: Number(key.shard),
        class: key.entityClass,
        count: el.count,
        processor: JSON.stringify(key.processor),
      };
    });
  }, [statsData]);

  const queueOptions = useMemo(() => {
    return queuesData || [];
  }, [queuesData]);

  const shardOptions = useMemo(() => {
    if (!summaryData?.actualShards) return [];
    return summaryData.actualShards.map((el: any) => ({
      label: String(el.shardId),
      value: Number(el.shardId),
    }));
  }, [summaryData]);

  const classOptions = useMemo(() => {
    return createUniqMap('class', tableData);
  }, [tableData]);

  const processorOptions = useMemo(() => {
    return createUniqMap('processor', tableData);
  }, [tableData]);

  const filteredData = useMemo(() => {
    return tableData.filter((row) => {
      const matchesQueue = !queueFilter || row.queue === queueFilter;
      const matchesShard = shardFilter === undefined || row.shard === shardFilter;
      const matchesClass = !classFilter || row.class === classFilter;
      const matchesProcessor = !processorFilter || row.processor === processorFilter;
      return matchesQueue && matchesShard && matchesClass && matchesProcessor;
    });
  }, [tableData, queueFilter, shardFilter, classFilter, processorFilter]);

  const columns: ColumnsType<ProcessEventStat> = [
    {
      title: 'Queue',
      dataIndex: 'queue',
      key: 'queue',
      width: 300,
      fixed: 'left',
      sorter: (a, b) => a.queue.localeCompare(b.queue),
    },
    {
      title: 'Shard',
      dataIndex: 'shard',
      key: 'shard',
      width: 300,
      sorter: (a, b) => a.shard - b.shard,
    },
    {
      title: 'Class',
      dataIndex: 'class',
      key: 'class',
      sorter: (a, b) => a.class.localeCompare(b.class),
    },
    {
      title: 'Processor',
      dataIndex: 'processor',
      key: 'processor',
      width: 300,
      sorter: (a, b) => a.processor.localeCompare(b.processor),
    },
    {
      title: 'Count',
      dataIndex: 'count',
      key: 'count',
      width: 100,
      sorter: (a, b) => a.count - b.count,
    },
  ];

  return (
    <div>
      <Form layout="vertical">
        <h3>Filter</h3>
        <Row gutter={20}>
          <Col span={6}>
            <Form.Item label="Queue">
              <Select
                value={queueFilter}
                onChange={setQueueFilter}
                placeholder="Select queue"
                allowClear
                showSearch
              >
                {queueOptions.map((item: string) => (
                  <Select.Option key={item} value={item}>
                    {item}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
          <Col span={6}>
            <Form.Item label="Shard">
              <Select
                value={shardFilter}
                onChange={setShardFilter}
                placeholder="Select shard"
                allowClear
                showSearch
                options={shardOptions}
              />
            </Form.Item>
          </Col>
          <Col span={6}>
            <Form.Item label="Class">
              <Select
                value={classFilter}
                onChange={setClassFilter}
                placeholder="Select class"
                allowClear
                showSearch
                options={classOptions}
              />
            </Form.Item>
          </Col>
          <Col span={6}>
            <Form.Item label="Processor">
              <Select
                value={processorFilter}
                onChange={setProcessorFilter}
                placeholder="Select processor"
                allowClear
                showSearch
                options={processorOptions}
              />
            </Form.Item>
          </Col>
        </Row>
      </Form>
      <Table
        columns={columns}
        dataSource={filteredData}
        rowKey={(record) => `${record.queue}-${record.shard}-${record.processor}`}
        bordered
        loading={statsLoading}
        scroll={{ x: 1200 }}
        pagination={{
          pageSizeOptions: ['5', '10', '15', '20', '50'],
          defaultPageSize: 10,
          showSizeChanger: true,
        }}
      />
    </div>
  );
};

export default ProcessEventsStatistics;


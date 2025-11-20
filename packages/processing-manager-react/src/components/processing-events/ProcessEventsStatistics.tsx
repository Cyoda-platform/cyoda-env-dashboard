/**
 * Process Events Statistics Component
 * Displays process events statistics with filtering
 * Migrated from @cyoda/processing-manager/src/components/PmShardsDetailTab/ProcessingEvents/PmProcessEventsStatistics.vue
 */

import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { Table, Form, Select, Row, Col } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import type { ResizeCallbackData } from 'react-resizable';
import { HelperStorage } from '@cyoda/http-api-react';
import { ResizableTitle } from '../ResizableTitle';
import { useProcessEventsStats, useSummary, useProcessingQueues } from '../../hooks/useProcessing';
import './ProcessEventsStatistics.scss';

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
  const storage = useMemo(() => new HelperStorage(), []);
  const { data: statsData, isLoading: statsLoading } = useProcessEventsStats({});
  const { data: summaryData } = useSummary({});
  const { data: queuesData } = useProcessingQueues({});

  const [queueFilter, setQueueFilter] = useState<string | undefined>(undefined);
  const [shardFilter, setShardFilter] = useState<number | undefined>(undefined);
  const [classFilter, setClassFilter] = useState<string | undefined>(undefined);
  const [processorFilter, setProcessorFilter] = useState<string | undefined>(undefined);

  const [columnWidths, setColumnWidths] = useState<Record<string, number>>(() => {
    const defaultWidths = { queue: 300, shard: 80, class: 300, processor: 300, count: 100 };
    // Always use default widths (ignore saved values for now)
    return defaultWidths;
  });

  useEffect(() => {
    if (Object.keys(columnWidths).length > 0) {
      storage.set('processEventsStats:columnWidths', columnWidths);
    }
  }, [columnWidths, storage]);

  const handleResize = useCallback((key: string) => {
    return (_: React.SyntheticEvent, { size }: ResizeCallbackData) => {
      setColumnWidths((prev) => {
        const oldWidth = prev[key];
        const newWidth = size.width;
        const delta = newWidth - oldWidth;
        const otherKeys = Object.keys(prev).filter(k => k !== key);
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

  const tableData = useMemo(() => {
    if (!statsData || !Array.isArray(statsData)) return [];
    return statsData.map((el: any) => {
      const { key } = el;
      return {
        queue: key.queue,
        shard: Number(key.shard),
        class: key.entityClass,
        count: el.count,
        processor: JSON.stringify(key.processor),
      };
    });
  }, [statsData]);

  const queueOptions = useMemo(() => {
    if (!queuesData || !Array.isArray(queuesData)) return [];
    // Ensure all items are strings (defensive programming)
    return queuesData.filter(q => typeof q === 'string');
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

  const columns: ColumnsType<ProcessEventStat> = useMemo(() => [
    {
      title: 'Queue',
      dataIndex: 'queue',
      key: 'queue',
      width: columnWidths.queue,
      fixed: 'left',
      sorter: (a, b) => a.queue.localeCompare(b.queue),
      onHeaderCell: () => ({ width: columnWidths.queue, onResize: handleResize('queue') }),
    },
    {
      title: 'Shard',
      dataIndex: 'shard',
      key: 'shard',
      width: columnWidths.shard,
      sorter: (a, b) => a.shard - b.shard,
      onHeaderCell: () => ({ width: columnWidths.shard, onResize: handleResize('shard') }),
    },
    {
      title: 'Class',
      dataIndex: 'class',
      key: 'class',
      width: columnWidths.class,
      sorter: (a, b) => a.class.localeCompare(b.class),
      onHeaderCell: () => ({ width: columnWidths.class, onResize: handleResize('class') }),
    },
    {
      title: 'Processor',
      dataIndex: 'processor',
      key: 'processor',
      width: columnWidths.processor,
      sorter: (a, b) => a.processor.localeCompare(b.processor),
      onHeaderCell: () => ({ width: columnWidths.processor, onResize: handleResize('processor') }),
    },
    {
      title: 'Count',
      dataIndex: 'count',
      key: 'count',
      width: columnWidths.count,
      sorter: (a, b) => a.count - b.count,
      onHeaderCell: () => ({ width: columnWidths.count, onResize: handleResize('count') }),
    },
  ], [columnWidths, handleResize]);

  return (
    <div className="process-events-statistics">
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
                popupClassName="process-events-statistics-dropdown"
                dropdownStyle={{ minWidth: '400px' }}
              >
                {queueOptions.map((item: string) => (
                  <Select.Option key={item} value={item} style={{ whiteSpace: 'normal', height: 'auto' }}>
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
                popupMatchSelectWidth={false}
                classNames={{ popup: 'process-events-statistics-dropdown' }}
                styles={{ popup: { minWidth: '400px' } }}
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
                popupMatchSelectWidth={false}
                classNames={{ popup: 'process-events-statistics-dropdown' }}
                styles={{ popup: { minWidth: '400px' } }}
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
                popupClassName="process-events-statistics-dropdown"
                dropdownStyle={{ minWidth: '400px' }}
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

export default ProcessEventsStatistics;


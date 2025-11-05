/**
 * Tasks Component
 * Displays running tasks with filtering capabilities
 * Migrated from @cyoda/processing-manager/src/components/PmShardsDetailTab/ProcessingManagers/PmTasks.vue
 */

import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { Card, Table, Form, Input, Select, Row, Col } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import type { ResizeCallbackData } from 'react-resizable';
import { HelperStorage } from '@cyoda/http-api-react';
import { ResizableTitle } from '../ResizableTitle';
import './Tasks.scss';

interface TaskEvent {
  id: string;
  shardId: number;
  queueName: string;
  processIds: string[];
}

interface TaskByEntity {
  id: string;
  events: TaskEvent[];
}

interface RunningTask {
  lastEntity: string;
  lastEventId: string;
  lastShard: number;
  lastQueue: string;
  lastProcesses: string;
}

interface TasksProps {
  tasksByEntity: TaskByEntity[];
  runningTaskCount: number;
  lastTaskFinishTime: string;
}

const createUniqMap = (prop: string, data: any[]): { label: string; value: any }[] => {
  const uniqueValues = Array.from(new Set(data.map(item => item[prop])));
  return uniqueValues.map(value => ({ label: String(value), value }));
};

export const Tasks: React.FC<TasksProps> = ({
  tasksByEntity,
  runningTaskCount,
  lastTaskFinishTime
}) => {
  const storage = useMemo(() => new HelperStorage(), []);

  const [searchValue, setSearchValue] = useState('');
  const [shardFilter, setShardFilter] = useState<number | undefined>(undefined);
  const [queueFilter, setQueueFilter] = useState<string | undefined>(undefined);

  // Column widths state
  const [columnWidths, setColumnWidths] = useState<Record<string, number>>(() => {
    const saved = storage.get('tasks:columnWidths', {});
    const defaultWidths = {
      lastEntity: 200,
      lastEventId: 200,
      lastShard: 120,
      lastQueue: 150,
      lastProcesses: 250,
    };
    return saved && Object.keys(saved).length > 0 ? saved : defaultWidths;
  });

  // Save column widths to localStorage
  useEffect(() => {
    if (Object.keys(columnWidths).length > 0) {
      storage.set('tasks:columnWidths', columnWidths);
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

  const runningTasksTable = useMemo(() => {
    return tasksByEntity.map((el) => {
      const event = el.events[0];
      return {
        lastEntity: event.id,
        lastEventId: el.id,
        lastShard: event.shardId,
        lastQueue: event.queueName,
        lastProcesses: JSON.stringify(event.processIds),
      };
    });
  }, [tasksByEntity]);

  const queueOptions = useMemo(() => {
    return createUniqMap('lastQueue', runningTasksTable);
  }, [runningTasksTable]);

  const shardOptions = useMemo(() => {
    return createUniqMap('lastShard', runningTasksTable);
  }, [runningTasksTable]);

  const filteredData = useMemo(() => {
    return runningTasksTable.filter((row) => {
      const matchesSearch = !searchValue || 
        row.lastEntity.toLowerCase().includes(searchValue.toLowerCase()) ||
        row.lastEventId.toLowerCase().includes(searchValue.toLowerCase()) ||
        row.lastProcesses.toLowerCase().includes(searchValue.toLowerCase());
      
      const matchesShard = shardFilter === undefined || row.lastShard === shardFilter;
      const matchesQueue = !queueFilter || row.lastQueue === queueFilter;

      return matchesSearch && matchesShard && matchesQueue;
    });
  }, [runningTasksTable, searchValue, shardFilter, queueFilter]);

  const columns: ColumnsType<RunningTask> = useMemo(() => [
    {
      title: 'Last Entity',
      dataIndex: 'lastEntity',
      key: 'lastEntity',
      width: columnWidths.lastEntity,
      fixed: 'left',
      sorter: (a, b) => a.lastEntity.localeCompare(b.lastEntity),
      onHeaderCell: () => ({
        width: columnWidths.lastEntity,
        onResize: handleResize('lastEntity'),
      }),
    },
    {
      title: 'Last EventId',
      dataIndex: 'lastEventId',
      key: 'lastEventId',
      width: columnWidths.lastEventId,
      sorter: (a, b) => a.lastEventId.localeCompare(b.lastEventId),
      onHeaderCell: () => ({
        width: columnWidths.lastEventId,
        onResize: handleResize('lastEventId'),
      }),
    },
    {
      title: 'Last Shard',
      dataIndex: 'lastShard',
      key: 'lastShard',
      width: columnWidths.lastShard,
      sorter: (a, b) => a.lastShard - b.lastShard,
      onHeaderCell: () => ({
        width: columnWidths.lastShard,
        onResize: handleResize('lastShard'),
      }),
    },
    {
      title: 'Last Queue',
      dataIndex: 'lastQueue',
      key: 'lastQueue',
      width: columnWidths.lastQueue,
      sorter: (a, b) => a.lastQueue.localeCompare(b.lastQueue),
      onHeaderCell: () => ({
        width: columnWidths.lastQueue,
        onResize: handleResize('lastQueue'),
      }),
    },
    {
      title: 'Last Processes',
      dataIndex: 'lastProcesses',
      key: 'lastProcesses',
      width: columnWidths.lastProcesses,
      sorter: (a, b) => a.lastProcesses.localeCompare(b.lastProcesses),
      onHeaderCell: () => ({
        width: columnWidths.lastProcesses,
        onResize: handleResize('lastProcesses'),
      }),
    },
  ], [columnWidths, handleResize]);

  return (
    <Card 
      title={
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span>Tasks (running now count {runningTaskCount})</span>
          <span>Last task finish time: {lastTaskFinishTime}</span>
        </div>
      }
      className="pm-tasks"
    >
      <Form layout="vertical">
        <h3>Filter</h3>
        <Row gutter={20}>
          <Col span={8}>
            <Form.Item label="Search">
              <Input
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                placeholder="Search"
                allowClear
              />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item label="Last Shard">
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
          <Col span={8}>
            <Form.Item label="Last Queue">
              <Select
                value={queueFilter}
                onChange={setQueueFilter}
                placeholder="Select queue"
                allowClear
                showSearch
                options={queueOptions}
              />
            </Form.Item>
          </Col>
        </Row>
      </Form>
      <Table
        columns={columns}
        dataSource={filteredData}
        rowKey="lastEventId"
        bordered
        components={{
          header: {
            cell: ResizableTitle,
          },
        }}
        scroll={{ x: 1400 }}
        pagination={{
          pageSizeOptions: ['5', '10', '15', '20', '50'],
          defaultPageSize: 10,
          showSizeChanger: true,
          position: ['bottomCenter'],
        }}
      />
    </Card>
  );
};

export default Tasks;


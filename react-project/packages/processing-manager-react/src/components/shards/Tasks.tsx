/**
 * Tasks Component
 * Displays running tasks with filtering capabilities
 * Migrated from @cyoda/processing-manager/src/components/PmShardsDetailTab/ProcessingManagers/PmTasks.vue
 */

import React, { useState, useMemo } from 'react';
import { Card, Table, Form, Input, Select, Row, Col } from 'antd';
import type { ColumnsType } from 'antd/es/table';
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
  const [searchValue, setSearchValue] = useState('');
  const [shardFilter, setShardFilter] = useState<number | undefined>(undefined);
  const [queueFilter, setQueueFilter] = useState<string | undefined>(undefined);

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

  const columns: ColumnsType<RunningTask> = [
    {
      title: 'Last Entity',
      dataIndex: 'lastEntity',
      key: 'lastEntity',
      width: 300,
      fixed: 'left',
      sorter: (a, b) => a.lastEntity.localeCompare(b.lastEntity),
    },
    {
      title: 'Last EventId',
      dataIndex: 'lastEventId',
      key: 'lastEventId',
      width: 300,
      sorter: (a, b) => a.lastEventId.localeCompare(b.lastEventId),
    },
    {
      title: 'Last Shard',
      dataIndex: 'lastShard',
      key: 'lastShard',
      width: 130,
      sorter: (a, b) => a.lastShard - b.lastShard,
    },
    {
      title: 'Last Queue',
      dataIndex: 'lastQueue',
      key: 'lastQueue',
      width: 300,
      sorter: (a, b) => a.lastQueue.localeCompare(b.lastQueue),
    },
    {
      title: 'Last Processes',
      dataIndex: 'lastProcesses',
      key: 'lastProcesses',
      width: 400,
      sorter: (a, b) => a.lastProcesses.localeCompare(b.lastProcesses),
    },
  ];

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
        scroll={{ x: 1400 }}
        pagination={{
          pageSizeOptions: ['5', '10', '15', '20', '50'],
          defaultPageSize: 10,
          showSizeChanger: true,
        }}
      />
    </Card>
  );
};

export default Tasks;


/**
 * Tasks Component
 * Migrated from @cyoda/processing-manager/src/components/PmShardsDetailTab/ProcessingManagers/PmTasks.vue
 */

import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { Card, Table, Form, Input, Select, Row, Col } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import type { ResizeCallbackData } from 'react-resizable';
import { HelperStorage } from '@cyoda/http-api-react';
import { ResizableTitle } from '../ResizableTitle';
import _ from 'lodash';
import './Tasks.scss';

interface TaskEvent {
  id: string;
  shardId: string;
  queueName: string;
  processIds: string[];
}

interface TaskByEntity {
  id: string;
  events: TaskEvent[];
}

interface TaskRow {
  lastEntity: string;
  lastEventId: string;
  lastShard: string;
  lastQueue: string;
  lastProcesses: string;
}

interface TasksProps {
  runningTaskCount: number;
  lastTaskFinishTime: string;
  tasksByEntity: TaskByEntity[];
}

export const Tasks: React.FC<TasksProps> = ({
  runningTaskCount = 0,
  lastTaskFinishTime = '',
  tasksByEntity = [],
}) => {
  const storage = useMemo(() => new HelperStorage(), []);
  const [searchValue, setSearchValue] = useState('');
  const [selectedShard, setSelectedShard] = useState<string>('');
  const [selectedQueue, setSelectedQueue] = useState<string>('');

  const [columnWidths, setColumnWidths] = useState<Record<string, number>>(() => {
    const saved = storage.get('pmTasks:columnWidths', {});
    const defaultWidths = {
      lastEntity: 300,
      lastEventId: 300,
      lastShard: 130,
      lastQueue: 300,
      lastProcesses: 400,
    };
    return saved && Object.keys(saved).length > 0 ? saved : defaultWidths;
  });

  useEffect(() => {
    if (Object.keys(columnWidths).length > 0) {
      storage.set('pmTasks:columnWidths', columnWidths);
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

  const createUniqMap = (prop: keyof TaskRow, data: TaskRow[]) => {
    const uniqValues = _.uniqBy(data, prop).map((el) => el[prop]);
    return uniqValues.map((value) => ({ label: value, value }));
  };

  const queueOptions = useMemo(() => {
    return createUniqMap('lastQueue', runningTasksTable);
  }, [runningTasksTable]);

  const shardOptions = useMemo(() => {
    return createUniqMap('lastShard', runningTasksTable);
  }, [runningTasksTable]);

  const filteredData = useMemo(() => {
    return runningTasksTable.filter((row) => {
      // Search filter
      const searchMatch =
        !searchValue ||
        row.lastEntity.toLowerCase().includes(searchValue.toLowerCase()) ||
        row.lastEventId.toLowerCase().includes(searchValue.toLowerCase()) ||
        row.lastProcesses.toLowerCase().includes(searchValue.toLowerCase());

      // Shard filter
      const shardMatch = !selectedShard || row.lastShard === selectedShard;

      // Queue filter
      const queueMatch = !selectedQueue || row.lastQueue === selectedQueue;

      return searchMatch && shardMatch && queueMatch;
    });
  }, [runningTasksTable, searchValue, selectedShard, selectedQueue]);

  const columns: ColumnsType<TaskRow> = useMemo(() => [
    {
      title: 'Last Entity',
      dataIndex: 'lastEntity',
      key: 'lastEntity',
      width: columnWidths.lastEntity,
      fixed: 'left',
      sorter: (a, b) => a.lastEntity.localeCompare(b.lastEntity),
      onHeaderCell: () => ({ width: columnWidths.lastEntity, onResize: handleResize('lastEntity') }),
    },
    {
      title: 'Last EventId',
      dataIndex: 'lastEventId',
      key: 'lastEventId',
      width: columnWidths.lastEventId,
      sorter: (a, b) => a.lastEventId.localeCompare(b.lastEventId),
      onHeaderCell: () => ({ width: columnWidths.lastEventId, onResize: handleResize('lastEventId') }),
    },
    {
      title: 'Last Shard',
      dataIndex: 'lastShard',
      key: 'lastShard',
      width: columnWidths.lastShard,
      sorter: (a, b) => a.lastShard.localeCompare(b.lastShard),
      onHeaderCell: () => ({ width: columnWidths.lastShard, onResize: handleResize('lastShard') }),
    },
    {
      title: 'Last Queue',
      dataIndex: 'lastQueue',
      key: 'lastQueue',
      width: columnWidths.lastQueue,
      sorter: (a, b) => a.lastQueue.localeCompare(b.lastQueue),
      onHeaderCell: () => ({ width: columnWidths.lastQueue, onResize: handleResize('lastQueue') }),
    },
    {
      title: 'Last Processes',
      dataIndex: 'lastProcesses',
      key: 'lastProcesses',
      width: columnWidths.lastProcesses,
      sorter: (a, b) => a.lastProcesses.localeCompare(b.lastProcesses),
      onHeaderCell: () => ({ width: columnWidths.lastProcesses, onResize: handleResize('lastProcesses') }),
    },
  ], [columnWidths, handleResize]);

  return (
    <Card
      className="pm-tasks"
      title={
        <div className="row justify-content-between">
          <div className="col-sm">Tasks (running now count {runningTaskCount})</div>
          <div className="col-auto">Last task finish time: {lastTaskFinishTime}</div>
        </div>
      }
    >
      <Form layout="vertical" className="filter-form">
        <h3>Filter</h3>
        <Row gutter={20}>
          <Col span={6}>
            <Form.Item label="Search">
              <Input
                allowClear
                placeholder="Search"
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
              />
            </Form.Item>
          </Col>
          <Col span={6}>
            <Form.Item label="Last Shard">
              <Select
                showSearch
                allowClear
                value={selectedShard}
                onChange={(value) => setSelectedShard(value || '')}
                options={shardOptions}
              />
            </Form.Item>
          </Col>
          <Col span={6}>
            <Form.Item label="Last Queue">
              <Select
                showSearch
                allowClear
                value={selectedQueue}
                onChange={(value) => setSelectedQueue(value || '')}
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
        pagination={{
          pageSizeOptions: ['5', '10', '15', '20', '50'],
          defaultPageSize: 10,
          showSizeChanger: true,
        }}
        scroll={{ x: 'max-content' }}
        components={{
          header: {
            cell: ResizableTitle,
          },
        }}
      />
    </Card>
  );
};

export default Tasks;


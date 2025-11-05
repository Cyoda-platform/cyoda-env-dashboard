/**
 * Events Table Component
 * Migrated from @cyoda/processing-manager/src/components/PmTransitionDetail/Events/EventsTable.vue
 */

import React, { useMemo, useState, useEffect, useCallback } from 'react';
import { Card, Table, Spin } from 'antd';
import { Link, useParams } from 'react-router-dom';
import type { ColumnsType } from 'antd/es/table';
import type { ResizeCallbackData } from 'react-resizable';
import { HelperStorage } from '@cyoda/http-api-react';
import { ResizableTitle } from '../ResizableTitle';
import './EventsTable.scss';

interface EventRow {
  createTime: string;
  doneTime: string;
  errorTime: string;
  totalTimeMillis: number;
  queueName: string;
  shardId: string;
  status: string;
  timeUUID: string;
  entityClassName: string;
  entityId: string;
  entityHasErrors: boolean;
  errorEventTimeUUID: string;
  coreDataClassName: string;
  versionCheckResult: string;
}

interface EventsTableProps {
  tableData: EventRow[];
  isLoading?: boolean;
}

export const EventsTable: React.FC<EventsTableProps> = ({ tableData, isLoading = false }) => {
  const { name } = useParams<{ name: string }>();
  const storage = useMemo(() => new HelperStorage(), []);

  // Column widths state
  const [columnWidths, setColumnWidths] = useState<Record<string, number>>(() => {
    const saved = storage.get('transitionDetailEvents:columnWidths', {});
    const defaultWidths = {
      createTime: 170,
      doneTime: 170,
      errorTime: 170,
      totalTimeMillis: 170,
      queueName: 400,
      shardId: 100,
      status: 200,
      timeUUID: 330,
      entityClassName: 350,
      entityId: 330,
      entityHasErrors: 150,
      errorEventTimeUUID: 330,
      coreDataClassName: 350,
      versionCheckResult: 350,
    };
    return saved && Object.keys(saved).length > 0 ? saved : defaultWidths;
  });

  // Save column widths to localStorage
  useEffect(() => {
    if (Object.keys(columnWidths).length > 0) {
      storage.set('transitionDetailEvents:columnWidths', columnWidths);
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

  const columns: ColumnsType<EventRow> = useMemo(() => [
    {
      title: 'Create Time',
      dataIndex: 'createTime',
      key: 'createTime',
      width: columnWidths.createTime,
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
      onHeaderCell: () => ({
        width: columnWidths.errorTime,
        onResize: handleResize('errorTime'),
      }),
    },
    {
      title: 'Total Time(ms)',
      dataIndex: 'totalTimeMillis',
      key: 'totalTimeMillis',
      width: columnWidths.totalTimeMillis,
      onHeaderCell: () => ({
        width: columnWidths.totalTimeMillis,
        onResize: handleResize('totalTimeMillis'),
      }),
    },
    {
      title: 'Queue',
      dataIndex: 'queueName',
      key: 'queueName',
      width: columnWidths.queueName,
      onHeaderCell: () => ({
        width: columnWidths.queueName,
        onResize: handleResize('queueName'),
      }),
    },
    {
      title: 'Shard',
      dataIndex: 'shardId',
      key: 'shardId',
      width: columnWidths.shardId,
      onHeaderCell: () => ({
        width: columnWidths.shardId,
        onResize: handleResize('shardId'),
      }),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: columnWidths.status,
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
      onHeaderCell: () => ({
        width: columnWidths.timeUUID,
        onResize: handleResize('timeUUID'),
      }),
      render: (timeUUID: string, record: EventRow) => (
        <Link
          to={`/nodes/${name}/event-view?queue=${record.queueName}&shard=${record.shardId}&timeUUID=${timeUUID}`}
        >
          {timeUUID}
        </Link>
      ),
    },
    {
      title: 'Entity Class',
      dataIndex: 'entityClassName',
      key: 'entityClassName',
      width: columnWidths.entityClassName,
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
      onHeaderCell: () => ({
        width: columnWidths.entityId,
        onResize: handleResize('entityId'),
      }),
    },
    {
      title: 'Has Errors',
      dataIndex: 'entityHasErrors',
      key: 'entityHasErrors',
      width: columnWidths.entityHasErrors,
      onHeaderCell: () => ({
        width: columnWidths.entityHasErrors,
        onResize: handleResize('entityHasErrors'),
      }),
      render: (hasErrors: boolean) => (hasErrors ? 'Yes' : 'No'),
    },
    {
      title: 'Error Event Time UUID',
      dataIndex: 'errorEventTimeUUID',
      key: 'errorEventTimeUUID',
      width: columnWidths.errorEventTimeUUID,
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
      onHeaderCell: () => ({
        width: columnWidths.coreDataClassName,
        onResize: handleResize('coreDataClassName'),
      }),
    },
    {
      title: 'Client Event Data Class',
      dataIndex: 'versionCheckResult',
      key: 'versionCheckResult',
      width: columnWidths.versionCheckResult,
      onHeaderCell: () => ({
        width: columnWidths.versionCheckResult,
        onResize: handleResize('versionCheckResult'),
      }),
    },
  ], [columnWidths, handleResize, name]);

  return (
    <Card title="Transaction Events" className="transition-detail-events-table">
      <Spin spinning={isLoading}>
        <Table
          columns={columns}
          dataSource={tableData}
          rowKey="timeUUID"
          bordered
          pagination={false}
          scroll={{ x: 'max-content' }}
          components={{
            header: {
              cell: ResizableTitle,
            },
          }}
        />
      </Spin>
    </Card>
  );
};

export default EventsTable;


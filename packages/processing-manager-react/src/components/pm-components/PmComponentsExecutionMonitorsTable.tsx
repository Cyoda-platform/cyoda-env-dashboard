/**
 * PM Components Execution Monitors Table
 * Migrated from @cyoda/processing-manager/src/components/PmShardsDetailTab/PmShardsDetailTabPmComponents/PmShardsDetailTabPmComponentsExecutionMonitors/PmShardsDetailTabPmComponentsExecutionMonitorsTable.vue
 */

import React, { useMemo, useState, useEffect, useCallback } from 'react';
import { Table } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import type { ResizeCallbackData } from 'react-resizable';
import { HelperStorage } from '@cyoda/http-api-react';
import { ResizableTitle } from '../ResizableTitle';
import './PmComponentsExecutionMonitorsTable.scss';

interface ExecutionMonitor {
  index: number;
  name: string;
  entityId: string;
  entityClass: string;
  expectedThreadsCount: number;
  lastAccessTime: string;
  processFinished: boolean;
  processingThreadsCount: number;
  finishedThreadsCount: number;
}

interface PmComponentsExecutionMonitorsTableProps {
  tableData: ExecutionMonitor[];
}

export const PmComponentsExecutionMonitorsTable: React.FC<PmComponentsExecutionMonitorsTableProps> = ({
  tableData = [],
}) => {
  const storage = useMemo(() => new HelperStorage(), []);

  // Column widths state
  const [columnWidths, setColumnWidths] = useState<Record<string, number>>(() => {
    const saved = storage.get('pmExecutionMonitors:columnWidths', {});
    const defaultWidths = {
      index: 200,
      name: 200,
      entityId: 200,
      entityClass: 200,
      expectedThreadsCount: 220,
      lastAccessTime: 200,
      processFinished: 180,
      processingThreadsCount: 220,
      finishedThreadsCount: 220,
    };
    return saved && Object.keys(saved).length > 0 ? saved : defaultWidths;
  });

  // Save column widths to localStorage
  useEffect(() => {
    if (Object.keys(columnWidths).length > 0) {
      storage.set('pmExecutionMonitors:columnWidths', columnWidths);
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

  const columns: ColumnsType<ExecutionMonitor> = useMemo(() => [
    {
      title: '№',
      dataIndex: 'index',
      key: 'index',
      width: columnWidths.index,
      fixed: 'left',
      sorter: (a, b) => a.index - b.index,
      onHeaderCell: () => ({
        width: columnWidths.index,
        onResize: handleResize('index'),
      }),
    },
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      width: columnWidths.name,
      sorter: (a, b) => a.name.localeCompare(b.name),
      onHeaderCell: () => ({
        width: columnWidths.name,
        onResize: handleResize('name'),
      }),
    },
    {
      title: 'EntityId',
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
      title: 'Entity Class',
      dataIndex: 'entityClass',
      key: 'entityClass',
      width: columnWidths.entityClass,
      sorter: (a, b) => a.entityClass.localeCompare(b.entityClass),
      onHeaderCell: () => ({
        width: columnWidths.entityClass,
        onResize: handleResize('entityClass'),
      }),
    },
    {
      title: 'ExpectedThreadsCount',
      dataIndex: 'expectedThreadsCount',
      key: 'expectedThreadsCount',
      width: columnWidths.expectedThreadsCount,
      sorter: (a, b) => a.expectedThreadsCount - b.expectedThreadsCount,
      onHeaderCell: () => ({
        width: columnWidths.expectedThreadsCount,
        onResize: handleResize('expectedThreadsCount'),
      }),
    },
    {
      title: 'LastAccessTime',
      dataIndex: 'lastAccessTime',
      key: 'lastAccessTime',
      width: columnWidths.lastAccessTime,
      sorter: (a, b) => a.lastAccessTime.localeCompare(b.lastAccessTime),
      onHeaderCell: () => ({
        width: columnWidths.lastAccessTime,
        onResize: handleResize('lastAccessTime'),
      }),
    },
    {
      title: 'processFinished',
      dataIndex: 'processFinished',
      key: 'processFinished',
      width: columnWidths.processFinished,
      sorter: (a, b) => Number(a.processFinished) - Number(b.processFinished),
      render: (value) => String(value),
      onHeaderCell: () => ({
        width: columnWidths.processFinished,
        onResize: handleResize('processFinished'),
      }),
    },
    {
      title: 'ProcessingThreadsCount',
      dataIndex: 'processingThreadsCount',
      key: 'processingThreadsCount',
      width: columnWidths.processingThreadsCount,
      sorter: (a, b) => a.processingThreadsCount - b.processingThreadsCount,
      onHeaderCell: () => ({
        width: columnWidths.processingThreadsCount,
        onResize: handleResize('processingThreadsCount'),
      }),
    },
    {
      title: 'FinishedThreadsCount',
      dataIndex: 'finishedThreadsCount',
      key: 'finishedThreadsCount',
      width: columnWidths.finishedThreadsCount,
      sorter: (a, b) => a.finishedThreadsCount - b.finishedThreadsCount,
      onHeaderCell: () => ({
        width: columnWidths.finishedThreadsCount,
        onResize: handleResize('finishedThreadsCount'),
      }),
    },
  ], [columnWidths, handleResize]);

  return (
    <div>
      <Table
        columns={columns}
        dataSource={tableData}
        rowKey="index"
        bordered
        components={{
          header: {
            cell: ResizableTitle,
          },
        }}
        pagination={{
          pageSizeOptions: ['5', '10', '15', '20', '50'],
          defaultPageSize: 10,
          showSizeChanger: true,
          position: ['bottomCenter'],
        }}
        scroll={{ x: 'max-content' }}
      />
    </div>
  );
};

export default PmComponentsExecutionMonitorsTable;


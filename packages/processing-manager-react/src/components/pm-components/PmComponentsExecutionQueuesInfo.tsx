/**
 * PM Components Execution Queues Info
 * Migrated from @cyoda/processing-manager/src/components/PmShardsDetailTab/PmShardsDetailTabPmComponents/PmShardsDetailTabPmComponentsExecutionQueuesInfo.vue
 */

import React, { useMemo, useState, useEffect, useCallback } from 'react';
import { Table } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import type { ResizeCallbackData } from 'react-resizable';
import { HelperStorage } from '@cyoda/http-api-react';
import { ResizableTitle } from '../ResizableTitle';
import { useProcessingQueues } from '../../hooks';
import './PmComponentsExecutionQueuesInfo.scss';

interface ExecutionQueueRow {
  executorName: string;
  index: number;
  queueSize: number;
  details: string;
}

export const PmComponentsExecutionQueuesInfo: React.FC = () => {
  const storage = useMemo(() => new HelperStorage(), []);
  const { data } = useProcessingQueues();

  const tableData = useMemo<ExecutionQueueRow[]>(() => {
    if (!data || !Array.isArray(data)) return [];

    // Transform queue names into table rows
    // Note: API returns array of queue names (strings)
    // We create rows with queue name as executorName
    return data.map((queueName, index) => ({
      executorName: queueName,
      index: index,
      queueSize: 0, // API doesn't provide queue size
      details: '', // API doesn't provide details
    }));
  }, [data]);

  // Column widths state
  const [columnWidths, setColumnWidths] = useState<Record<string, number>>(() => {
    const saved = storage.get('pmComponentsExecutionQueues:columnWidths', {});
    const defaultWidths = {
      executorName: 200,
      index: 150,
      queueSize: 150,
      details: 300,
    };
    return saved && Object.keys(saved).length > 0 ? saved : defaultWidths;
  });

  // Save column widths to localStorage
  useEffect(() => {
    if (Object.keys(columnWidths).length > 0) {
      storage.set('pmComponentsExecutionQueues:columnWidths', columnWidths);
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

  const columns: ColumnsType<ExecutionQueue> = useMemo(() => [
    {
      title: 'Executor Name',
      dataIndex: 'executorName',
      key: 'executorName',
      width: columnWidths.executorName,
      fixed: 'left',
      sorter: (a, b) => a.executorName.localeCompare(b.executorName),
      onHeaderCell: () => ({
        width: columnWidths.executorName,
        onResize: handleResize('executorName'),
      }),
    },
    {
      title: 'Index',
      dataIndex: 'index',
      key: 'index',
      width: columnWidths.index,
      sorter: (a, b) => a.index - b.index,
      onHeaderCell: () => ({
        width: columnWidths.index,
        onResize: handleResize('index'),
      }),
    },
    {
      title: 'Queue size',
      dataIndex: 'queueSize',
      key: 'queueSize',
      width: columnWidths.queueSize,
      sorter: (a, b) => a.queueSize - b.queueSize,
      onHeaderCell: () => ({
        width: columnWidths.queueSize,
        onResize: handleResize('queueSize'),
      }),
    },
    {
      title: 'Details',
      dataIndex: 'details',
      key: 'details',
      width: columnWidths.details,
      sorter: (a, b) => a.details.localeCompare(b.details),
      onHeaderCell: () => ({
        width: columnWidths.details,
        onResize: handleResize('details'),
      }),
    },
  ], [columnWidths, handleResize]);

  return (
    <div className="pm-components-execution-queues-info">
      <Table
        columns={columns}
        dataSource={tableData}
        rowKey="executorName"
        bordered
        pagination={{
          pageSizeOptions: ['5', '10', '15', '20', '50'],
          defaultPageSize: 10,
          showSizeChanger: true,
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

export default PmComponentsExecutionQueuesInfo;


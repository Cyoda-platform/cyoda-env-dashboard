/**
 * PM Components Service Processes View Ready
 * Migrated from @cyoda/processing-manager/src/components/PmShardsDetailTab/PmShardsDetailTabPmComponents/PmShardsDetailTabPmComponentsServiceProcessesView/PmShardsDetailTabPmComponentsServiceProcessesViewReady.vue
 */

import React, { useMemo, useState, useEffect, useCallback } from 'react';
import { Table } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import type { ResizeCallbackData } from 'react-resizable';
import { HelperStorage } from '@cyoda/http-api-react';
import { ResizableTitle } from '../ResizableTitle';
import './PmComponentsServiceProcessesViewReady.scss';

interface ServiceProcess {
  name: string;
  shard: string;
  lastStartTime: string;
  lastFinishTime: string;
  lastDurationMillis: number;
  nextStartTime: string;
  processing: boolean;
  queued: boolean;
}

interface PmComponentsServiceProcessesViewReadyProps {
  tableData: ServiceProcess[];
  className?: string;
}

export const PmComponentsServiceProcessesViewReady: React.FC<PmComponentsServiceProcessesViewReadyProps> = ({
  tableData = [],
  className,
}) => {
  const storage = useMemo(() => new HelperStorage(), []);

  const [columnWidths, setColumnWidths] = useState<Record<string, number>>(() => {
    const saved = storage.get('pmServiceProcessesReady:columnWidths', {});
    const defaultWidths = {
      name: 450,
      shard: 100,
      lastStartTime: 250,
      lastFinishTime: 250,
      lastDurationMillis: 200,
      nextStartTime: 200,
      processing: 150,
      queued: 150,
    };
    return saved && Object.keys(saved).length > 0 ? saved : defaultWidths;
  });

  useEffect(() => {
    if (Object.keys(columnWidths).length > 0) {
      storage.set('pmServiceProcessesReady:columnWidths', columnWidths);
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

  const columns: ColumnsType<ServiceProcess> = useMemo(() => [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      width: columnWidths.name,
      fixed: 'left',
      sorter: (a, b) => a.name.localeCompare(b.name),
      onHeaderCell: () => ({ width: columnWidths.name, onResize: handleResize('name') }),
    },
    {
      title: 'Shard',
      dataIndex: 'shard',
      key: 'shard',
      width: columnWidths.shard,
      sorter: (a, b) => a.shard.localeCompare(b.shard),
      onHeaderCell: () => ({ width: columnWidths.shard, onResize: handleResize('shard') }),
    },
    {
      title: 'Last Start Time',
      dataIndex: 'lastStartTime',
      key: 'lastStartTime',
      width: columnWidths.lastStartTime,
      sorter: (a, b) => a.lastStartTime.localeCompare(b.lastStartTime),
      onHeaderCell: () => ({ width: columnWidths.lastStartTime, onResize: handleResize('lastStartTime') }),
    },
    {
      title: 'Last Finish Time',
      dataIndex: 'lastFinishTime',
      key: 'lastFinishTime',
      width: columnWidths.lastFinishTime,
      sorter: (a, b) => a.lastFinishTime.localeCompare(b.lastFinishTime),
      onHeaderCell: () => ({ width: columnWidths.lastFinishTime, onResize: handleResize('lastFinishTime') }),
    },
    {
      title: 'Last Duration Millis',
      dataIndex: 'lastDurationMillis',
      key: 'lastDurationMillis',
      width: columnWidths.lastDurationMillis,
      sorter: (a, b) => a.lastDurationMillis - b.lastDurationMillis,
      onHeaderCell: () => ({ width: columnWidths.lastDurationMillis, onResize: handleResize('lastDurationMillis') }),
    },
    {
      title: 'Next Start Time',
      dataIndex: 'nextStartTime',
      key: 'nextStartTime',
      width: columnWidths.nextStartTime,
      sorter: (a, b) => a.nextStartTime.localeCompare(b.nextStartTime),
      onHeaderCell: () => ({ width: columnWidths.nextStartTime, onResize: handleResize('nextStartTime') }),
    },
    {
      title: 'Is processing',
      dataIndex: 'processing',
      key: 'processing',
      width: columnWidths.processing,
      sorter: (a, b) => Number(a.processing) - Number(b.processing),
      onHeaderCell: () => ({ width: columnWidths.processing, onResize: handleResize('processing') }),
      render: (value) => (value ? 'Yes' : 'No'),
    },
    {
      title: 'Is queued',
      dataIndex: 'queued',
      key: 'queued',
      width: columnWidths.queued,
      sorter: (a, b) => Number(a.queued) - Number(b.queued),
      onHeaderCell: () => ({ width: columnWidths.queued, onResize: handleResize('queued') }),
      render: (value) => (value ? 'Yes' : 'No'),
    },
  ], [columnWidths, handleResize]);

  return (
    <div className={`pm-components-service-processes-view-ready ${className || ''}`}>
      <h4>Ready(working) processes</h4>
      <Table
        columns={columns}
        dataSource={tableData}
        rowKey="name"
        bordered
        pagination={{
          pageSizeOptions: ['5', '10', '15', '20', '50'],
          defaultPageSize: 10,
          showSizeChanger: true,
          showTotal: (total) => `Total ${total}`,
          position: ['bottomCenter'],
        }}
        scroll={{ x: 'max-content' }}
        components={{
          header: {
            cell: ResizableTitle,
          },
        }}
      />
    </div>
  );
};

export default PmComponentsServiceProcessesViewReady;


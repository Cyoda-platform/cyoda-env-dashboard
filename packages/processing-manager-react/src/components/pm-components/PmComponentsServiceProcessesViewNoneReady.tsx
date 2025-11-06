/**
 * PM Components Service Processes View None Ready
 * Migrated from @cyoda/processing-manager/src/components/PmShardsDetailTab/PmShardsDetailTabPmComponents/PmShardsDetailTabPmComponentsServiceProcessesView/PmShardsDetailTabPmComponentsServiceProcessesViewNoneReady.vue
 */

import React, { useMemo, useState, useEffect, useCallback } from 'react';
import { Table } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import type { ResizeCallbackData } from 'react-resizable';
import { HelperStorage } from '@cyoda/http-api-react';
import { ResizableTitle } from '../ResizableTitle';
import './PmComponentsServiceProcessesViewNoneReady.scss';

interface ServiceProcess {
  name: string;
  shard: string;
}

interface PmComponentsServiceProcessesViewNoneReadyProps {
  tableData: ServiceProcess[];
  className?: string;
}

export const PmComponentsServiceProcessesViewNoneReady: React.FC<PmComponentsServiceProcessesViewNoneReadyProps> = ({
  tableData = [],
  className,
}) => {
  const storage = useMemo(() => new HelperStorage(), []);

  const [columnWidths, setColumnWidths] = useState<Record<string, number>>(() => {
    const saved = storage.get('pmServiceProcessesNoneReady:columnWidths', {});
    const defaultWidths = { name: 300, shard: 200 };
    return saved && Object.keys(saved).length > 0 ? saved : defaultWidths;
  });

  useEffect(() => {
    if (Object.keys(columnWidths).length > 0) {
      storage.set('pmServiceProcessesNoneReady:columnWidths', columnWidths);
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
  ], [columnWidths, handleResize]);

  return (
    <div className={`pm-components-service-processes-view-none-ready ${className || ''}`}>
      <h4>None ready(none working) processes</h4>
      <Table
        columns={columns}
        dataSource={tableData}
        rowKey="name"
        bordered
        pagination={{
          pageSizeOptions: ['5', '10', '15', '20', '50'],
          defaultPageSize: 10,
          showSizeChanger: true,
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

export default PmComponentsServiceProcessesViewNoneReady;


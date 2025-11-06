/**
 * Transition Versions Sorted Component
 * Migrated from @cyoda/processing-manager/src/components/PmTransitionVersions/TransitionVersionsSorted.vue
 */

import React, { useMemo, useState, useEffect, useCallback } from 'react';
import { Card, Table } from 'antd';
import { Link, useParams } from 'react-router-dom';
import type { ColumnsType } from 'antd/es/table';
import type { ResizeCallbackData } from 'react-resizable';
import { HelperStorage } from '@cyoda/http-api-react';
import { ResizableTitle } from '../ResizableTitle';
import dayjs from 'dayjs';
import './TransitionVersionsSorted.scss';

interface VersionRow {
  version: string;
  transactionId: string;
  actionType: string;
  colType: string;
  colTimeMillis: number;
}

interface TransitionVersionsSortedProps {
  rows: VersionRow[];
}

export const TransitionVersionsSorted: React.FC<TransitionVersionsSortedProps> = ({
  rows = [],
}) => {
  const storage = useMemo(() => new HelperStorage(), []);
  const { name } = useParams<{ name: string }>();

  const [columnWidths, setColumnWidths] = useState<Record<string, number>>(() => {
    const saved = storage.get('transitionVersionsSorted:columnWidths', {});
    const defaultWidths = {
      version: 320,
      transactionId: 320,
      actionType: 150,
      colType: 150,
      colTimeMillis: 200,
    };
    return saved && Object.keys(saved).length > 0 ? saved : defaultWidths;
  });

  useEffect(() => {
    if (Object.keys(columnWidths).length > 0) {
      storage.set('transitionVersionsSorted:columnWidths', columnWidths);
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

  const columns: ColumnsType<VersionRow> = useMemo(() => [
    {
      title: 'Version(time based)',
      dataIndex: 'version',
      key: 'version',
      width: columnWidths.version,
      onHeaderCell: () => ({ width: columnWidths.version, onResize: handleResize('version') }),
    },
    {
      title: 'Transaction Id',
      dataIndex: 'transactionId',
      key: 'transactionId',
      width: columnWidths.transactionId,
      onHeaderCell: () => ({ width: columnWidths.transactionId, onResize: handleResize('transactionId') }),
      render: (transactionId: string) => (
        <Link to={`/nodes/${name}/transaction/${transactionId}`}>{transactionId}</Link>
      ),
    },
    {
      title: 'Action Type',
      dataIndex: 'actionType',
      key: 'actionType',
      width: columnWidths.actionType,
      onHeaderCell: () => ({ width: columnWidths.actionType, onResize: handleResize('actionType') }),
    },
    {
      title: 'Column type',
      dataIndex: 'colType',
      key: 'colType',
      width: columnWidths.colType,
      onHeaderCell: () => ({ width: columnWidths.colType, onResize: handleResize('colType') }),
    },
    {
      title: 'Column time',
      dataIndex: 'colTimeMillis',
      key: 'colTimeMillis',
      width: columnWidths.colTimeMillis,
      onHeaderCell: () => ({ width: columnWidths.colTimeMillis, onResize: handleResize('colTimeMillis') }),
      render: (colTimeMillis: number) => dayjs(colTimeMillis).format('YYYY-MM-DD HH:mm:ss'),
    },
  ], [columnWidths, handleResize, name]);

  return (
    <Card title="Sorted by column's time view" className="transition-versions-sorted">
      <Table
        columns={columns}
        dataSource={rows}
        rowKey={(row, index) => `${row.transactionId}-${index}`}
        components={{
          header: {
            cell: ResizableTitle,
          },
        }}
      />
    </Card>
  );
};

export default TransitionVersionsSorted;


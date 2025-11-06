/**
 * Transition Versions Aggregated Component
 * Migrated from @cyoda/processing-manager/src/components/PmTransitionVersions/TransitionVersionsAggregated.vue
 */

import React, { useMemo, useState, useEffect, useCallback } from 'react';
import { Card, Table } from 'antd';
import { Link, useParams } from 'react-router-dom';
import dayjs from 'dayjs';
import type { ColumnsType } from 'antd/es/table';
import type { ResizeCallbackData } from 'react-resizable';
import { HelperStorage } from '@cyoda/http-api-react';
import { ResizableTitle } from '../ResizableTitle';
import './TransitionVersionsAggregated.scss';

interface VersionRow {
  version: string;
  transactionId: string;
  actionType: string;
  colType: string;
  colTimeMillis: number;
}

interface AggregatedRow {
  version: string;
  transactionId: string;
  actionType: string;
  subTable: Array<{
    colType: string;
    colTimeMillis: number;
  }>;
}

interface TransitionVersionsAggregatedProps {
  rows: VersionRow[];
}

export const TransitionVersionsAggregated: React.FC<TransitionVersionsAggregatedProps> = ({
  rows = [],
}) => {
  const storage = useMemo(() => new HelperStorage(), []);
  const { name } = useParams<{ name: string }>();

  const [columnWidths, setColumnWidths] = useState<Record<string, number>>(() => {
    const saved = storage.get('transitionVersionsAggregated:columnWidths', {});
    const defaultWidths = {
      version: 320,
      transactionId: 320,
      actionType: 200,
    };
    return saved && Object.keys(saved).length > 0 ? saved : defaultWidths;
  });

  useEffect(() => {
    if (Object.keys(columnWidths).length > 0) {
      storage.set('transitionVersionsAggregated:columnWidths', columnWidths);
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
    const data: AggregatedRow[] = [];
    rows.forEach((el) => {
      let existRow = data.find((elExist) => elExist.transactionId === el.transactionId);
      if (!existRow) {
        existRow = {
          actionType: el.actionType,
          transactionId: el.transactionId,
          version: el.version,
          subTable: [],
        };
        data.push(existRow);
      }

      existRow.subTable.push({
        colTimeMillis: el.colTimeMillis,
        colType: el.colType,
      });
    });
    return data;
  }, [rows]);

  const expandedRowRender = (record: AggregatedRow) => {
    const columns: ColumnsType<any> = [
      {
        title: 'Column type',
        dataIndex: 'colType',
        key: 'colType',
      },
      {
        title: 'Column time',
        dataIndex: 'colTimeMillis',
        key: 'colTimeMillis',
        render: (colTimeMillis: number) => dayjs(colTimeMillis).format('YYYY-MM-DD HH:mm:ss'),
      },
    ];

    return <Table columns={columns} dataSource={record.subTable} pagination={false} rowKey="colType" />;
  };

  const columns: ColumnsType<AggregatedRow> = useMemo(() => [
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
  ], [columnWidths, handleResize, name]);

  return (
    <Card title="Aggregated by transaction view" className="transition-versions-aggregated">
      <Table
        columns={columns}
        dataSource={tableData}
        expandable={{ expandedRowRender }}
        rowKey="transactionId"
        components={{
          header: {
            cell: ResizableTitle,
          },
        }}
      />
    </Card>
  );
};

export default TransitionVersionsAggregated;


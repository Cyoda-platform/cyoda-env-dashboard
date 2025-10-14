/**
 * Transition Versions Sorted Component
 * Migrated from @cyoda/processing-manager/src/components/PmTransitionVersions/TransitionVersionsSorted.vue
 */

import React from 'react';
import { Card, Table } from 'antd';
import { Link, useParams } from 'react-router-dom';
import type { ColumnsType } from 'antd/es/table';
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
  const { name } = useParams<{ name: string }>();

  const columns: ColumnsType<VersionRow> = [
    {
      title: 'Version(time based)',
      dataIndex: 'version',
      key: 'version',
      width: 320,
    },
    {
      title: 'Transaction Id',
      dataIndex: 'transactionId',
      key: 'transactionId',
      width: 320,
      render: (transactionId: string) => (
        <Link to={`/nodes/${name}/transaction/${transactionId}`}>{transactionId}</Link>
      ),
    },
    {
      title: 'Action Type',
      dataIndex: 'actionType',
      key: 'actionType',
    },
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

  return (
    <Card title="Sorted by column's time view" className="transition-versions-sorted">
      <Table
        columns={columns}
        dataSource={rows}
        rowKey={(row, index) => `${row.transactionId}-${index}`}
      />
    </Card>
  );
};

export default TransitionVersionsSorted;


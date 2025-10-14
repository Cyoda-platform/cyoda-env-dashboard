/**
 * Transition Versions Aggregated Component
 * Migrated from @cyoda/processing-manager/src/components/PmTransitionVersions/TransitionVersionsAggregated.vue
 */

import React, { useMemo } from 'react';
import { Card, Table } from 'antd';
import { Link, useParams } from 'react-router-dom';
import dayjs from 'dayjs';
import type { ColumnsType } from 'antd/es/table';

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
  const { name } = useParams<{ name: string }>();

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

  const columns: ColumnsType<AggregatedRow> = [
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
      render: (transactionId: string) => (
        <Link to={`/nodes/${name}/transaction/${transactionId}`}>{transactionId}</Link>
      ),
    },
    {
      title: 'Action Type',
      dataIndex: 'actionType',
      key: 'actionType',
    },
  ];

  return (
    <Card title="Aggregated by transaction view">
      <Table
        columns={columns}
        dataSource={tableData}
        expandable={{ expandedRowRender }}
        rowKey="transactionId"
      />
    </Card>
  );
};

export default TransitionVersionsAggregated;


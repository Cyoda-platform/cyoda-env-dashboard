/**
 * Transactions View Table Component
 * Migrated from @cyoda/processing-manager/src/components/PmShardsDetailTab/PmShardsDetailTabTransactions/PmShardsDetailTabTransactionsView/PmShardsDetailTabTransactionsViewTable.vue
 */

import React from 'react';
import { Table, Spin } from 'antd';
import { Link, useParams } from 'react-router-dom';
import dayjs from 'dayjs';
import type { ColumnsType } from 'antd/es/table';
import './TransactionsViewTable.scss';

interface TransactionRow {
  id: string;
  userName: string;
  status: string;
  createTime: string;
  submitTime: string;
  finishTime: string;
  prepareTimeMillis: number;
  processTimeMillis: number;
  transactionSubmitNodeId: string;
}

interface TransactionsViewTableProps {
  tableData: TransactionRow[];
  isLoading?: boolean;
}

export const TransactionsViewTable: React.FC<TransactionsViewTableProps> = ({
  tableData,
  isLoading = false,
}) => {
  const { name } = useParams<{ name: string }>();

  const getRowClassName = (record: TransactionRow): string => {
    if (!record.finishTime) return '';

    const createTime = record.createTime.replace('(', '.').replace(')', '');
    const finishTime = record.finishTime.replace('(', '.').replace(')', '');
    const diff = dayjs(finishTime).diff(dayjs(createTime));

    if (diff < 1000) {
      return 'row-white';
    }
    if (diff < 3 * 1000) {
      return 'row-palegoldenrod';
    }
    if (diff < 10 * 1000) {
      return 'row-yellow';
    }
    if (diff < 60 * 1000) {
      return 'row-orange';
    }
    return 'row-red';
  };

  const columns: ColumnsType<TransactionRow> = [
    {
      title: 'Transaction ID',
      dataIndex: 'id',
      key: 'id',
      width: 300,
      fixed: 'left',
      sorter: (a, b) => a.id.localeCompare(b.id),
      render: (id: string) => (
        <Link to={`/nodes/${name}/transaction/${id}`}>{id}</Link>
      ),
    },
    {
      title: 'User Name',
      dataIndex: 'userName',
      key: 'userName',
      width: 200,
      sorter: (a, b) => (a.userName || '').localeCompare(b.userName || ''),
    },
    {
      title: 'Transaction Status',
      dataIndex: 'status',
      key: 'status',
      width: 200,
      sorter: (a, b) => a.status.localeCompare(b.status),
    },
    {
      title: 'Create Time',
      dataIndex: 'createTime',
      key: 'createTime',
      width: 200,
      sorter: (a, b) => a.createTime.localeCompare(b.createTime),
    },
    {
      title: 'Submit time',
      dataIndex: 'submitTime',
      key: 'submitTime',
      width: 200,
      sorter: (a, b) => (a.submitTime || '').localeCompare(b.submitTime || ''),
    },
    {
      title: 'Finish time',
      dataIndex: 'finishTime',
      key: 'finishTime',
      width: 200,
      sorter: (a, b) => (a.finishTime || '').localeCompare(b.finishTime || ''),
    },
    {
      title: 'Prepare duration',
      dataIndex: 'prepareTimeMillis',
      key: 'prepareTimeMillis',
      width: 200,
      sorter: (a, b) => (a.prepareTimeMillis || 0) - (b.prepareTimeMillis || 0),
    },
    {
      title: 'Process duration',
      dataIndex: 'processTimeMillis',
      key: 'processTimeMillis',
      width: 200,
      sorter: (a, b) => (a.processTimeMillis || 0) - (b.processTimeMillis || 0),
    },
    {
      title: 'Transaction Submit Node Id',
      dataIndex: 'transactionSubmitNodeId',
      key: 'transactionSubmitNodeId',
      width: 300,
      sorter: (a, b) => (a.transactionSubmitNodeId || '').localeCompare(b.transactionSubmitNodeId || ''),
    },
  ];

  return (
    <div className="pm-shards-detail-tab-transactions-view-table">
      <Spin spinning={isLoading}>
        <Table
          columns={columns}
          dataSource={tableData}
          rowKey="id"
          bordered
          rowClassName={getRowClassName}
          scroll={{ x: 1800 }}
          pagination={false}
        />
      </Spin>
    </div>
  );
};

export default TransactionsViewTable;


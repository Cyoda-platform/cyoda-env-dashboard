/**
 * Transactions View Table Component
 * Migrated from @cyoda/processing-manager/src/components/PmShardsDetailTab/PmShardsDetailTabTransactions/PmShardsDetailTabTransactionsView/PmShardsDetailTabTransactionsViewTable.vue
 */

import React, { useMemo, useState, useEffect, useCallback } from 'react';
import { Table, Spin, Button, Select, Space } from 'antd';
import { DoubleLeftOutlined, LeftOutlined, RightOutlined, DoubleRightOutlined } from '@ant-design/icons';
import { Link, useParams } from 'react-router-dom';
import dayjs from 'dayjs';
import type { ColumnsType } from 'antd/es/table';
import type { ResizeCallbackData } from 'react-resizable';
import { HelperStorage } from '@cyoda/http-api-react';
import { ResizableTitle } from '../ResizableTitle';
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
  pageSize?: number;
  firstPage?: boolean;
  lastPage?: boolean;
  onPageSizeChange?: (size: number) => void;
  onNext?: () => void;
  onPrev?: () => void;
  onFirst?: () => void;
  onLast?: () => void;
}

export const TransactionsViewTable: React.FC<TransactionsViewTableProps> = ({
  tableData,
  isLoading = false,
  pageSize = 25,
  firstPage = false,
  lastPage = false,
  onPageSizeChange,
  onNext,
  onPrev,
  onFirst,
  onLast,
}) => {
  const { name } = useParams<{ name: string }>();
  const storage = useMemo(() => new HelperStorage(), []);

  // Column widths state
  const [columnWidths, setColumnWidths] = useState<Record<string, number>>(() => {
    const saved = storage.get('transactionsView:columnWidths', {});
    const defaultWidths = {
      id: 200,
      userName: 150,
      status: 120,
      createTime: 180,
      submitTime: 180,
      finishTime: 180,
      prepareTimeMillis: 180,
      processTimeMillis: 180,
      transactionSubmitNodeId: 200,
    };
    return saved && Object.keys(saved).length > 0 ? saved : defaultWidths;
  });

  // Save column widths to localStorage
  useEffect(() => {
    if (Object.keys(columnWidths).length > 0) {
      storage.set('transactionsView:columnWidths', columnWidths);
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

  const columns: ColumnsType<TransactionRow> = useMemo(() => [
    {
      title: 'Transaction ID',
      dataIndex: 'id',
      key: 'id',
      width: columnWidths.id,
      fixed: 'left',
      sorter: (a, b) => a.id.localeCompare(b.id),
      render: (id: string) => (
        <Link to={`/nodes/${name}/transaction/${id}`}>{id}</Link>
      ),
      onHeaderCell: () => ({
        width: columnWidths.id,
        onResize: handleResize('id'),
      }),
    },
    {
      title: 'User Name',
      dataIndex: 'userName',
      key: 'userName',
      width: columnWidths.userName,
      sorter: (a, b) => (a.userName || '').localeCompare(b.userName || ''),
      onHeaderCell: () => ({
        width: columnWidths.userName,
        onResize: handleResize('userName'),
      }),
    },
    {
      title: 'Transaction Status',
      dataIndex: 'status',
      key: 'status',
      width: columnWidths.status,
      sorter: (a, b) => a.status.localeCompare(b.status),
      onHeaderCell: () => ({
        width: columnWidths.status,
        onResize: handleResize('status'),
      }),
    },
    {
      title: 'Create Time',
      dataIndex: 'createTime',
      key: 'createTime',
      width: columnWidths.createTime,
      sorter: (a, b) => a.createTime.localeCompare(b.createTime),
      onHeaderCell: () => ({
        width: columnWidths.createTime,
        onResize: handleResize('createTime'),
      }),
    },
    {
      title: 'Submit time',
      dataIndex: 'submitTime',
      key: 'submitTime',
      width: columnWidths.submitTime,
      sorter: (a, b) => (a.submitTime || '').localeCompare(b.submitTime || ''),
      onHeaderCell: () => ({
        width: columnWidths.submitTime,
        onResize: handleResize('submitTime'),
      }),
    },
    {
      title: 'Finish time',
      dataIndex: 'finishTime',
      key: 'finishTime',
      width: columnWidths.finishTime,
      sorter: (a, b) => (a.finishTime || '').localeCompare(b.finishTime || ''),
      onHeaderCell: () => ({
        width: columnWidths.finishTime,
        onResize: handleResize('finishTime'),
      }),
    },
    {
      title: 'Prepare duration',
      dataIndex: 'prepareTimeMillis',
      key: 'prepareTimeMillis',
      width: columnWidths.prepareTimeMillis,
      sorter: (a, b) => (a.prepareTimeMillis || 0) - (b.prepareTimeMillis || 0),
      onHeaderCell: () => ({
        width: columnWidths.prepareTimeMillis,
        onResize: handleResize('prepareTimeMillis'),
      }),
    },
    {
      title: 'Process duration',
      dataIndex: 'processTimeMillis',
      key: 'processTimeMillis',
      width: columnWidths.processTimeMillis,
      sorter: (a, b) => (a.processTimeMillis || 0) - (b.processTimeMillis || 0),
      onHeaderCell: () => ({
        width: columnWidths.processTimeMillis,
        onResize: handleResize('processTimeMillis'),
      }),
    },
    {
      title: 'Transaction Submit Node Id',
      dataIndex: 'transactionSubmitNodeId',
      key: 'transactionSubmitNodeId',
      width: columnWidths.transactionSubmitNodeId,
      sorter: (a, b) => (a.transactionSubmitNodeId || '').localeCompare(b.transactionSubmitNodeId || ''),
      onHeaderCell: () => ({
        width: columnWidths.transactionSubmitNodeId,
        onResize: handleResize('transactionSubmitNodeId'),
      }),
    },
  ], [columnWidths, handleResize, name]);

  const pagesOptions = [10, 25, 50, 100, 200, 500];

  return (
    <div className="pm-shards-detail-tab-transactions-view-table">
      <Spin spinning={isLoading}>
        <Table
          columns={columns}
          dataSource={tableData}
          rowKey="id"
          bordered
          components={{
            header: {
              cell: ResizableTitle,
            },
          }}
          rowClassName={getRowClassName}
          scroll={{ x: 1800 }}
          pagination={false}
        />
        <div className="pagination-bar">
          <Space>
            {!firstPage && (
              <>
                <Button type="primary" onClick={onFirst} icon={<DoubleLeftOutlined />}>
                  First
                </Button>
                <Button type="primary" onClick={onPrev} icon={<LeftOutlined />}>
                  Prev
                </Button>
              </>
            )}
            {!lastPage && (
              <>
                <Button type="primary" onClick={onNext}>
                  Next <RightOutlined />
                </Button>
                <Button type="primary" onClick={onLast}>
                  Last <DoubleRightOutlined />
                </Button>
              </>
            )}
            <Select
              className="page-size"
              value={pageSize}
              onChange={onPageSizeChange}
              placeholder="Page Size"
              options={pagesOptions.map((page) => ({
                value: page,
                label: `${page}/page`,
              }))}
            />
          </Space>
        </div>
      </Spin>
    </div>
  );
};

export default TransactionsViewTable;


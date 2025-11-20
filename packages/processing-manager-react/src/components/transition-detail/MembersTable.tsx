/**
 * Members Table Component
 * Migrated from @cyoda/processing-manager/src/components/PmTransitionDetail/Members/MembersTable.vue
 */

import React, { useMemo, useState, useEffect, useCallback } from 'react';
import { Table, Spin, Space } from 'antd';
import { Link, useParams } from 'react-router-dom';
import type { ColumnsType } from 'antd/es/table';
import type { ResizeCallbackData } from 'react-resizable';
import { HelperStorage } from '@cyoda/http-api-react';
import { ResizableTitle } from '../ResizableTitle';
import dayjs from 'dayjs';
import './MembersTable.scss';

interface MemberRow {
  entityType: string;
  entityId: string;
  actionType: string;
  versionCheckTimeMillis: number;
  versionCheckResult: boolean;
}

interface MembersTableProps {
  tableData: MemberRow[];
  isLoading?: boolean;
}

export const MembersTable: React.FC<MembersTableProps> = ({ tableData, isLoading = false }) => {
  const { name } = useParams<{ name: string }>();
  const storage = useMemo(() => new HelperStorage(), []);

  const convertTime = (mkTime: number) => {
    return dayjs(mkTime).format('YYYY-MM-DD HH:mm:ss.SSS');
  };

  // Column widths state
  const [columnWidths, setColumnWidths] = useState<Record<string, number>>(() => {
    const saved = storage.get('transitionDetailMembers:columnWidths', {});
    const defaultWidths = {
      entityType: 330,
      entityId: 330,
      actionType: 130,
      versionCheckTimeMillis: 200,
      versionCheckResult: 200,
      operations: 300,
    };
    return saved && Object.keys(saved).length > 0 ? saved : defaultWidths;
  });

  // Save column widths to localStorage
  useEffect(() => {
    if (Object.keys(columnWidths).length > 0) {
      storage.set('transitionDetailMembers:columnWidths', columnWidths);
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

  const columns: ColumnsType<MemberRow> = useMemo(() => [
    {
      title: 'Entity Type',
      dataIndex: 'entityType',
      key: 'entityType',
      width: columnWidths.entityType,
      fixed: 'left',
      onHeaderCell: () => ({
        width: columnWidths.entityType,
        onResize: handleResize('entityType'),
      }),
    },
    {
      title: 'Entity Id',
      dataIndex: 'entityId',
      key: 'entityId',
      width: columnWidths.entityId,
      onHeaderCell: () => ({
        width: columnWidths.entityId,
        onResize: handleResize('entityId'),
      }),
    },
    {
      title: 'Action Type',
      dataIndex: 'actionType',
      key: 'actionType',
      width: columnWidths.actionType,
      onHeaderCell: () => ({
        width: columnWidths.actionType,
        onResize: handleResize('actionType'),
      }),
    },
    {
      title: 'Version Check Time',
      dataIndex: 'versionCheckTimeMillis',
      key: 'versionCheckTimeMillis',
      width: columnWidths.versionCheckTimeMillis,
      onHeaderCell: () => ({
        width: columnWidths.versionCheckTimeMillis,
        onResize: handleResize('versionCheckTimeMillis'),
      }),
      render: (versionCheckTimeMillis: number) => convertTime(versionCheckTimeMillis),
    },
    {
      title: 'Version Check Result',
      dataIndex: 'versionCheckResult',
      key: 'versionCheckResult',
      width: columnWidths.versionCheckResult,
      onHeaderCell: () => ({
        width: columnWidths.versionCheckResult,
        onResize: handleResize('versionCheckResult'),
      }),
      render: (versionCheckResult: boolean) => (versionCheckResult ? 'Yes' : 'No'),
    },
    {
      title: 'Operations',
      key: 'operations',
      fixed: 'right',
      width: columnWidths.operations,
      className: 'actions-buttons',
      onHeaderCell: () => ({
        width: columnWidths.operations,
        onResize: handleResize('operations'),
      }),
      render: (_, record: MemberRow) => (
        <Space size="middle">
          <Link
            to={`/nodes/${name}/versions?entityId=${record.entityId}&type=${record.entityType}`}
          >
            Versions
          </Link>
          <Link to={`/nodes/${name}/changes?entityId=${record.entityId}&type=${record.entityType}`}>
            Changes
          </Link>
          <Link
            to={`/nodes/${name}/entity-state-machine?entityId=${record.entityId}&type=${record.entityType}`}
          >
            State Machine
          </Link>
        </Space>
      ),
    },
  ], [columnWidths, handleResize, name, convertTime]);

  return (
    <div className="transition-detail-members-table">
      <h3 className="table-title">Transaction members with version check results</h3>
      <Spin spinning={isLoading}>
        <Table
          columns={columns}
          dataSource={tableData}
          rowKey={(record) => `${record.entityId}-${record.versionCheckTimeMillis}`}
          bordered
          pagination={false}
          scroll={{ x: 'max-content' }}
          components={{
            header: {
              cell: ResizableTitle,
            },
          }}
          locale={{
            emptyText: 'No transaction members found',
          }}
        />
      </Spin>
    </div>
  );
};

export default MembersTable;


/**
 * Members Table Component
 * Migrated from @cyoda/processing-manager/src/components/PmTransitionDetail/Members/MembersTable.vue
 */

import React from 'react';
import { Card, Table, Spin, Space } from 'antd';
import { Link, useParams } from 'react-router-dom';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';

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

  const convertTime = (mkTime: number) => {
    return dayjs(mkTime).format('YYYY-MM-DD HH:mm:ss.SSS');
  };

  const columns: ColumnsType<MemberRow> = [
    {
      title: 'Entity Type',
      dataIndex: 'entityType',
      key: 'entityType',
      width: 330,
      fixed: 'left',
    },
    {
      title: 'Entity Id',
      dataIndex: 'entityId',
      key: 'entityId',
      width: 330,
    },
    {
      title: 'Action Type',
      dataIndex: 'actionType',
      key: 'actionType',
      width: 130,
    },
    {
      title: 'Version Check Time',
      dataIndex: 'versionCheckTimeMillis',
      key: 'versionCheckTimeMillis',
      width: 200,
      render: (versionCheckTimeMillis: number) => convertTime(versionCheckTimeMillis),
    },
    {
      title: 'Version Check Result',
      dataIndex: 'versionCheckResult',
      key: 'versionCheckResult',
      width: 200,
      render: (versionCheckResult: boolean) => (versionCheckResult ? 'Yes' : 'No'),
    },
    {
      title: 'Operations',
      key: 'operations',
      fixed: 'right',
      width: 300,
      className: 'actions-buttons',
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
  ];

  return (
    <Card title="Transaction members with version check results">
      <Spin spinning={isLoading}>
        <Table
          columns={columns}
          dataSource={tableData}
          rowKey={(record, index) => `${record.entityId}-${index}`}
          bordered
          pagination={false}
          scroll={{ x: 'max-content' }}
        />
      </Spin>
    </Card>
  );
};

export default MembersTable;


/**
 * Transactions Entities Table Component
 * Migrated from @cyoda/processing-manager/src/components/PmShardsDetailTab/PmShardsDetailTabTransactions/PmShardsDetailTabTransactionsEntities/PmShardsDetailTabTransactionsEntitiesTable.vue
 */

import React from 'react';
import { Table, Space, Spin } from 'antd';
import { Link, useParams } from 'react-router-dom';
import type { ColumnsType } from 'antd/es/table';

interface EntityRow {
  cretionDate: string;
  entityId: string;
  shardId: string;
  actions: string[];
}

interface TransactionsEntitiesTableProps {
  tableData: EntityRow[];
  isLoading?: boolean;
}

export const TransactionsEntitiesTable: React.FC<TransactionsEntitiesTableProps> = ({
  tableData,
  isLoading = false,
}) => {
  const { name } = useParams<{ name: string }>();

  const createLink = (linkName: string, actions: string[]): string => {
    const action = actions.find((el) => el.indexOf(`entity-${linkName}`) !== -1);
    if (action) {
      const paths = action.split('?');
      return paths[1]?.replace('id=', 'entityId=') || '';
    }
    return '';
  };

  const columns: ColumnsType<EntityRow> = [
    {
      title: 'Create Date',
      dataIndex: 'cretionDate',
      key: 'cretionDate',
      width: 200,
      fixed: 'left',
      sorter: (a, b) => a.cretionDate.localeCompare(b.cretionDate),
    },
    {
      title: 'Entity ID',
      dataIndex: 'entityId',
      key: 'entityId',
      sorter: (a, b) => a.entityId.localeCompare(b.entityId),
    },
    {
      title: 'Shard',
      dataIndex: 'shardId',
      key: 'shardId',
      sorter: (a, b) => a.shardId.localeCompare(b.shardId),
    },
    {
      title: 'Actions',
      key: 'actions',
      className: 'actions-buttons',
      render: (_, record: EntityRow) => {
        const versionsPath = createLink('versions', record.actions);
        const changesPath = createLink('changes', record.actions);
        const stateMachinePath = createLink('state-machine', record.actions);

        return (
          <Space size="middle">
            {versionsPath && (
              <Link to={`/nodes/${name}/versions?${versionsPath}`}>Versions</Link>
            )}
            {changesPath && (
              <Link to={`/nodes/${name}/changes?${changesPath}`}>Changes</Link>
            )}
            {stateMachinePath && (
              <Link to={`/nodes/${name}/entity-state-machine?${stateMachinePath}`}>
                State Machine
              </Link>
            )}
          </Space>
        );
      },
    },
  ];

  return (
    <Spin spinning={isLoading}>
      <Table
        columns={columns}
        dataSource={tableData}
        rowKey="entityId"
        bordered
        pagination={{
          pageSizeOptions: ['5', '10', '15', '20', '50'],
          defaultPageSize: 10,
          showSizeChanger: true,
        }}
        scroll={{ x: 'max-content' }}
      />
    </Spin>
  );
};

export default TransactionsEntitiesTable;


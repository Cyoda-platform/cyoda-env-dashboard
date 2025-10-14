/**
 * Processing Events Entities Error List View Table
 * Migrated from @cyoda/processing-manager/src/components/PmShardsDetailTab/PmProcessingEventsEntitiesErrorListView/Component/PmProcessingEventsEntitiesErrorListViewTable.vue
 */

import React from 'react';
import { Table } from 'antd';
import { Link, useParams } from 'react-router-dom';
import type { ColumnsType } from 'antd/es/table';

interface EntityErrorRow {
  entityClass: string;
  entityId: string;
  shardId: string;
  eventUUID: string;
}

interface ProcessingEventsEntitiesErrorListViewTableProps {
  tableData: EntityErrorRow[];
}

export const ProcessingEventsEntitiesErrorListViewTable: React.FC<
  ProcessingEventsEntitiesErrorListViewTableProps
> = ({ tableData = [] }) => {
  const { name } = useParams<{ name: string }>();

  const columns: ColumnsType<EntityErrorRow> = [
    {
      title: 'Entity class',
      dataIndex: 'entityClass',
      key: 'entityClass',
      fixed: 'left',
      sorter: (a, b) => a.entityClass.localeCompare(b.entityClass),
    },
    {
      title: 'Entity ID',
      dataIndex: 'entityId',
      key: 'entityId',
      width: 200,
      sorter: (a, b) => a.entityId.localeCompare(b.entityId),
    },
    {
      title: 'Entity Shard (not event shard)',
      dataIndex: 'shardId',
      key: 'shardId',
      width: 300,
      sorter: (a, b) => a.shardId.localeCompare(b.shardId),
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 350,
      className: 'actions-buttons',
      render: (_, record) => (
        <div style={{ display: 'flex', gap: '10px' }}>
          <Link
            to={`/processing-ui/nodes/${name}/versions?entityId=${record.entityId}&type=${record.entityClass}`}
          >
            Versions
          </Link>
          <Link
            to={`/processing-ui/nodes/${name}/changes?entityId=${record.entityId}&type=${record.entityClass}`}
          >
            Changes
          </Link>
          <Link
            to={`/processing-ui/nodes/${name}/entity-state-machine?entityId=${record.entityId}&type=${record.entityClass}`}
          >
            State Machine
          </Link>
          <Link
            to={`/processing-ui/nodes/${name}/event-view?queue=${record.entityClass}&shard=${record.shardId}&timeUUID=${record.eventUUID}`}
          >
            Error Event
          </Link>
        </div>
      ),
    },
  ];

  return (
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
  );
};

export default ProcessingEventsEntitiesErrorListViewTable;


/**
 * Transactions Entities Table Component
 * Migrated from @cyoda/processing-manager/src/components/PmShardsDetailTab/PmShardsDetailTabTransactions/PmShardsDetailTabTransactionsEntities/PmShardsDetailTabTransactionsEntitiesTable.vue
 */

import React, { useMemo, useState, useEffect, useCallback } from 'react';
import { Table, Space, Spin } from 'antd';
import { useParams } from 'react-router-dom';
import type { ColumnsType } from 'antd/es/table';
import type { ResizeCallbackData } from 'react-resizable';
import { HelperStorage } from '@cyoda/http-api-react';
import { ResizableTitle } from '../ResizableTitle';
import { EntityVersionsModal, EntityChangesModal, EntityStateMachineModal } from './';
import './TransactionsEntitiesTable.scss';

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
  const storage = useMemo(() => new HelperStorage(), []);

  // Modal states
  const [versionsModalVisible, setVersionsModalVisible] = useState(false);
  const [changesModalVisible, setChangesModalVisible] = useState(false);
  const [stateMachineModalVisible, setStateMachineModalVisible] = useState(false);
  const [selectedEntity, setSelectedEntity] = useState<{ entityId: string; entityType: string } | null>(null);

  // Column widths state
  const [columnWidths, setColumnWidths] = useState<Record<string, number>>(() => {
    const saved = storage.get('transactionsEntities:columnWidths', {});
    const defaultWidths = {
      cretionDate: 200,
      entityId: 300,
      shardId: 150,
      actions: 250,
    };
    return saved && Object.keys(saved).length > 0 ? saved : defaultWidths;
  });

  // Save column widths to localStorage
  useEffect(() => {
    if (Object.keys(columnWidths).length > 0) {
      storage.set('transactionsEntities:columnWidths', columnWidths);
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

  const createLink = (linkName: string, actions: string[]): string => {
    const action = actions.find((el) => el.indexOf(`entity-${linkName}`) !== -1);
    if (action) {
      const paths = action.split('?');
      return paths[1]?.replace('id=', 'entityId=') || '';
    }
    return '';
  };

  const parseQueryParams = (queryString: string): { entityId: string; type: string } => {
    const params = new URLSearchParams(queryString);
    return {
      entityId: params.get('entityId') || '',
      type: params.get('type') || '',
    };
  };

  const handleVersionsClick = (record: EntityRow) => {
    const versionsPath = createLink('versions', record.actions);
    if (versionsPath) {
      const params = parseQueryParams(versionsPath);
      setSelectedEntity(params);
      setVersionsModalVisible(true);
    }
  };

  const handleChangesClick = (record: EntityRow) => {
    const changesPath = createLink('changes', record.actions);
    if (changesPath) {
      const params = parseQueryParams(changesPath);
      setSelectedEntity(params);
      setChangesModalVisible(true);
    }
  };

  const handleStateMachineClick = (record: EntityRow) => {
    const stateMachinePath = createLink('state-machine', record.actions);
    if (stateMachinePath) {
      const params = parseQueryParams(stateMachinePath);
      setSelectedEntity(params);
      setStateMachineModalVisible(true);
    }
  };

  const columns: ColumnsType<EntityRow> = useMemo(() => [
    {
      title: 'Create Date',
      dataIndex: 'cretionDate',
      key: 'cretionDate',
      width: columnWidths.cretionDate,
      fixed: 'left',
      sorter: (a, b) => a.cretionDate.localeCompare(b.cretionDate),
      onHeaderCell: () => ({
        width: columnWidths.cretionDate,
        onResize: handleResize('cretionDate'),
      }),
    },
    {
      title: 'Entity ID',
      dataIndex: 'entityId',
      key: 'entityId',
      width: columnWidths.entityId,
      sorter: (a, b) => a.entityId.localeCompare(b.entityId),
      onHeaderCell: () => ({
        width: columnWidths.entityId,
        onResize: handleResize('entityId'),
      }),
    },
    {
      title: 'Shard',
      dataIndex: 'shardId',
      key: 'shardId',
      width: columnWidths.shardId,
      sorter: (a, b) => a.shardId.localeCompare(b.shardId),
      onHeaderCell: () => ({
        width: columnWidths.shardId,
        onResize: handleResize('shardId'),
      }),
    },
    {
      title: 'Actions',
      key: 'actions',
      width: columnWidths.actions,
      className: 'actions-buttons',
      render: (_, record: EntityRow) => {
        const versionsPath = createLink('versions', record.actions);
        const changesPath = createLink('changes', record.actions);
        const stateMachinePath = createLink('state-machine', record.actions);

        return (
          <Space size="middle">
            {versionsPath && (
              <a onClick={() => handleVersionsClick(record)} style={{ cursor: 'pointer' }}>
                Versions
              </a>
            )}
            {changesPath && (
              <a onClick={() => handleChangesClick(record)} style={{ cursor: 'pointer' }}>
                Changes
              </a>
            )}
            {stateMachinePath && (
              <a onClick={() => handleStateMachineClick(record)} style={{ cursor: 'pointer' }}>
                State Machine
              </a>
            )}
          </Space>
        );
      },
      onHeaderCell: () => ({
        width: columnWidths.actions,
        onResize: handleResize('actions'),
      }),
    },
  ], [columnWidths, handleResize, handleVersionsClick, handleChangesClick, handleStateMachineClick]);

  return (
    <>
      <div className="transactions-entities-table">
        <Spin spinning={isLoading}>
          <Table
            columns={columns}
            dataSource={tableData}
            rowKey="entityId"
            bordered
            components={{
              header: {
                cell: ResizableTitle,
              },
            }}
            pagination={{
              pageSizeOptions: ['5', '10', '15', '20', '50'],
              defaultPageSize: 10,
              showSizeChanger: true,
              showTotal: (total) => `Total ${total}`,
              position: ['bottomCenter'],
            }}
            scroll={{ x: 'max-content' }}
          />
        </Spin>
      </div>

      {selectedEntity && (
        <>
          <EntityVersionsModal
            visible={versionsModalVisible}
            onClose={() => setVersionsModalVisible(false)}
            entityId={selectedEntity.entityId}
            entityType={selectedEntity.type}
          />
          <EntityChangesModal
            visible={changesModalVisible}
            onClose={() => setChangesModalVisible(false)}
            entityId={selectedEntity.entityId}
            entityType={selectedEntity.type}
            nodeName={name}
          />
          <EntityStateMachineModal
            visible={stateMachineModalVisible}
            onClose={() => setStateMachineModalVisible(false)}
            entityId={selectedEntity.entityId}
            entityType={selectedEntity.type}
          />
        </>
      )}
    </>
  );
};

export default TransactionsEntitiesTable;


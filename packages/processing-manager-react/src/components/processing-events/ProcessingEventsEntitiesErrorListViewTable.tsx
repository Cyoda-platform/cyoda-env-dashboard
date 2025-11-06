/**
 * Processing Events Entities Error List View Table
 * Migrated from @cyoda/processing-manager/src/components/PmShardsDetailTab/PmProcessingEventsEntitiesErrorListView/Component/PmProcessingEventsEntitiesErrorListViewTable.vue
 */

import React, { useMemo, useState, useEffect, useCallback } from 'react';
import { Table } from 'antd';
import { Link, useParams } from 'react-router-dom';
import type { ColumnsType } from 'antd/es/table';
import type { ResizeCallbackData } from 'react-resizable';
import { HelperStorage } from '@cyoda/http-api-react';
import { ResizableTitle } from '../ResizableTitle';
import './ProcessingEventsEntitiesErrorListViewTable.scss';

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
  const storage = useMemo(() => new HelperStorage(), []);

  // Column widths state
  const [columnWidths, setColumnWidths] = useState<Record<string, number>>(() => {
    const saved = storage.get('processingEventsEntitiesError:columnWidths', {});
    const defaultWidths = {
      entityClass: 300,
      entityId: 200,
      shardId: 300,
      actions: 350,
    };
    return saved && Object.keys(saved).length > 0 ? saved : defaultWidths;
  });

  // Save column widths to localStorage
  useEffect(() => {
    if (Object.keys(columnWidths).length > 0) {
      storage.set('processingEventsEntitiesError:columnWidths', columnWidths);
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

  const columns: ColumnsType<EntityErrorRow> = useMemo(() => [
    {
      title: 'Entity class',
      dataIndex: 'entityClass',
      key: 'entityClass',
      width: columnWidths.entityClass,
      fixed: 'left',
      sorter: (a, b) => a.entityClass.localeCompare(b.entityClass),
      onHeaderCell: () => ({
        width: columnWidths.entityClass,
        onResize: handleResize('entityClass'),
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
      title: 'Entity Shard (not event shard)',
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
      onHeaderCell: () => ({
        width: columnWidths.actions,
        onResize: handleResize('actions'),
      }),
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
  ], [columnWidths, handleResize, name]);

  return (
    <div className="processing-events-entities-error-list-view-table">
      <Table
        columns={columns}
        dataSource={tableData}
        rowKey="entityId"
        bordered
        pagination={{
          pageSizeOptions: ['5', '10', '15', '20', '50'],
          defaultPageSize: 10,
          showSizeChanger: true,
          position: ['bottomCenter'],
        }}
        scroll={{ x: 'max-content' }}
        components={{
          header: {
            cell: ResizableTitle,
          },
        }}
      />
    </div>
  );
};

export default ProcessingEventsEntitiesErrorListViewTable;


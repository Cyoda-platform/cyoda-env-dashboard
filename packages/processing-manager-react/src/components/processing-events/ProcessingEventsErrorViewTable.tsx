/**
 * Processing Events Error View Table Component
 * Migrated from @cyoda/processing-manager/src/components/PmShardsDetailTab/PmProcessingEventsErrorView/Component/PmProcessingEventsErrorViewTable.vue
 */

import React, { useMemo, useState, useEffect, useCallback } from 'react';
import { Table } from 'antd';
import { useParams } from 'react-router-dom';
import type { ColumnsType } from 'antd/es/table';
import type { ResizeCallbackData } from 'react-resizable';
import { HelperStorage } from '@cyoda/http-api-react';
import { ResizableTitle } from '../ResizableTitle';
import { EventViewModal } from './EventViewModal';
import './ProcessingEventsErrorViewTable.scss';

interface ErrorEventRow {
  queueName: string;
  createTime: string;
  doneTime: string;
  errorTime: string;
  shardId: string;
  status: string;
  timeUUID: string;
  entityClassName: string;
  entityId: string;
  entityHasErrors: boolean;
  errorEventTimeUUID: string;
  coreDataClassName: string;
  clientDataClassName: string;
}

interface ProcessingEventsErrorViewTableProps {
  tableData: ErrorEventRow[];
}

export const ProcessingEventsErrorViewTable: React.FC<ProcessingEventsErrorViewTableProps> = ({
  tableData,
}) => {
  const { name } = useParams<{ name: string }>();
  const storage = useMemo(() => new HelperStorage(), []);

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<{
    queue: string;
    shard: string;
    timeUUID: string;
  } | null>(null);

  // Column widths state
  const [columnWidths, setColumnWidths] = useState<Record<string, number>>(() => {
    const saved = storage.get('processingEventsError:columnWidths', {});
    const defaultWidths = {
      queueName: 400,
      createTime: 200,
      doneTime: 200,
      errorTime: 200,
      shardId: 150,
      status: 150,
      timeUUID: 250,
      entityId: 250,
      coreDataClassName: 250,
      clientDataClassName: 250,
    };
    return saved && Object.keys(saved).length > 0 ? saved : defaultWidths;
  });

  // Save column widths to localStorage
  useEffect(() => {
    if (Object.keys(columnWidths).length > 0) {
      storage.set('processingEventsError:columnWidths', columnWidths);
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

  const columns: ColumnsType<ErrorEventRow> = useMemo(() => [
    {
      title: 'Queue',
      dataIndex: 'queueName',
      key: 'queueName',
      width: columnWidths.queueName,
      fixed: 'left',
      sorter: (a, b) => a.queueName.localeCompare(b.queueName),
      onHeaderCell: () => ({
        width: columnWidths.queueName,
        onResize: handleResize('queueName'),
      }),
    },
    {
      title: 'Create Time',
      dataIndex: 'createTime',
      key: 'createTime',
      width: columnWidths.createTime,
      fixed: 'left',
      sorter: (a, b) => a.createTime.localeCompare(b.createTime),
      onHeaderCell: () => ({
        width: columnWidths.createTime,
        onResize: handleResize('createTime'),
      }),
    },
    {
      title: 'Done Time',
      dataIndex: 'doneTime',
      key: 'doneTime',
      width: columnWidths.doneTime,
      sorter: (a, b) => (a.doneTime || '').localeCompare(b.doneTime || ''),
      onHeaderCell: () => ({
        width: columnWidths.doneTime,
        onResize: handleResize('doneTime'),
      }),
    },
    {
      title: 'Error Time',
      dataIndex: 'errorTime',
      key: 'errorTime',
      width: columnWidths.errorTime,
      sorter: (a, b) => (a.errorTime || '').localeCompare(b.errorTime || ''),
      onHeaderCell: () => ({
        width: columnWidths.errorTime,
        onResize: handleResize('errorTime'),
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
      title: 'Status',
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
      title: 'Time-UUID',
      dataIndex: 'timeUUID',
      key: 'timeUUID',
      width: columnWidths.timeUUID,
      sorter: (a, b) => a.timeUUID.localeCompare(b.timeUUID),
      render: (timeUUID: string, record: ErrorEventRow) => (
        <a
          onClick={() => {
            setSelectedEvent({
              queue: record.queueName,
              shard: record.shardId,
              timeUUID,
            });
            setModalOpen(true);
          }}
          style={{ cursor: 'pointer', color: '#1890ff' }}
        >
          {timeUUID}
        </a>
      ),
      onHeaderCell: () => ({
        width: columnWidths.timeUUID,
        onResize: handleResize('timeUUID'),
      }),
    },
    {
      title: 'Entity-Class',
      dataIndex: 'entityClassName',
      key: 'entityClass',
      width: 200,
      sorter: (a, b) => (a.entityClassName || '').localeCompare(b.entityClassName || ''),
      onHeaderCell: () => ({
        width: 200,
        onResize: handleResize('entityClass'),
      }),
    },
    {
      title: 'Entity-ID',
      dataIndex: 'entityId',
      key: 'entityId',
      width: columnWidths.entityId,
      sorter: (a, b) => (a.entityId || '').localeCompare(b.entityId || ''),
      onHeaderCell: () => ({
        width: columnWidths.entityId,
        onResize: handleResize('entityId'),
      }),
    },
    {
      title: 'Has Errors',
      dataIndex: 'entityHasErrors',
      key: 'entityHasErrors',
      width: 150,
      sorter: (a, b) => Number(a.entityHasErrors) - Number(b.entityHasErrors),
      render: (hasErrors: boolean) => (hasErrors ? 'Yes' : 'No'),
      onHeaderCell: () => ({
        width: 150,
        onResize: handleResize('entityHasErrors'),
      }),
    },
    {
      title: 'Error Event Time-UUID',
      dataIndex: 'errorEventTimeUUID',
      key: 'errorEventTimeUUID',
      width: 250,
      sorter: (a, b) => (a.errorEventTimeUUID || '').localeCompare(b.errorEventTimeUUID || ''),
      onHeaderCell: () => ({
        width: 250,
        onResize: handleResize('errorEventTimeUUID'),
      }),
    },
    {
      title: 'Core-Event-Data-Class',
      dataIndex: 'coreDataClassName',
      key: 'coreDataClassName',
      width: columnWidths.coreDataClassName,
      sorter: (a, b) => (a.coreDataClassName || '').localeCompare(b.coreDataClassName || ''),
      onHeaderCell: () => ({
        width: columnWidths.coreDataClassName,
        onResize: handleResize('coreDataClassName'),
      }),
    },
    {
      title: 'Client-Event-Data-Class',
      dataIndex: 'clientDataClassName',
      key: 'clientDataClassName',
      width: columnWidths.clientDataClassName,
      sorter: (a, b) => (a.clientDataClassName || '').localeCompare(b.clientDataClassName || ''),
      onHeaderCell: () => ({
        width: columnWidths.clientDataClassName,
        onResize: handleResize('clientDataClassName'),
      }),
    },
  ], [columnWidths, handleResize, name]);

  return (
    <div className="processing-events-error-view-table">
      <Table
        columns={columns}
        dataSource={tableData}
        rowKey="timeUUID"
        bordered
        components={{
          header: {
            cell: ResizableTitle,
          },
        }}
        scroll={{ x: 2800 }}
        pagination={{
          pageSizeOptions: ['5', '10', '15', '20', '50'],
          defaultPageSize: 10,
          showSizeChanger: true,
          showTotal: (total) => `Total ${total}`,
          position: ['bottomCenter'],
        }}
      />

      {/* Event View Modal */}
      {selectedEvent && (
        <EventViewModal
          open={modalOpen}
          onClose={() => {
            setModalOpen(false);
            setSelectedEvent(null);
          }}
          queue={selectedEvent.queue}
          shard={selectedEvent.shard}
          timeUUID={selectedEvent.timeUUID}
        />
      )}
    </div>
  );
};

export default ProcessingEventsErrorViewTable;


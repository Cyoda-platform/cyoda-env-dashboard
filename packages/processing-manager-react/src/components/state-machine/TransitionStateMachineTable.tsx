/**
 * Transition State Machine Table Component
 * Migrated from @cyoda/processing-manager/src/components/PmTransitionStateMachine/TransitionStateMachineTable.vue
 */

import React, { useMemo, useState, useEffect, useCallback } from 'react';
import { Card, Table } from 'antd';
import { Link, useParams } from 'react-router-dom';
import type { ColumnsType } from 'antd/es/table';
import type { ResizeCallbackData } from 'react-resizable';
import { HelperStorage } from '@cyoda/http-api-react';
import { ResizableTitle } from '../ResizableTitle';
import './TransitionStateMachineTable.scss';

interface StateMachineEvent {
  event: {
    type: string;
    transactionId: string;
    state: string;
  };
  message: string;
}

interface TransitionStateMachineTableProps {
  stateMachineEvents: StateMachineEvent[];
}

export const TransitionStateMachineTable: React.FC<TransitionStateMachineTableProps> = ({
  stateMachineEvents = [],
}) => {
  const { name } = useParams<{ name: string }>();
  const storage = useMemo(() => new HelperStorage(), []);

  const [columnWidths, setColumnWidths] = useState<Record<string, number>>(() => {
    const saved = storage.get('transitionStateMachine:columnWidths', {});
    const defaultWidths = { eventType: 250, transactionId: 320, state: 200, message: 300 };
    return saved && Object.keys(saved).length > 0 ? saved : defaultWidths;
  });

  useEffect(() => {
    if (Object.keys(columnWidths).length > 0) {
      storage.set('transitionStateMachine:columnWidths', columnWidths);
    }
  }, [columnWidths, storage]);

  const handleResize = useCallback((key: string) => {
    return (_: React.SyntheticEvent, { size }: ResizeCallbackData) => {
      setColumnWidths((prev) => {
        const oldWidth = prev[key];
        const newWidth = size.width;
        const delta = newWidth - oldWidth;
        const otherKeys = Object.keys(prev).filter(k => k !== key);
        if (otherKeys.length === 0) return { ...prev, [key]: newWidth };
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

  const columns: ColumnsType<StateMachineEvent> = useMemo(() => [
    {
      title: 'State Machine Event Type',
      dataIndex: ['event', 'type'],
      key: 'eventType',
      width: columnWidths.eventType,
      onHeaderCell: () => ({ width: columnWidths.eventType, onResize: handleResize('eventType') }),
    },
    {
      title: 'Transaction Id',
      dataIndex: ['event', 'transactionId'],
      key: 'transactionId',
      width: columnWidths.transactionId,
      onHeaderCell: () => ({ width: columnWidths.transactionId, onResize: handleResize('transactionId') }),
      render: (transactionId: string) => (
        <Link to={`/processing-ui/nodes/${name}/transaction/${transactionId}`}>{transactionId}</Link>
      ),
    },
    {
      title: 'Current State',
      dataIndex: ['event', 'state'],
      key: 'state',
      width: columnWidths.state,
      onHeaderCell: () => ({ width: columnWidths.state, onResize: handleResize('state') }),
    },
    {
      title: 'Message',
      dataIndex: 'message',
      key: 'message',
      width: columnWidths.message,
      onHeaderCell: () => ({ width: columnWidths.message, onResize: handleResize('message') }),
    },
  ], [columnWidths, handleResize, name]);

  return (
    <Card className="transition-state-machine-table">
      <Table
        columns={columns}
        dataSource={stateMachineEvents}
        rowKey={(record, index) => `${record.event.transactionId}-${index}`}
        pagination={{
          pageSizeOptions: ['5', '10', '15', '20', '50'],
          defaultPageSize: 10,
          showSizeChanger: true,
          position: ['bottomCenter'],
        }}
        components={{
          header: {
            cell: ResizableTitle,
          },
        }}
      />
    </Card>
  );
};

export default TransitionStateMachineTable;


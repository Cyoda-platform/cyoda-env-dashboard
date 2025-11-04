/**
 * Transition State Machine Table Component
 * Migrated from @cyoda/processing-manager/src/components/PmTransitionStateMachine/TransitionStateMachineTable.vue
 */

import React from 'react';
import { Card, Table } from 'antd';
import { Link, useParams } from 'react-router-dom';
import type { ColumnsType } from 'antd/es/table';

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

  const columns: ColumnsType<StateMachineEvent> = [
    {
      title: 'State Machine Event Type',
      dataIndex: ['event', 'type'],
      key: 'eventType',
    },
    {
      title: 'Transaction Id',
      dataIndex: ['event', 'transactionId'],
      key: 'transactionId',
      width: 320,
      render: (transactionId: string) => (
        <Link to={`/processing-ui/nodes/${name}/transaction/${transactionId}`}>{transactionId}</Link>
      ),
    },
    {
      title: 'Current State',
      dataIndex: ['event', 'state'],
      key: 'state',
    },
    {
      title: 'Message',
      dataIndex: 'message',
      key: 'message',
    },
  ];

  return (
    <Card>
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
      />
    </Card>
  );
};

export default TransitionStateMachineTable;


/**
 * PM Components Service Processes View Ready
 * Migrated from @cyoda/processing-manager/src/components/PmShardsDetailTab/PmShardsDetailTabPmComponents/PmShardsDetailTabPmComponentsServiceProcessesView/PmShardsDetailTabPmComponentsServiceProcessesViewReady.vue
 */

import React from 'react';
import { Table } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import './PmComponentsServiceProcessesViewReady.scss';

interface ServiceProcess {
  name: string;
  shard: string;
  lastStartTime: string;
  lastFinishTime: string;
  lastDurationMillis: number;
  nextStartTime: string;
  processing: boolean;
  queued: boolean;
}

interface PmComponentsServiceProcessesViewReadyProps {
  tableData: ServiceProcess[];
  className?: string;
}

export const PmComponentsServiceProcessesViewReady: React.FC<PmComponentsServiceProcessesViewReadyProps> = ({
  tableData = [],
  className,
}) => {
  const columns: ColumnsType<ServiceProcess> = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      width: 450,
      fixed: 'left',
      sorter: (a, b) => a.name.localeCompare(b.name),
    },
    {
      title: 'Shard',
      dataIndex: 'shard',
      key: 'shard',
      width: 100,
      sorter: (a, b) => a.shard.localeCompare(b.shard),
    },
    {
      title: 'Last Start Time',
      dataIndex: 'lastStartTime',
      key: 'lastStartTime',
      width: 250,
      sorter: (a, b) => a.lastStartTime.localeCompare(b.lastStartTime),
    },
    {
      title: 'Last Finish Time',
      dataIndex: 'lastFinishTime',
      key: 'lastFinishTime',
      width: 250,
      sorter: (a, b) => a.lastFinishTime.localeCompare(b.lastFinishTime),
    },
    {
      title: 'Last Duration Millis',
      dataIndex: 'lastDurationMillis',
      key: 'lastDurationMillis',
      width: 200,
      sorter: (a, b) => a.lastDurationMillis - b.lastDurationMillis,
    },
    {
      title: 'Next Start Time',
      dataIndex: 'nextStartTime',
      key: 'nextStartTime',
      width: 200,
      sorter: (a, b) => a.nextStartTime.localeCompare(b.nextStartTime),
    },
    {
      title: 'Is processing',
      dataIndex: 'processing',
      key: 'processing',
      width: 150,
      sorter: (a, b) => Number(a.processing) - Number(b.processing),
      render: (value) => (value ? 'Yes' : 'No'),
    },
    {
      title: 'Is queued',
      dataIndex: 'queued',
      key: 'queued',
      width: 150,
      sorter: (a, b) => Number(a.queued) - Number(b.queued),
      render: (value) => (value ? 'Yes' : 'No'),
    },
  ];

  return (
    <div className={`pm-components-service-processes-view-ready ${className || ''}`}>
      <h4>Ready(working) processes</h4>
      <Table
        columns={columns}
        dataSource={tableData}
        rowKey="name"
        bordered
        pagination={{
          pageSizeOptions: ['5', '10', '15', '20', '50'],
          defaultPageSize: 10,
          showSizeChanger: true,
        }}
        scroll={{ x: 'max-content' }}
      />
    </div>
  );
};

export default PmComponentsServiceProcessesViewReady;


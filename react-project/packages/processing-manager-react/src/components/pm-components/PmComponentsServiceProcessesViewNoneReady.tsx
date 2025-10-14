/**
 * PM Components Service Processes View None Ready
 * Migrated from @cyoda/processing-manager/src/components/PmShardsDetailTab/PmShardsDetailTabPmComponents/PmShardsDetailTabPmComponentsServiceProcessesView/PmShardsDetailTabPmComponentsServiceProcessesViewNoneReady.vue
 */

import React from 'react';
import { Table } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import './PmComponentsServiceProcessesViewNoneReady.scss';

interface ServiceProcess {
  name: string;
  shard: string;
}

interface PmComponentsServiceProcessesViewNoneReadyProps {
  tableData: ServiceProcess[];
  className?: string;
}

export const PmComponentsServiceProcessesViewNoneReady: React.FC<PmComponentsServiceProcessesViewNoneReadyProps> = ({
  tableData = [],
  className,
}) => {
  const columns: ColumnsType<ServiceProcess> = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      fixed: 'left',
      sorter: (a, b) => a.name.localeCompare(b.name),
    },
    {
      title: 'Shard',
      dataIndex: 'shard',
      key: 'shard',
      width: 200,
      sorter: (a, b) => a.shard.localeCompare(b.shard),
    },
  ];

  return (
    <div className={`pm-components-service-processes-view-none-ready ${className || ''}`}>
      <h4>None ready(none working) processes</h4>
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
      />
    </div>
  );
};

export default PmComponentsServiceProcessesViewNoneReady;


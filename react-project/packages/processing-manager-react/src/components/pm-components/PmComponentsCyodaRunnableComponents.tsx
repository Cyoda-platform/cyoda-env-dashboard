/**
 * PM Components Cyoda Runnable Components
 * Migrated from @cyoda/processing-manager/src/components/PmShardsDetailTab/PmShardsDetailTabPmComponents/PmShardsDetailTabPmComponentsCyodaRunnableComponents.vue
 */

import React, { useState, useEffect } from 'react';
import { Table, Button } from 'antd';
import { PlayCircleOutlined, StopOutlined, SyncOutlined, CheckCircleOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import {
  useLoadRunnableComponents,
  useStartRunnableComponent,
  useStopRunnableComponent,
} from '../../hooks';
import './PmComponentsCyodaRunnableComponents.scss';

interface RunnableComponent {
  id: string;
  name: string;
  running: boolean;
}

export const PmComponentsCyodaRunnableComponents: React.FC = () => {
  const [tableData, setTableData] = useState<RunnableComponent[]>([]);
  const [loadingStart, setLoadingStart] = useState<string | null>(null);
  const [loadingStop, setLoadingStop] = useState<string | null>(null);
  const [loadingReload, setLoadingReload] = useState<string | null>(null);

  const { data, refetch } = useLoadRunnableComponents();
  const { mutateAsync: startComponent } = useStartRunnableComponent();
  const { mutateAsync: stopComponent } = useStopRunnableComponent();

  useEffect(() => {
    if (data?.data) {
      setTableData(data.data);
    }
  }, [data]);

  const handleStart = async (row: RunnableComponent) => {
    try {
      setLoadingStart(row.id);
      await startComponent({ id: row.id });
      await refetch();
    } finally {
      setLoadingStart(null);
    }
  };

  const handleStop = async (row: RunnableComponent) => {
    try {
      setLoadingStop(row.id);
      await stopComponent({ id: row.id });
      await refetch();
    } finally {
      setLoadingStop(null);
    }
  };

  const handleReload = async (row: RunnableComponent) => {
    try {
      setLoadingReload(row.id);
      await stopComponent({ id: row.id });
      await startComponent({ id: row.id });
      await refetch();
    } finally {
      setLoadingReload(null);
    }
  };

  const columns: ColumnsType<RunnableComponent> = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      sorter: (a, b) => a.name.localeCompare(b.name),
      render: (text, record) => (
        <span>
          {record.running ? (
            <CheckCircleOutlined className="icon-running" style={{ marginRight: 8, fontSize: 18 }} />
          ) : (
            <StopOutlined className="icon-stop" style={{ marginRight: 8, fontSize: 18 }} />
          )}
          {text}
        </span>
      ),
    },
    {
      title: 'Operations',
      key: 'operations',
      width: 200,
      render: (_, record) => (
        <div className="operations-buttons">
          <Button
            type="primary"
            shape="circle"
            icon={<PlayCircleOutlined />}
            disabled={record.running}
            loading={loadingStart === record.id}
            onClick={() => handleStart(record)}
            style={{ backgroundColor: '#52c41a', borderColor: '#52c41a' }}
          />
          <Button
            danger
            shape="circle"
            icon={<StopOutlined />}
            disabled={!record.running}
            loading={loadingStop === record.id}
            onClick={() => handleStop(record)}
          />
          <Button
            type="default"
            shape="circle"
            icon={<SyncOutlined />}
            disabled={!record.running}
            loading={loadingReload === record.id}
            onClick={() => handleReload(record)}
            style={{ backgroundColor: '#faad14', borderColor: '#faad14', color: '#fff' }}
          />
        </div>
      ),
    },
  ];

  return (
    <div className="pm-components-cyoda-runnable-components">
      <Table
        columns={columns}
        dataSource={tableData}
        rowKey="id"
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

export default PmComponentsCyodaRunnableComponents;


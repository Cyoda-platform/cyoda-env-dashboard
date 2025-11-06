/**
 * Loaded Online Nodes Component
 * Migrated from @cyoda/processing-manager/src/components/PmShardsDetailTab/PmShardsDetailTabZKInfo/PmLoadedOnlineNodes.vue
 */

import React, { useMemo, useState, useEffect, useCallback } from 'react';
import { Table, Tag } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import type { ResizeCallbackData } from 'react-resizable';
import { HelperStorage } from '@cyoda/http-api-react';
import { ResizableTitle } from '../ResizableTitle';
import { useZkOnlineNodes } from '../../hooks/usePlatformCommon';
import './LoadedOnlineNodes.scss';

interface OnlineNode {
  id: string;
  hostname: string;
  ip: string;
  port: number;
  status: string;
  lastHeartbeat?: string;
}

interface LoadedOnlineNodesProps {
  clusterStateClientNodes?: any;
}

export const LoadedOnlineNodes: React.FC<LoadedOnlineNodesProps> = ({
  clusterStateClientNodes = {},
}) => {
  const storage = useMemo(() => new HelperStorage(), []);
  const { data: nodesData, isLoading } = useZkOnlineNodes();

  const [columnWidths, setColumnWidths] = useState<Record<string, number>>(() => {
    const saved = storage.get('loadedOnlineNodes:columnWidths', {});
    const defaultWidths = {
      id: 200,
      hostname: 200,
      ip: 150,
      port: 100,
      status: 120,
      lastHeartbeat: 200,
    };
    return saved && Object.keys(saved).length > 0 ? saved : defaultWidths;
  });

  useEffect(() => {
    if (Object.keys(columnWidths).length > 0) {
      storage.set('loadedOnlineNodes:columnWidths', columnWidths);
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

  const columns: ColumnsType<OnlineNode> = useMemo(() => [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: columnWidths.id,
      sorter: (a, b) => a.id.localeCompare(b.id),
      onHeaderCell: () => ({ width: columnWidths.id, onResize: handleResize('id') }),
    },
    {
      title: 'Hostname',
      dataIndex: 'hostname',
      key: 'hostname',
      width: columnWidths.hostname,
      sorter: (a, b) => a.hostname.localeCompare(b.hostname),
      onHeaderCell: () => ({ width: columnWidths.hostname, onResize: handleResize('hostname') }),
    },
    {
      title: 'IP Address',
      dataIndex: 'ip',
      key: 'ip',
      width: columnWidths.ip,
      sorter: (a, b) => a.ip.localeCompare(b.ip),
      onHeaderCell: () => ({ width: columnWidths.ip, onResize: handleResize('ip') }),
    },
    {
      title: 'Port',
      dataIndex: 'port',
      key: 'port',
      width: columnWidths.port,
      sorter: (a, b) => a.port - b.port,
      onHeaderCell: () => ({ width: columnWidths.port, onResize: handleResize('port') }),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: columnWidths.status,
      onHeaderCell: () => ({ width: columnWidths.status, onResize: handleResize('status') }),
      render: (status: string) => {
        const color = status === 'ONLINE' ? 'green' : status === 'OFFLINE' ? 'red' : 'default';
        return <Tag color={color}>{status || 'UNKNOWN'}</Tag>;
      },
    },
    {
      title: 'Last Heartbeat',
      dataIndex: 'lastHeartbeat',
      key: 'lastHeartbeat',
      width: columnWidths.lastHeartbeat,
      onHeaderCell: () => ({ width: columnWidths.lastHeartbeat, onResize: handleResize('lastHeartbeat') }),
      render: (date: string) => date || '-',
    },
  ], [columnWidths, handleResize]);

  // Render a table for each node type (DEFAULT, PROCESSING, TOOLBOX)
  const renderTable = (title: string, data: OnlineNode[] = []) => (
    <div key={title} style={{ marginBottom: 24 }}>
      <h4>{title}</h4>
      <Table
        columns={columns}
        dataSource={data}
        rowKey="id"
        bordered
        loading={isLoading}
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
    </div>
  );

  return (
    <div className="loaded-online-nodes">
      <h3>Loaded Online Nodes</h3>
      {nodesData && typeof nodesData === 'object' && !Array.isArray(nodesData) ? (
        <>
          {renderTable('Default', (nodesData as any).DEFAULT)}
          {renderTable('Processing', (nodesData as any).PROCESSING)}
          {renderTable('Toolbox', (nodesData as any).TOOLBOX)}
        </>
      ) : (
        renderTable('All Nodes', Array.isArray(nodesData) ? nodesData : [])
      )}
    </div>
  );
};

export default LoadedOnlineNodes;


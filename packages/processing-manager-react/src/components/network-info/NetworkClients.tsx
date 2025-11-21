/**
 * Network Clients Component
 * Migrated from @cyoda/http-api/src/components/NetworkClients/NetworkClients.vue
 */

import React, { useMemo, useState, useEffect, useCallback } from 'react';
import { Table } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import type { ResizeCallbackData } from 'react-resizable';
import { HelperStorage } from '@cyoda/http-api-react';
import { ResizableTitle } from '../ResizableTitle';
import { useNetworkClients } from '../../hooks/usePlatformCommon';
import './NetworkClients.scss';

interface Transport {
  type: string;
  running: boolean;
  connected: boolean;
}

interface NetworkClient {
  id: string;
  clientType: string;
  nodeType: string;
  host: string;
  port: number;
  transport: Transport;
}

export const NetworkClients: React.FC = () => {
  const storage = useMemo(() => new HelperStorage(), []);
  const { data: clientsData = [], isLoading } = useNetworkClients();

  // Column widths state
  const [columnWidths, setColumnWidths] = useState<Record<string, number>>(() => {
    const saved = storage.get('networkClients:columnWidths', {});
    const defaultWidths = {
      id: 250,
      clientType: 150,
      nodeType: 150,
      host: 150,
      port: 100,
      transportType: 180,
      transportRunning: 120,
      transportConnected: 120,
    };
    return saved && Object.keys(saved).length > 0 ? saved : defaultWidths;
  });

  // Save column widths to localStorage
  useEffect(() => {
    if (Object.keys(columnWidths).length > 0) {
      storage.set('networkClients:columnWidths', columnWidths);
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

  const columns: ColumnsType<NetworkClient> = useMemo(() => [
    {
      title: 'Id',
      dataIndex: 'id',
      key: 'id',
      width: columnWidths.id,
      sorter: (a, b) => a.id.localeCompare(b.id),
      onHeaderCell: () => ({
        width: columnWidths.id,
        onResize: handleResize('id'),
      }),
    },
    {
      title: 'Client Type',
      dataIndex: 'clientType',
      key: 'clientType',
      width: columnWidths.clientType,
      sorter: (a, b) => (a.clientType || '').localeCompare(b.clientType || ''),
      onHeaderCell: () => ({
        width: columnWidths.clientType,
        onResize: handleResize('clientType'),
      }),
    },
    {
      title: 'Node Type',
      dataIndex: 'nodeType',
      key: 'nodeType',
      width: columnWidths.nodeType,
      sorter: (a, b) => (a.nodeType || '').localeCompare(b.nodeType || ''),
      onHeaderCell: () => ({
        width: columnWidths.nodeType,
        onResize: handleResize('nodeType'),
      }),
    },
    {
      title: 'Host',
      dataIndex: 'host',
      key: 'host',
      width: columnWidths.host,
      sorter: (a, b) => (a.host || '').localeCompare(b.host || ''),
      onHeaderCell: () => ({
        width: columnWidths.host,
        onResize: handleResize('host'),
      }),
    },
    {
      title: 'Port',
      dataIndex: 'port',
      key: 'port',
      width: columnWidths.port,
      sorter: (a, b) => a.port - b.port,
      onHeaderCell: () => ({
        width: columnWidths.port,
        onResize: handleResize('port'),
      }),
    },
    {
      title: 'Type',
      dataIndex: ['transport', 'type'],
      key: 'transportType',
      width: columnWidths.transportType,
      sorter: (a, b) => (a.transport?.type || '').localeCompare(b.transport?.type || ''),
      onHeaderCell: () => ({
        width: columnWidths.transportType,
        onResize: handleResize('transportType'),
      }),
    },
    {
      title: 'Running',
      dataIndex: ['transport', 'running'],
      key: 'transportRunning',
      width: columnWidths.transportRunning,
      onHeaderCell: () => ({
        width: columnWidths.transportRunning,
        onResize: handleResize('transportRunning'),
      }),
      render: (running: boolean) => (running ? 'Yes' : 'No'),
    },
    {
      title: 'Connected',
      dataIndex: ['transport', 'connected'],
      key: 'transportConnected',
      width: columnWidths.transportConnected,
      onHeaderCell: () => ({
        width: columnWidths.transportConnected,
        onResize: handleResize('transportConnected'),
      }),
      render: (connected: boolean) => (connected ? 'Yes' : 'No'),
    },
  ], [columnWidths, handleResize]);

  return (
    <div className="network-clients">
      <div>
        <h1 className="label">Clients</h1>
      </div>
      <Table
        columns={columns}
        dataSource={Array.isArray(clientsData) ? clientsData : []}
        rowKey="id"
        bordered
        size="small"
        loading={isLoading}
        pagination={false}
        scroll={{ x: 1200 }}
        components={{
          header: {
            cell: ResizableTitle,
          },
        }}
      />
    </div>
  );
};

export default NetworkClients;


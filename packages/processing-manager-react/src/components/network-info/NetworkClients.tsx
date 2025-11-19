/**
 * Network Clients Component
 * Migrated from @cyoda/processing-manager/src/components/PmShardsDetailTab/PmShardsDetailTabNetworkInfo/PmNetworkClients.vue
 */

import React, { useMemo, useState, useEffect, useCallback } from 'react';
import { Table } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import type { ResizeCallbackData } from 'react-resizable';
import { HelperStorage } from '@cyoda/http-api-react';
import { ResizableTitle } from '../ResizableTitle';
import { useNetworkClients } from '../../hooks/usePlatformCommon';
import './NetworkClients.scss';

interface NetworkClient {
  id: string;
  address: string;
  port: number;
  connected: boolean;
  lastSeen?: string;
}

export const NetworkClients: React.FC = () => {
  const storage = useMemo(() => new HelperStorage(), []);
  const { data: clientsData = [], isLoading } = useNetworkClients();

  // Column widths state
  const [columnWidths, setColumnWidths] = useState<Record<string, number>>(() => {
    const saved = storage.get('networkClients:columnWidths', {});
    const defaultWidths = {
      id: 200,
      address: 200,
      port: 120,
      connected: 150,
      lastSeen: 200,
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
      title: 'Client ID',
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
      title: 'Address',
      dataIndex: 'address',
      key: 'address',
      width: columnWidths.address,
      sorter: (a, b) => a.address.localeCompare(b.address),
      onHeaderCell: () => ({
        width: columnWidths.address,
        onResize: handleResize('address'),
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
      title: 'Status',
      dataIndex: 'connected',
      key: 'connected',
      width: columnWidths.connected,
      onHeaderCell: () => ({
        width: columnWidths.connected,
        onResize: handleResize('connected'),
      }),
      render: (connected: boolean) => (
        <span style={{ color: connected ? '#52c41a' : '#ff4d4f' }}>
          {connected ? 'Connected' : 'Disconnected'}
        </span>
      ),
    },
    {
      title: 'Last Seen',
      dataIndex: 'lastSeen',
      key: 'lastSeen',
      width: columnWidths.lastSeen,
      onHeaderCell: () => ({
        width: columnWidths.lastSeen,
        onResize: handleResize('lastSeen'),
      }),
      render: (date: string) => date || '-',
    },
  ], [columnWidths, handleResize]);

  return (
    <div className="network-clients">
      <h3>Network Clients</h3>
      <Table
        columns={columns}
        dataSource={Array.isArray(clientsData) ? clientsData : []}
        rowKey="id"
        bordered
        loading={isLoading}
        pagination={{
          pageSizeOptions: ['5', '10', '15', '20', '50'],
          defaultPageSize: 10,
          showSizeChanger: true,
          showTotal: (total) => `Total ${total}`,
        }}
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


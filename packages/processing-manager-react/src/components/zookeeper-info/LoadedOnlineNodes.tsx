/**
 * Loaded Online Nodes Component
 * Migrated from @cyoda/processing-manager/src/components/PmShardsDetailTab/PmShardsDetailTabZKInfo/PmLoadedOnlineNodes.vue
 */

import React, { useMemo, useState, useEffect, useCallback } from 'react';
import { Table, Popover } from 'antd';
import { ExclamationCircleOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import type { ResizeCallbackData } from 'react-resizable';
import { HelperStorage } from '@cyoda/http-api-react';
import { ResizableTitle } from '../ResizableTitle';
import { useZkOnlineNodes } from '../../hooks/usePlatformCommon';
import './LoadedOnlineNodes.scss';

interface OnlineNode {
  id: string;
  type: string;
  baseUrl: string;
  host: string;
  notificationsPort: number;
  processingNode: boolean;
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
      id: 250,
      type: 150,
      baseUrl: 250,
      host: 150,
      notificationsPort: 150,
      processingNode: 150,
      action: 80,
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

  // Helper function to get differences between loaded node and cluster state
  const getDifferents = useCallback((row: OnlineNode) => {
    const clusterNodes = clusterStateClientNodes[row.type] || [];
    const rowClusterStateNode = clusterNodes.find((el: any) => el.id === row.id);

    if (rowClusterStateNode) {
      const data = Object.keys(row)
        .map((key) => {
          if (rowClusterStateNode[key] !== (row as any)[key]) {
            return `${key}: ${rowClusterStateNode[key]}`;
          }
          return null;
        })
        .filter((el) => el != null);

      if (data.length > 0) {
        return data;
      }
      return false;
    }
    return "Error. This row was not found!";
  }, [clusterStateClientNodes]);

  const columns: ColumnsType<OnlineNode> = useMemo(() => [
    {
      title: 'Id',
      dataIndex: 'id',
      key: 'id',
      width: columnWidths.id,
      onHeaderCell: () => ({ width: columnWidths.id, onResize: handleResize('id') }),
    },
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
      width: columnWidths.type,
      onHeaderCell: () => ({ width: columnWidths.type, onResize: handleResize('type') }),
    },
    {
      title: 'BaseUrl',
      dataIndex: 'baseUrl',
      key: 'baseUrl',
      width: columnWidths.baseUrl,
      onHeaderCell: () => ({ width: columnWidths.baseUrl, onResize: handleResize('baseUrl') }),
    },
    {
      title: 'Host',
      dataIndex: 'host',
      key: 'host',
      width: columnWidths.host,
      onHeaderCell: () => ({ width: columnWidths.host, onResize: handleResize('host') }),
    },
    {
      title: 'NotificationsPort',
      dataIndex: 'notificationsPort',
      key: 'notificationsPort',
      width: columnWidths.notificationsPort,
      onHeaderCell: () => ({ width: columnWidths.notificationsPort, onResize: handleResize('notificationsPort') }),
    },
    {
      title: 'Processing Node',
      dataIndex: 'processingNode',
      key: 'processingNode',
      width: columnWidths.processingNode,
      onHeaderCell: () => ({ width: columnWidths.processingNode, onResize: handleResize('processingNode') }),
      render: (value: boolean) => (value ? 'true' : 'false'),
    },
    {
      title: 'Action',
      key: 'action',
      width: columnWidths.action,
      onHeaderCell: () => ({ width: columnWidths.action, onResize: handleResize('action') }),
      render: (_: any, record: OnlineNode) => {
        const differents = getDifferents(record);
        if (!differents) return null;

        const content = typeof differents === 'string' ? (
          <span>{differents}</span>
        ) : (
          <div>
            {differents.map((str, idx) => (
              <div key={idx}>{str}</div>
            ))}
          </div>
        );

        return (
          <Popover content={content} title="Cluster state value" placement="topLeft" trigger="hover">
            <ExclamationCircleOutlined className="warning" />
          </Popover>
        );
      },
    },
  ], [columnWidths, handleResize, getDifferents]);

  // Render a table for each node type (DEFAULT, PROCESSING, TOOLBOX)
  const renderTable = (title: string, data: OnlineNode[] = []) => (
    <div key={title} className="loaded-online-nodes-table">
      <h4>{title}</h4>
      <Table
        columns={columns}
        dataSource={data}
        rowKey="id"
        bordered
        size="small"
        loading={isLoading}
        pagination={false}
        locale={{ emptyText: 'No Data' }}
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
      <h1 className="label main">Loaded Online Nodes</h1>
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


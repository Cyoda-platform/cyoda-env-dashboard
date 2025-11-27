/**
 * PM Components Cyoda Runnable Components
 * Migrated from @cyoda/processing-manager/src/components/PmShardsDetailTab/PmShardsDetailTabPmComponents/PmShardsDetailTabPmComponentsCyodaRunnableComponents.vue
 */

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Table, Button } from 'antd';
import { PlayCircleOutlined, StopOutlined, SyncOutlined, CheckCircleOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import type { ResizeCallbackData } from 'react-resizable';
import { HelperStorage } from '@cyoda/http-api-react';
import { ResizableTitle } from '../ResizableTitle';
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
  const storage = useMemo(() => new HelperStorage(), []);
  const [tableData, setTableData] = useState<RunnableComponent[]>([]);
  const [loadingStart, setLoadingStart] = useState<string | null>(null);
  const [loadingStop, setLoadingStop] = useState<string | null>(null);
  const [loadingReload, setLoadingReload] = useState<string | null>(null);

  const { data, refetch } = useLoadRunnableComponents();
  const { mutateAsync: startComponent } = useStartRunnableComponent();
  const { mutateAsync: stopComponent } = useStopRunnableComponent();

  // Column widths state
  const [columnWidths, setColumnWidths] = useState<Record<string, number>>(() => {
    const saved = storage.get('pmComponentsRunnableComponents:columnWidths', {});
    const defaultWidths = {
      name: 400,
      operations: 200,
    };
    return saved && Object.keys(saved).length > 0 ? saved : defaultWidths;
  });

  // Save column widths to localStorage
  useEffect(() => {
    if (Object.keys(columnWidths).length > 0) {
      storage.set('pmComponentsRunnableComponents:columnWidths', columnWidths);
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

  useEffect(() => {
    if (data) {
      setTableData(data);
    }
  }, [data]);

  const handleStart = async (row: RunnableComponent) => {
    try {
      setLoadingStart(row.id);
      await startComponent({ id: row.id });
      await refetch();
    } catch (error) {
      console.error('Error starting component:', error);
    } finally {
      setLoadingStart(null);
    }
  };

  const handleStop = async (row: RunnableComponent) => {
    try {
      setLoadingStop(row.id);
      await stopComponent({ id: row.id });
      await refetch();
    } catch (error) {
      console.error('Error stopping component:', error);
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
    } catch (error) {
      console.error('Error reloading component:', error);
    } finally {
      setLoadingReload(null);
    }
  };

  const columns: ColumnsType<RunnableComponent> = useMemo(() => [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      width: columnWidths.name,
      sorter: (a, b) => a.name.localeCompare(b.name),
      onHeaderCell: () => ({
        width: columnWidths.name,
        onResize: handleResize('name'),
      }),
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
      width: columnWidths.operations,
      onHeaderCell: () => ({
        width: columnWidths.operations,
        onResize: handleResize('operations'),
      }),
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
  ], [columnWidths, handleResize, loadingStart, loadingStop, loadingReload]);

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
          showTotal: (total) => `Total ${total}`,
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
};

export default PmComponentsCyodaRunnableComponents;


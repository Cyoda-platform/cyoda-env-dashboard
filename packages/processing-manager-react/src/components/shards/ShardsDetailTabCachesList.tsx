/**
 * Shards Detail Tab - Caches List
 * Tab showing caches list information
 * Migrated from @cyoda/processing-manager/src/components/PmShardsDetailTab/PmShardsDetailTabCachesList.vue
 */

import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { Card, Table, Button, Tooltip, Alert, message } from 'antd';
import { SyncOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import type { ResizeCallbackData } from 'react-resizable';
import { HelperStorage } from '@cyoda/http-api-react';
import { ResizableTitle } from '../ResizableTitle';
import moment from 'moment';
import { useCachesList, useCacheKeys, useInvalidateCache } from '../../hooks/usePlatformCommon';
import './ShardsDetailTabCachesList.scss';

interface CacheKey {
  key: string;
}

interface CacheItem {
  cache: string;
  cacheServiceClass: string;
  size: number;
  lastInvalidateAllTime?: string;
  lastInvalidateKeyTime?: string;
}

interface CacheItemWithKeys extends CacheItem {
  cacheKeys?: string[];
  keysLoading?: boolean;
}

export const ShardsDetailTabCachesList: React.FC = () => {
  const storage = useMemo(() => new HelperStorage(), []);
  const [expandedRowKeys, setExpandedRowKeys] = useState<React.Key[]>([]);
  const [cacheKeysData, setCacheKeysData] = useState<Record<string, string[]>>({});
  const [loadingKeys, setLoadingKeys] = useState<Record<string, boolean>>({});

  // Fetch caches list
  const { data: cachesData = [], isLoading: cachesLoading, refetch } = useCachesList();

  // Invalidate cache mutation
  const invalidateMutation = useInvalidateCache();

  const [columnWidths, setColumnWidths] = useState<Record<string, number>>(() => {
    const saved = storage.get('cachesList:columnWidths', {});
    const defaultWidths = {
      cache: 300,
      cacheServiceClass: 300,
      size: 150,
      lastInvalidateAllTime: 200,
      lastInvalidateKeyTime: 200,
      actions: 100,
    };
    return saved && Object.keys(saved).length > 0 ? saved : defaultWidths;
  });

  useEffect(() => {
    if (Object.keys(columnWidths).length > 0) {
      storage.set('cachesList:columnWidths', columnWidths);
    }
  }, [columnWidths, storage]);

  const handleResize = useCallback((key: string) => {
    return (_: React.SyntheticEvent, { size }: ResizeCallbackData) => {
      setColumnWidths((prev) => {
        const oldWidth = prev[key];
        const newWidth = size.width;
        const delta = newWidth - oldWidth;
        const otherKeys = Object.keys(prev).filter(k => k !== key && k !== 'actions');
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

  const handleInvalidate = async (record: CacheItem) => {
    try {
      await invalidateMutation.mutateAsync(record.cache);
      message.success(`Cache "${record.cache}" invalidated successfully`);
      refetch();
    } catch (error) {
      message.error(`Failed to invalidate cache: ${error}`);
    }
  };

  const handleExpand = async (expanded: boolean, record: CacheItem) => {
    if (expanded && !cacheKeysData[record.cache]) {
      // Load cache keys when expanding
      setLoadingKeys({ ...loadingKeys, [record.cache]: true });
      try {
        const response = await fetch(`/platform-common/cache-info/cache-keys?cacheType=${encodeURIComponent(record.cache)}`);
        const data = await response.json();
        setCacheKeysData({ ...cacheKeysData, [record.cache]: data });
      } catch (error) {
        message.error(`Failed to load cache keys: ${error}`);
      } finally {
        setLoadingKeys({ ...loadingKeys, [record.cache]: false });
      }
    }
  };

  const expandedRowRender = (record: CacheItem) => {
    const keys = cacheKeysData[record.cache] || [];
    const cacheKeys: CacheKey[] = keys.map((key: string) => ({ key }));

    const keysColumns: ColumnsType<CacheKey> = [
      {
        title: 'Key',
        dataIndex: 'key',
        key: 'key',
        sorter: (a, b) => a.key.localeCompare(b.key),
      },
    ];

    return (
      <Table
        columns={keysColumns}
        dataSource={cacheKeys}
        rowKey="key"
        bordered
        size="small"
        loading={loadingKeys[record.cache]}
        pagination={false}
      />
    );
  };

  const columns: ColumnsType<CacheItem> = useMemo(() => [
    {
      title: 'Cache',
      dataIndex: 'cache',
      key: 'cache',
      width: columnWidths.cache,
      sorter: (a, b) => a.cache.localeCompare(b.cache),
      onHeaderCell: () => ({ width: columnWidths.cache, onResize: handleResize('cache') }),
    },
    {
      title: 'Cache Service Class',
      dataIndex: 'cacheServiceClass',
      key: 'cacheServiceClass',
      width: columnWidths.cacheServiceClass,
      sorter: (a, b) => a.cacheServiceClass.localeCompare(b.cacheServiceClass),
      onHeaderCell: () => ({ width: columnWidths.cacheServiceClass, onResize: handleResize('cacheServiceClass') }),
    },
    {
      title: 'Size',
      dataIndex: 'size',
      key: 'size',
      width: columnWidths.size,
      sorter: (a, b) => a.size - b.size,
      onHeaderCell: () => ({ width: columnWidths.size, onResize: handleResize('size') }),
      render: (size: number) => size?.toLocaleString() || 0,
    },
    {
      title: 'Last Invalidate All Time',
      dataIndex: 'lastInvalidateAllTime',
      key: 'lastInvalidateAllTime',
      width: columnWidths.lastInvalidateAllTime,
      onHeaderCell: () => ({ width: columnWidths.lastInvalidateAllTime, onResize: handleResize('lastInvalidateAllTime') }),
      render: (date: string) => (date ? moment(date).format('YYYY-MM-DD HH:mm:ss') : '-'),
      sorter: (a, b) => {
        const aDate = a.lastInvalidateAllTime ? moment(a.lastInvalidateAllTime).valueOf() : 0;
        const bDate = b.lastInvalidateAllTime ? moment(b.lastInvalidateAllTime).valueOf() : 0;
        return aDate - bDate;
      },
    },
    {
      title: 'Last Invalidate Key Time',
      dataIndex: 'lastInvalidateKeyTime',
      key: 'lastInvalidateKeyTime',
      width: columnWidths.lastInvalidateKeyTime,
      onHeaderCell: () => ({ width: columnWidths.lastInvalidateKeyTime, onResize: handleResize('lastInvalidateKeyTime') }),
      render: (date: string) => (date ? moment(date).format('YYYY-MM-DD HH:mm:ss') : '-'),
      sorter: (a, b) => {
        const aDate = a.lastInvalidateKeyTime ? moment(a.lastInvalidateKeyTime).valueOf() : 0;
        const bDate = b.lastInvalidateKeyTime ? moment(b.lastInvalidateKeyTime).valueOf() : 0;
        return aDate - bDate;
      },
    },
    {
      title: 'Actions',
      key: 'actions',
      fixed: 'right',
      width: columnWidths.actions,
      render: (_, record) => (
        <Tooltip title="Invalidate">
          <Button
            type="primary"
            icon={<SyncOutlined />}
            onClick={() => handleInvalidate(record)}
          />
        </Tooltip>
      ),
    },
  ], [columnWidths, handleResize]);

  return (
    <Card className="shards-detail-tab-caches-list">
      <h1 style={{ fontSize: '24px', marginBottom: 16 }}>Caches List</h1>

      <Table
        columns={columns}
        dataSource={cachesData}
        rowKey="cache"
        bordered
        size="small"
        loading={cachesLoading || invalidateMutation.isPending}
        expandable={{
          expandedRowRender,
          expandedRowKeys,
          onExpandedRowsChange: (keys) => setExpandedRowKeys(keys),
          onExpand: handleExpand,
        }}
        pagination={{
          pageSizeOptions: ['5', '10', '15', '20', '50'],
          defaultPageSize: 10,
          showSizeChanger: true,
          position: ['bottomCenter'],
        }}
        scroll={{ x: 1200 }}
        components={{
          header: {
            cell: ResizableTitle,
          },
        }}
      />
    </Card>
  );
};

export default ShardsDetailTabCachesList;


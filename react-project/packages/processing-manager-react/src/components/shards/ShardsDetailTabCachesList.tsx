/**
 * Shards Detail Tab - Caches List
 * Tab showing caches list information
 * Migrated from @cyoda/processing-manager/src/components/PmShardsDetailTab/PmShardsDetailTabCachesList.vue
 */

import React, { useState } from 'react';
import { Card, Table, Button, Tooltip, Alert, message } from 'antd';
import { SyncOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import moment from 'moment';
import { useCachesList, useCacheKeys, useInvalidateCache } from '../../hooks/usePlatformCommon';

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
  const [expandedRowKeys, setExpandedRowKeys] = useState<React.Key[]>([]);
  const [cacheKeysData, setCacheKeysData] = useState<Record<string, string[]>>({});
  const [loadingKeys, setLoadingKeys] = useState<Record<string, boolean>>({});

  // Fetch caches list
  const { data: cachesData = [], isLoading: cachesLoading, refetch } = useCachesList();

  // Invalidate cache mutation
  const invalidateMutation = useInvalidateCache();

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

  const columns: ColumnsType<CacheItem> = [
    {
      title: 'Cache',
      dataIndex: 'cache',
      key: 'cache',
      sorter: (a, b) => a.cache.localeCompare(b.cache),
    },
    {
      title: 'Cache Service Class',
      dataIndex: 'cacheServiceClass',
      key: 'cacheServiceClass',
      sorter: (a, b) => a.cacheServiceClass.localeCompare(b.cacheServiceClass),
    },
    {
      title: 'Size',
      dataIndex: 'size',
      key: 'size',
      sorter: (a, b) => a.size - b.size,
      render: (size: number) => size?.toLocaleString() || 0,
    },
    {
      title: 'Last Invalidate All Time',
      dataIndex: 'lastInvalidateAllTime',
      key: 'lastInvalidateAllTime',
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
      width: 100,
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
  ];

  return (
    <Card>
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
      />
    </Card>
  );
};

export default ShardsDetailTabCachesList;


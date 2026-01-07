/**
 * Shards Detail Tab - Caches List
 * Tab showing caches list information
 * Migrated from @cyoda/processing-manager/src/components/PmShardsDetailTab/PmShardsDetailTabCachesList.vue
 */

import React, { useState, useMemo, useEffect } from 'react';
import { Table, Button, Tooltip, Alert, message } from 'antd';
import { SyncOutlined, RightOutlined, DownOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import moment from 'moment';
import { useCachesList, useInvalidateCache } from '../../hooks/usePlatformCommon';
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

  const [expandedRowKeys, setExpandedRowKeys] = useState<React.Key[]>([]);
  const [cacheKeysData, setCacheKeysData] = useState<Record<string, string[]>>({});
  const [loadingKeys, setLoadingKeys] = useState<Record<string, boolean>>({});

  // Fetch caches list
  const { data: cachesData = [], isLoading: cachesLoading, error: cachesError, refetch } = useCachesList();


  // Invalidate cache mutation
  const invalidateMutation = useInvalidateCache();

  // Log errors for debugging
  useEffect(() => {
    if (cachesError) {
      console.error('Error fetching caches list:', cachesError);
    }
  }, [cachesError]);

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
        // data should be an array of strings
        setCacheKeysData({ ...cacheKeysData, [record.cache]: Array.isArray(data) ? data : [] });
      } catch (error) {
        message.error(`Failed to load cache keys: ${error}`);
        setCacheKeysData({ ...cacheKeysData, [record.cache]: [] });
      } finally {
        setLoadingKeys({ ...loadingKeys, [record.cache]: false });
      }
    }
  };

  const expandedRowRender = (record: CacheItem) => {
    const keys = cacheKeysData[record.cache];
    if (!keys || !Array.isArray(keys)) {
      return <div style={{ padding: '16px' }}>No keys available</div>;
    }
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

  const columns: ColumnsType<CacheItem> = useMemo(() => {
    return [
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
      width: 80,
      sorter: (a, b) => a.size - b.size,
      render: (size: number) => size?.toLocaleString() || 0,
    },
    {
      title: 'Last Invalidate All Time',
      dataIndex: 'lastInvalidateAllTime',
      key: 'lastInvalidateAllTime',
      width: 160,
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
      width: 160,
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
      width: 90,
      align: 'center',
      render: (_, record) => (
        <Tooltip title="Invalidate">
          <Button
            type="primary"
            size="small"
            icon={<SyncOutlined />}
            onClick={() => handleInvalidate(record)}
          />
        </Tooltip>
      ),
    },
  ];
  }, []);

  return (
    <div className="shards-detail-tab-caches-list" style={{ padding: '20px' }}>
      <h1 style={{ fontSize: '20px', fontWeight: 600, marginBottom: 16 }}>Caches List</h1>

      {cachesError && (
        <Alert
          message="Error Loading Caches"
          description={`Failed to load caches list: ${cachesError instanceof Error ? cachesError.message : 'Unknown error'}`}
          type="error"
          showIcon
          style={{ marginBottom: 16 }}
          action={
            <Button size="small" onClick={() => refetch()}>
              Retry
            </Button>
          }
        />
      )}

      <Table
        key="caches-table-v2"
        columns={columns}
        dataSource={cachesData}
        rowKey="cache"
        bordered
        size="small"
        tableLayout="fixed"
        loading={cachesLoading || invalidateMutation.isPending}
        expandable={{
          expandedRowRender,
          expandedRowKeys,
          onExpandedRowsChange: (keys) => setExpandedRowKeys(keys),
          onExpand: handleExpand,
          expandIcon: ({ expanded, onExpand, record }) =>
            expanded ? (
              <DownOutlined onClick={(e) => onExpand(record, e)} style={{ cursor: 'pointer' }} />
            ) : (
              <RightOutlined onClick={(e) => onExpand(record, e)} style={{ cursor: 'pointer' }} />
            ),
        }}
        pagination={{
          pageSizeOptions: ['5', '10', '15', '20', '50'],
          defaultPageSize: 10,
          showSizeChanger: true,
          showTotal: (total) => `Total ${total}`,
          position: ['bottomCenter'],
        }}
      />
    </div>
  );
};

export default ShardsDetailTabCachesList;


/**
 * Mock API Adapter for Testing Processing Manager
 * 
 * Uses axios adapter to intercept requests and return mock data
 * This prevents actual HTTP requests from being made
 */

import type { AxiosAdapter, AxiosRequestConfig, AxiosResponse } from 'axios';
import {
  mockClusterStats,
  mockSummary,
  mockShards,
  mockCassandraStats,
  mockProcessingEvents,
  mockTimeStats,
  mockTransactions,
  mockRunnableComponents,
  mockCompositeIndexes,
  mockCachesList,
  mockNetworkInfo,
  mockZooKeeperInfo,
  mockServerSummary,
  TEST_NODE_NAME,
} from './testNodeData';

/**
 * Get mock data for a given URL
 */
function getMockData(url: string): any | null {
  console.log('🧪 Mock API Request:', url);

  // Cluster stats
  if (url.includes('/pm-cluster-stats-full.do')) {
    console.log('🧪 Returning mock cluster stats');
    return mockClusterStats;
  }

  // Summary
  if (url.includes('/platform-processing/summary')) {
    console.log('🧪 Returning mock summary');
    return mockSummary;
  }

  // Shards
  if (url.includes('/platform-processing/shards')) {
    console.log('🧪 Returning mock shards');
    return mockShards;
  }

  // Cassandra stats
  if (url.includes('/platform-processing/cassandra/stats')) {
    console.log('🧪 Returning mock Cassandra stats');
    return mockCassandraStats;
  }

  // Processing events
  if (url.includes('/platform-processing/stats/process-events') || 
      url.includes('/platform-processing/processing-queue/events')) {
    console.log('🧪 Returning mock processing events');
    return mockProcessingEvents;
  }

  // Time statistics
  if (url.includes('/platform-processing/stats/time')) {
    console.log('🧪 Returning mock time stats');
    return mockTimeStats;
  }

  // Count statistics
  if (url.includes('/platform-processing/stats/count')) {
    console.log('🧪 Returning mock count stats');
    return {
      total: mockProcessingEvents.total,
      byStatus: {
        PENDING: 200,
        PROCESSING: 50,
        COMPLETED: 1000,
        FAILED: 50,
      },
      byType: {
        ENTITY_CREATED: 500,
        ENTITY_UPDATED: 600,
        ENTITY_DELETED: 150,
      },
    };
  }

  // Transactions
  if (url.includes('/platform-processing/transactions/view') ||
      url.includes('/platform-processing/exec-transactions-info-json.do')) {
    console.log('🧪 Returning mock transactions');
    return mockTransactions;
  }

  // Transaction statuses
  if (url.includes('/platform-processing/transactions/statuses')) {
    console.log('🧪 Returning mock transaction statuses');
    return ['PENDING', 'IN_PROGRESS', 'COMPLETED', 'FAILED', 'CANCELLED'];
  }

  // Transaction event status filters
  if (url.includes('/platform-processing/transactions/event-ref-status-filters')) {
    console.log('🧪 Returning mock event status filters');
    return ['PENDING', 'PROCESSING', 'COMPLETED', 'FAILED'];
  }

  // Runnable components (PM components)
  if (url.includes('/platform-processing/runnable-components.do')) {
    console.log('🧪 Returning mock runnable components');
    return mockRunnableComponents;
  }

  // Service processes stats
  if (url.includes('/platform-processing/service-processes/service-processes-stats.do')) {
    console.log('🧪 Returning mock service processes');
    return mockRunnableComponents;
  }

  // Entity types (for composite indexes dropdown)
  if (url.includes('/platform-api/entity-info/fetch/types')) {
    console.log('🧪 Returning mock entity types');
    return [
      'Transaction',
      'Event',
      'ProcessingTask',
      'CassandraEntity',
      'ZooKeeperNode',
      'CacheEntry',
    ];
  }

  // Composite indexes
  if (url.includes('/platform-processing/composite-indexes') ||
      url.includes('/platform-common/composite-indexes')) {
    console.log('🧪 Returning mock composite indexes');

    // Extract entityClass from URL query params
    try {
      const urlObj = new URL(url, 'http://localhost');
      const entityClass = urlObj.searchParams.get('entityClass');

      // Filter indexes by entity class if specified
      const filteredIndexes = entityClass
        ? mockCompositeIndexes.filter(idx => idx.entityClass === entityClass)
        : mockCompositeIndexes;

      console.log(`🧪 Filtered ${filteredIndexes.length} indexes for entity: ${entityClass || 'all'}`);
      return filteredIndexes;
    } catch (e) {
      return mockCompositeIndexes;
    }
  }

  // Caches list
  if (url.includes('/platform-processing/caches') ||
      url.includes('/platform-common/caches-list') ||
      url.includes('/platform-common/cache-info/caches-list')) {
    console.log('🧪 Returning mock caches');
    return mockCachesList;
  }

  // Network info - server
  if (url.includes('/platform-common/net-info/server')) {
    console.log('🧪 Returning mock network server info');
    return mockNetworkInfo.server;
  }

  // Network info - clients
  if (url.includes('/platform-common/net-info/clients')) {
    console.log('🧪 Returning mock network clients');
    return mockNetworkInfo.clients;
  }

  // ZooKeeper info
  if (url.includes('/platform-common/zk-info/curr-node-info')) {
    console.log('🧪 Returning mock ZK current node info');
    return mockZooKeeperInfo.currentNode;
  }

  if (url.includes('/platform-common/zk-info/loaded-online-nodes')) {
    console.log('🧪 Returning mock ZK online nodes');
    return mockZooKeeperInfo.onlineNodes;
  }

  if (url.includes('/platform-common/zk-info/loaded-shards-distribution')) {
    console.log('🧪 Returning mock ZK shards distribution');
    return mockZooKeeperInfo.shardsDistribution;
  }

  if (url.includes('/platform-common/zk-info/cluster-state')) {
    console.log('🧪 Returning mock ZK cluster state');
    return mockZooKeeperInfo.clusterState;
  }

  // Server summary / polling info
  if (url.includes('/platform-processing/polling-info-json.do')) {
    console.log('🧪 Returning mock server summary');
    return mockServerSummary;
  }

  // Execution monitors
  if (url.includes('/platform-processing/exec-monitors-info-json.do')) {
    console.log('🧪 Returning mock execution monitors');
    return [
      {
        name: 'EventMonitor',
        status: 'RUNNING',
        lastCheck: new Date().toISOString(),
        checkInterval: 5000,
        healthy: true,
      },
      {
        name: 'TransactionMonitor',
        status: 'RUNNING',
        lastCheck: new Date().toISOString(),
        checkInterval: 10000,
        healthy: true,
      },
    ];
  }

  // No mock data found
  return null;
}

/**
 * Create a mock axios adapter
 */
export function createMockAdapter(originalAdapter: AxiosAdapter): AxiosAdapter {
  return async (config: AxiosRequestConfig): Promise<AxiosResponse> => {
    const url = config.url || '';
    
    // Try to get mock data
    const mockData = getMockData(url);
    
    if (mockData !== null) {
      // Return mock response
      return Promise.resolve({
        data: mockData,
        status: 200,
        statusText: 'OK',
        headers: {},
        config,
      } as AxiosResponse);
    }
    
    // No mock data, use original adapter
    console.log('⚠️ No mock data for:', url, '- using original adapter');
    return originalAdapter(config);
  };
}

export { TEST_NODE_NAME };


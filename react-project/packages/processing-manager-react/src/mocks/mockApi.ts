/**
 * Mock API for Testing Processing Manager
 * 
 * Intercepts axios requests and returns mock data for the test node
 */

import { axiosProcessing } from '@cyoda/http-api-react';
import type { AxiosInstance } from 'axios';
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

const MOCK_API_STORAGE_KEY = 'processing-manager-mock-api-enabled';

// Check localStorage on initialization
const getInitialMockState = (): boolean => {
  if (typeof window === 'undefined') return false;
  const stored = localStorage.getItem(MOCK_API_STORAGE_KEY);
  return stored === 'true';
};

let mockEnabled = getInitialMockState();
let requestInterceptorId: number | null = null;
let responseInterceptorId: number | null = null;

/**
 * Enable mock API responses
 */
export function enableMockApi() {
  if (mockEnabled) return;

  console.log('🧪 Mock API enabled for Processing Manager testing');
  mockEnabled = true;

  // Persist to localStorage
  if (typeof window !== 'undefined') {
    localStorage.setItem(MOCK_API_STORAGE_KEY, 'true');
  }

  setupMockInterceptors(axiosProcessing);

  // Make functions available globally for testing
  if (typeof window !== 'undefined') {
    (window as any).enableMockApi = enableMockApi;
    (window as any).disableMockApi = disableMockApi;
    (window as any).isMockApiEnabled = isMockApiEnabled;
  }
}

/**
 * Disable mock API responses
 */
export function disableMockApi() {
  if (!mockEnabled) return;

  console.log('🧪 Mock API disabled');
  mockEnabled = false;

  // Remove from localStorage
  if (typeof window !== 'undefined') {
    localStorage.removeItem(MOCK_API_STORAGE_KEY);
  }

  // Remove interceptors
  if (requestInterceptorId !== null) {
    axiosProcessing.interceptors.request.eject(requestInterceptorId);
    requestInterceptorId = null;
  }
  if (responseInterceptorId !== null) {
    axiosProcessing.interceptors.response.eject(responseInterceptorId);
    responseInterceptorId = null;
  }
}

/**
 * Setup axios interceptors to return mock data
 */
function setupMockInterceptors(axios: AxiosInstance) {
  // Request interceptor - log requests
  requestInterceptorId = axios.interceptors.request.use(
    (config) => {
      if (mockEnabled) {
        console.log('🧪 Mock API Request:', config.method?.toUpperCase(), config.url);
      }
      return config;
    },
    (error) => Promise.reject(error)
  );

  // Response interceptor - return mock data
  responseInterceptorId = axios.interceptors.response.use(
    (response) => {
      if (!mockEnabled) return response;

      const url = response.config.url || '';
      
      // Cluster stats
      if (url.includes('/pm-cluster-stats-full.do')) {
        console.log('🧪 Returning mock cluster stats');
        return { ...response, data: mockClusterStats };
      }

      // Summary
      if (url.includes('/platform-processing/summary')) {
        console.log('🧪 Returning mock summary');
        return { ...response, data: mockSummary };
      }

      // Shards
      if (url.includes('/platform-processing/shards')) {
        console.log('🧪 Returning mock shards');
        return { ...response, data: mockShards };
      }

      // Cassandra stats
      if (url.includes('/platform-processing/cassandra/stats')) {
        console.log('🧪 Returning mock Cassandra stats');
        return { ...response, data: mockCassandraStats };
      }

      // Processing events
      if (url.includes('/platform-processing/stats/process-events') || 
          url.includes('/platform-processing/processing-queue/events')) {
        console.log('🧪 Returning mock processing events');
        return { ...response, data: mockProcessingEvents };
      }

      // Time statistics
      if (url.includes('/platform-processing/stats/time')) {
        console.log('🧪 Returning mock time stats');
        return { ...response, data: mockTimeStats };
      }

      // Count statistics
      if (url.includes('/platform-processing/stats/count')) {
        console.log('🧪 Returning mock count stats');
        return { 
          ...response, 
          data: {
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
          }
        };
      }

      // Transactions
      if (url.includes('/platform-processing/transactions/view') ||
          url.includes('/platform-processing/exec-transactions-info-json.do')) {
        console.log('🧪 Returning mock transactions');
        return { ...response, data: mockTransactions };
      }

      // Transaction statuses
      if (url.includes('/platform-processing/transactions/statuses')) {
        console.log('🧪 Returning mock transaction statuses');
        return { 
          ...response, 
          data: ['PENDING', 'IN_PROGRESS', 'COMPLETED', 'FAILED', 'CANCELLED']
        };
      }

      // Transaction event status filters
      if (url.includes('/platform-processing/transactions/event-ref-status-filters')) {
        console.log('🧪 Returning mock event status filters');
        return {
          ...response,
          data: ['PENDING', 'PROCESSING', 'COMPLETED', 'FAILED']
        };
      }

      // Runnable components (PM components)
      if (url.includes('/platform-processing/runnable-components.do')) {
        console.log('🧪 Returning mock runnable components');
        return { ...response, data: mockRunnableComponents };
      }

      // Service processes stats
      if (url.includes('/platform-processing/service-processes/service-processes-stats.do')) {
        console.log('🧪 Returning mock service processes');
        return { ...response, data: mockRunnableComponents };
      }

      // Entity types (for composite indexes dropdown)
      if (url.includes('/platform-api/entity-info/fetch/types')) {
        console.log('🧪 Returning mock entity types');
        return {
          ...response,
          data: [
            'Transaction',
            'Event',
            'ProcessingTask',
            'CassandraEntity',
            'ZooKeeperNode',
            'CacheEntry',
          ]
        };
      }

      // Composite indexes
      if (url.includes('/platform-processing/composite-indexes') ||
          url.includes('/platform-common/composite-indexes')) {
        console.log('🧪 Returning mock composite indexes');

        // Extract entityClass from URL query params
        const urlObj = new URL(url, 'http://localhost');
        const entityClass = urlObj.searchParams.get('entityClass');

        // Filter indexes by entity class if specified
        const filteredIndexes = entityClass
          ? mockCompositeIndexes.filter(idx => idx.entityClass === entityClass)
          : mockCompositeIndexes;

        console.log(`🧪 Filtered ${filteredIndexes.length} indexes for entity: ${entityClass || 'all'}`);
        return { ...response, data: filteredIndexes };
      }

      // Caches list
      if (url.includes('/platform-processing/caches') ||
          url.includes('/platform-common/caches-list')) {
        console.log('🧪 Returning mock caches');
        return { ...response, data: mockCachesList };
      }

      // Network info
      if (url.includes('/platform-common/net-info')) {
        console.log('🧪 Returning mock network info');
        return { ...response, data: mockNetworkInfo };
      }

      // ZooKeeper info
      if (url.includes('/platform-common/zk-info/curr-node-info')) {
        console.log('🧪 Returning mock ZK current node info');
        return { ...response, data: mockZooKeeperInfo.currentNode };
      }

      if (url.includes('/platform-common/zk-info/loaded-online-nodes')) {
        console.log('🧪 Returning mock ZK online nodes');
        return { ...response, data: mockZooKeeperInfo.onlineNodes };
      }

      if (url.includes('/platform-common/zk-info/loaded-shards-distribution')) {
        console.log('🧪 Returning mock ZK shards distribution');
        return { ...response, data: mockZooKeeperInfo.shardsDistribution };
      }

      if (url.includes('/platform-common/zk-info/cluster-state')) {
        console.log('🧪 Returning mock ZK cluster state');
        return { ...response, data: mockZooKeeperInfo.clusterState };
      }

      // Server summary / polling info
      if (url.includes('/platform-processing/polling-info-json.do')) {
        console.log('🧪 Returning mock server summary');
        return { ...response, data: mockServerSummary };
      }

      // Execution monitors
      if (url.includes('/platform-processing/exec-monitors-info-json.do')) {
        console.log('🧪 Returning mock execution monitors');
        return {
          ...response,
          data: [
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
          ]
        };
      }

      // Sift logger
      if (url.includes('/platform-processing/processing-queue/sift-logger.do')) {
        console.log('🧪 Returning mock sift logger');
        return {
          ...response,
          data: {
            enabled: true,
            level: 'INFO',
            filters: [],
          }
        };
      }

      // Polling info
      if (url.includes('/platform-processing/polling-info')) {
        console.log('🧪 Returning mock polling info');
        return { ...response, data: mockServerSummary };
      }

      // Default: return original response
      return response;
    },
    (error) => {
      if (!mockEnabled) return Promise.reject(error);

      // If mock is enabled and we get a network error, return mock data
      console.warn('🧪 Mock API: Network error intercepted, returning empty data', error.config?.url);
      
      return Promise.resolve({
        data: {},
        status: 200,
        statusText: 'OK (Mocked)',
        headers: {},
        config: error.config,
      });
    }
  );
}

/**
 * Check if mock API is enabled
 */
export function isMockApiEnabled(): boolean {
  return mockEnabled;
}

/**
 * Toggle mock API on/off
 */
export function toggleMockApi(): boolean {
  if (mockEnabled) {
    disableMockApi();
  } else {
    enableMockApi();
  }
  return mockEnabled;
}

// Auto-enable mock API if it was previously enabled
if (mockEnabled) {
  setupMockInterceptors(axiosProcessing);
  console.log('🧪 Mock API auto-enabled from previous session');
}

// Make functions available globally for testing
if (typeof window !== 'undefined') {
  (window as any).enableMockApi = enableMockApi;
  (window as any).disableMockApi = disableMockApi;
  (window as any).isMockApiEnabled = isMockApiEnabled;
}

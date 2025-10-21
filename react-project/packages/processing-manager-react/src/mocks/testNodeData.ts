/**
 * Mock Data for Test Node
 * 
 * Comprehensive mock data for testing all Processing Manager features
 */

export const TEST_NODE_NAME = 'test-node-01';
export const TEST_NODE_BASE_URL = 'http://localhost:3008';

// Cluster Stats - includes our test node
export const mockClusterStats = {
  pmNodes: [
    {
      hostname: TEST_NODE_NAME,
      baseUrl: TEST_NODE_BASE_URL,
      status: 'Running',
      version: '1.0.0',
      uptime: 86400000, // 1 day in ms
    },
  ],
  clusterStatus: 'HEALTHY',
  totalNodes: 1,
  activeNodes: 1,
};

// Summary data for Processing Manager tab
export const mockSummary = {
  totalShards: 10,
  activeShards: 10,
  totalQueues: 5,
  activeQueues: 5,
  totalEvents: 1250,
  processedEvents: 1000,
  failedEvents: 50,
  pendingEvents: 200,
  avgProcessingTime: 125.5,
  lastUpdate: new Date().toISOString(),
};

// Shards data
export const mockShards = Array.from({ length: 10 }, (_, i) => ({
  shardId: i,
  name: `shard-${i}`,
  status: i < 9 ? 'ACTIVE' : 'IDLE',
  eventsProcessed: Math.floor(Math.random() * 1000) + 100,
  eventsInQueue: Math.floor(Math.random() * 50),
  avgProcessingTime: Math.floor(Math.random() * 200) + 50,
  lastActivity: new Date(Date.now() - Math.random() * 3600000).toISOString(),
}));

// Cassandra stats
export const mockCassandraStats = {
  connected: true,
  keyspace: 'cyoda_processing',
  replicationFactor: 3,
  nodes: 3,
  datacenters: ['DC1'],
  tables: [
    { name: 'events', rowCount: 15000, sizeBytes: 52428800 },
    { name: 'transactions', rowCount: 5000, sizeBytes: 20971520 },
    { name: 'entities', rowCount: 8000, sizeBytes: 31457280 },
  ],
  readLatency: 2.5,
  writeLatency: 3.2,
  readThroughput: 1500,
  writeThroughput: 800,
};

// Processing Events
export const mockProcessingEvents = {
  events: Array.from({ length: 50 }, (_, i) => ({
    id: `event-${i}`,
    type: ['ENTITY_CREATED', 'ENTITY_UPDATED', 'ENTITY_DELETED'][i % 3],
    entityId: `entity-${Math.floor(i / 3)}`,
    entityType: ['Order', 'Customer', 'Product'][i % 3],
    status: ['PENDING', 'PROCESSING', 'COMPLETED', 'FAILED'][i % 4],
    timestamp: new Date(Date.now() - i * 60000).toISOString(),
    processingTime: Math.floor(Math.random() * 500) + 50,
    shard: i % 10,
    queue: `queue-${i % 5}`,
    retryCount: i % 4 === 3 ? Math.floor(Math.random() * 3) : 0,
  })),
  total: 50,
  page: 1,
  pageSize: 50,
};

// Time Statistics
export const mockTimeStats = {
  avgProcessingTime: 125.5,
  minProcessingTime: 15,
  maxProcessingTime: 850,
  p50: 100,
  p95: 350,
  p99: 650,
  totalEvents: 1250,
  timeRanges: [
    { range: '0-50ms', count: 300 },
    { range: '50-100ms', count: 450 },
    { range: '100-200ms', count: 350 },
    { range: '200-500ms', count: 100 },
    { range: '500ms+', count: 50 },
  ],
  hourlyStats: Array.from({ length: 24 }, (_, i) => ({
    hour: i,
    avgTime: Math.floor(Math.random() * 200) + 50,
    eventCount: Math.floor(Math.random() * 100) + 20,
  })),
};

// Transactions
export const mockTransactions = {
  transactions: Array.from({ length: 30 }, (_, i) => ({
    id: `tx-${i}`,
    type: ['SYNC', 'ASYNC', 'BATCH'][i % 3],
    status: ['PENDING', 'IN_PROGRESS', 'COMPLETED', 'FAILED'][i % 4],
    entityCount: Math.floor(Math.random() * 20) + 1,
    startTime: new Date(Date.now() - i * 120000).toISOString(),
    endTime: i % 4 === 2 ? new Date(Date.now() - i * 120000 + 60000).toISOString() : null,
    duration: i % 4 === 2 ? Math.floor(Math.random() * 60000) : null,
    initiator: ['system', 'user-1', 'user-2', 'api'][i % 4],
  })),
  total: 30,
  page: 1,
  pageSize: 30,
};

// PM Components (Runnable Components)
export const mockRunnableComponents = [
  {
    name: 'EventProcessor',
    type: 'PROCESSOR',
    status: 'RUNNING',
    threadsActive: 8,
    threadsMax: 10,
    queueSize: 25,
    processedCount: 5420,
    errorCount: 12,
    avgProcessingTime: 85,
  },
  {
    name: 'TransactionManager',
    type: 'MANAGER',
    status: 'RUNNING',
    threadsActive: 4,
    threadsMax: 5,
    queueSize: 10,
    processedCount: 1250,
    errorCount: 3,
    avgProcessingTime: 150,
  },
  {
    name: 'CacheManager',
    type: 'CACHE',
    status: 'RUNNING',
    threadsActive: 2,
    threadsMax: 3,
    queueSize: 0,
    processedCount: 8900,
    errorCount: 0,
    avgProcessingTime: 5,
  },
];

// Composite Indexes
export const mockCompositeIndexes = [
  {
    indexId: 'idx-001',
    indexName: 'transaction_status_time_idx',
    entityClass: 'Transaction',
    rangeField: {
      columnName: 'startTime',
      columnPath: 'startTime',
      type: 'TIMESTAMP',
      clazzType: 'java.time.Instant',
      decision: null,
    },
    noneRangeFields: [
      {
        columnName: 'status',
        columnPath: 'status',
        type: 'STRING',
        clazzType: 'java.lang.String',
        decision: null,
      },
      {
        columnName: 'type',
        columnPath: 'type',
        type: 'STRING',
        clazzType: 'java.lang.String',
        decision: null,
      },
    ],
    createDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    readyForQuerying: true,
    returnsList: true,
    persisted: true,
    decision: 'CUSTOM',
  },
  {
    indexId: 'idx-002',
    indexName: 'event_shard_timestamp_idx',
    entityClass: 'Event',
    rangeField: {
      columnName: 'timestamp',
      columnPath: 'timestamp',
      type: 'TIMESTAMP',
      clazzType: 'java.time.Instant',
      decision: null,
    },
    noneRangeFields: [
      {
        columnName: 'shardId',
        columnPath: 'shardId',
        type: 'STRING',
        clazzType: 'java.lang.String',
        decision: null,
      },
    ],
    createDate: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
    readyForQuerying: true,
    returnsList: true,
    persisted: false,
    decision: 'SYSTEM',
  },
  {
    indexId: 'idx-003',
    indexName: 'processing_task_priority_idx',
    entityClass: 'ProcessingTask',
    rangeField: {
      columnName: 'priority',
      columnPath: 'priority',
      type: 'INTEGER',
      clazzType: 'java.lang.Integer',
      decision: null,
    },
    noneRangeFields: [
      {
        columnName: 'status',
        columnPath: 'status',
        type: 'STRING',
        clazzType: 'java.lang.String',
        decision: null,
      },
      {
        columnName: 'assignedNode',
        columnPath: 'assignedNode',
        type: 'STRING',
        clazzType: 'java.lang.String',
        decision: null,
      },
    ],
    createDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    readyForQuerying: true,
    returnsList: true,
    persisted: true,
    decision: 'CUSTOM',
  },
  {
    indexId: 'idx-004',
    indexName: 'cassandra_entity_type_idx',
    entityClass: 'CassandraEntity',
    rangeField: {
      columnName: 'entityType',
      columnPath: 'entityType',
      type: 'STRING',
      clazzType: 'java.lang.String',
      decision: null,
    },
    noneRangeFields: [
      {
        columnName: 'partitionKey',
        columnPath: 'partitionKey',
        type: 'STRING',
        clazzType: 'java.lang.String',
        decision: null,
      },
    ],
    createDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    readyForQuerying: true,
    returnsList: false,
    persisted: false,
    decision: 'SYSTEM',
  },
  {
    indexId: 'idx-005',
    indexName: 'cache_entry_expiry_idx',
    entityClass: 'CacheEntry',
    rangeField: {
      columnName: 'expiryTime',
      columnPath: 'expiryTime',
      type: 'TIMESTAMP',
      clazzType: 'java.time.Instant',
      decision: null,
    },
    noneRangeFields: [
      {
        columnName: 'cacheType',
        columnPath: 'cacheType',
        type: 'STRING',
        clazzType: 'java.lang.String',
        decision: null,
      },
    ],
    createDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    readyForQuerying: true,
    returnsList: true,
    persisted: true,
    decision: 'CUSTOM',
  },
];

// Caches List
export const mockCachesList = [
  {
    name: 'EntityCache',
    type: 'LRU',
    maxSize: 10000,
    currentSize: 7500,
    hitRate: 0.85,
    missRate: 0.15,
    evictions: 1250,
    avgLoadTime: 25,
  },
  {
    name: 'TransactionCache',
    type: 'LRU',
    maxSize: 5000,
    currentSize: 3200,
    hitRate: 0.78,
    missRate: 0.22,
    evictions: 850,
    avgLoadTime: 45,
  },
  {
    name: 'ConfigCache',
    type: 'ETERNAL',
    maxSize: 1000,
    currentSize: 250,
    hitRate: 0.95,
    missRate: 0.05,
    evictions: 0,
    avgLoadTime: 10,
  },
];

// Network Info
export const mockNetworkInfo = {
  hostname: TEST_NODE_NAME,
  ipAddress: '192.168.1.100',
  port: 8080,
  protocol: 'HTTP',
  connections: {
    active: 45,
    idle: 15,
    total: 60,
    maxAllowed: 200,
  },
  bandwidth: {
    inbound: 1250000, // bytes/sec
    outbound: 850000,
  },
  clients: [
    { ip: '192.168.1.10', connections: 5, lastActivity: new Date().toISOString() },
    { ip: '192.168.1.11', connections: 3, lastActivity: new Date().toISOString() },
    { ip: '192.168.1.12', connections: 8, lastActivity: new Date().toISOString() },
  ],
};

// ZooKeeper Info
export const mockZooKeeperInfo = {
  connected: true,
  sessionId: '0x1234567890abcdef',
  sessionTimeout: 30000,
  servers: [
    { host: 'zk-1.cyoda.com', port: 2181, status: 'CONNECTED' },
    { host: 'zk-2.cyoda.com', port: 2181, status: 'AVAILABLE' },
    { host: 'zk-3.cyoda.com', port: 2181, status: 'AVAILABLE' },
  ],
  clusterState: {
    leader: 'zk-1.cyoda.com:2181',
    followers: ['zk-2.cyoda.com:2181', 'zk-3.cyoda.com:2181'],
    observers: [],
  },
  currentNode: {
    path: `/processing/nodes/${TEST_NODE_NAME}`,
    data: {
      status: 'ACTIVE',
      shards: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
      lastHeartbeat: new Date().toISOString(),
    },
  },
  onlineNodes: [
    { hostname: TEST_NODE_NAME, shards: 10, status: 'ACTIVE' },
  ],
  shardsDistribution: {
    [TEST_NODE_NAME]: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
  },
};

// Server Summary
export const mockServerSummary = {
  hostname: TEST_NODE_NAME,
  version: '1.0.0',
  buildTime: '2025-10-20T10:00:00Z',
  startTime: new Date(Date.now() - 86400000).toISOString(),
  uptime: 86400000,
  jvm: {
    version: '17.0.8',
    vendor: 'Oracle Corporation',
    heapUsed: 536870912, // 512 MB
    heapMax: 2147483648, // 2 GB
    heapCommitted: 1073741824, // 1 GB
    nonHeapUsed: 104857600, // 100 MB
    gcCount: 125,
    gcTime: 1250,
  },
  system: {
    os: 'Linux',
    arch: 'amd64',
    processors: 8,
    loadAverage: 2.5,
  },
  threads: {
    count: 45,
    peakCount: 52,
    daemonCount: 12,
  },
};


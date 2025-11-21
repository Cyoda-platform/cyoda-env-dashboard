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
// Component expects: actualShards, tasksByEntity, runningTaskCount, lastTaskFinishTime, pendingTaskCount, poolInfo
export const mockSummary = {
  actualShards: Array.from({ length: 10 }, (_, i) => ({
    shardId: `${i}`,
    state: i < 9 ? 'ACTIVE' : 'IDLE',
    processesCount: i < 9 ? Math.floor(Math.random() * 5) + 1 : 0,
  })),
  tasksByEntity: Array.from({ length: 5 }, (_, i) => ({
    id: `entity-${i}`,
    events: [
      {
        id: `event-${i}`,
        shardId: i % 10,
        queueName: `queue-${i % 5}`,
        processIds: [`proc-${i}-1`, `proc-${i}-2`],
      },
    ],
  })),
  runningTaskCount: 5,
  lastTaskFinishTime: new Date(Date.now() - 30000).toISOString(),
  pendingTaskCount: 10,
  poolInfo: [
    { type: 'cpu', available: 4, poolSize: 8, size: 8 },
    { type: 'memory', available: 2048, poolSize: 4096, size: 4096 },
    { type: 'threads', available: 50, poolSize: 100, size: 100 },
  ],
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

// Processing Events (for /processing-queue/events)
// Component expects an array with specific field names
export const mockProcessingEvents = Array.from({ length: 50 }, (_, i) => ({
  timeUUID: `time-uuid-${i}-${Date.now()}`,
  createTime: new Date(Date.now() - i * 60000).toISOString(),
  doneTime: i % 4 === 2 ? new Date(Date.now() - i * 60000 + 30000).toISOString() : null,
  errorTime: i % 4 === 3 ? new Date(Date.now() - i * 60000 + 15000).toISOString() : null,
  queueName: `queue-${i % 5}`,
  shardId: `${i % 10}`,
  status: ['PENDING', 'PROCESSING', 'COMPLETED', 'FAILED'][i % 4],
  entityClassName: ['com.cyoda.Order', 'com.cyoda.Customer', 'com.cyoda.Product'][i % 3],
  entityId: `entity-${Math.floor(i / 3)}`,
  entityHasErrors: i % 4 === 3,
  errorEventTimeUUID: i % 4 === 3 ? `error-uuid-${i}` : null,
  coreDataClassName: 'com.cyoda.CoreData',
  clientDataClassName: 'com.cyoda.ClientData',
}));

// Process Events Statistics (for /stats/process-events)
// Component expects: array of { key: { queue, shard, entityClass, processor }, count }
export const mockProcessEventsStats = Array.from({ length: 30 }, (_, i) => ({
  key: {
    queue: ['DISTRIBUTED_REPORT_1_PHASE', 'DISTRIBUTED_REPORT_2_PHASE', 'INDEX_CONFIGURATION', 'TRANSACTION_EXEC_1_PHASE_VERSION_CHECK'][i % 4],
    entityClass: ['com.cyoda.Order', 'com.cyoda.Customer', 'com.cyoda.Product'][i % 3],
    shard: i % 10,
    processor: { type: ['EventProcessor', 'TransactionProcessor', 'BatchProcessor'][i % 3], id: i % 5 },
  },
  count: Math.floor(Math.random() * 100) + 10,
}));

// Processing Queues (for /processing-queue/queues.do)
// Component expects: array of queue names (strings)
export const mockProcessingQueues = [
  'queue-0',
  'queue-1',
  'queue-2',
  'queue-3',
  'queue-4',
];

// Time Statistics (for /stats/time)
// Component expects: array of { key, numCalls, min, avg, max, last, total, measure, measureDesc, from000To001MsCnt, ... }
export const mockTimeStats = Array.from({ length: 20 }, (_, i) => ({
  key: [
    'EventProcessor.process',
    'TransactionProcessor.execute',
    'BatchProcessor.processBatch',
    'EntityValidator.validate',
    'DataTransformer.transform',
  ][i % 5],
  numCalls: Math.floor(Math.random() * 1000) + 100,
  min: Math.floor(Math.random() * 10) + 1,
  avg: Math.floor(Math.random() * 100) + 20,
  max: Math.floor(Math.random() * 500) + 100,
  last: Math.floor(Math.random() * 150) + 10,
  total: Math.floor(Math.random() * 100000) + 10000,
  measure: 1000000, // nanoseconds to milliseconds
  measureDesc: 'ms',
  from000To001MsCnt: Math.floor(Math.random() * 50),
  from001To010MsCnt: Math.floor(Math.random() * 100) + 50,
  from010To050MsCnt: Math.floor(Math.random() * 200) + 100,
  from050To100MsCnt: Math.floor(Math.random() * 150) + 50,
  from100To500MsCnt: Math.floor(Math.random() * 100) + 20,
  from500To999MsCnt: Math.floor(Math.random() * 50) + 10,
  from01To02SecCnt: Math.floor(Math.random() * 30) + 5,
  from02To10SecCnt: Math.floor(Math.random() * 20) + 2,
  more10SecCnt: Math.floor(Math.random() * 10),
}));

// Count Statistics (for /stats/count)
// Component expects: array of { key, numCalls, min, avg, max, last, total }
export const mockCountStats = Array.from({ length: 15 }, (_, i) => ({
  key: [
    'Events.processed',
    'Transactions.completed',
    'Entities.created',
    'Entities.updated',
    'Errors.handled',
  ][i % 5],
  numCalls: Math.floor(Math.random() * 500) + 50,
  min: Math.floor(Math.random() * 5) + 1,
  avg: Math.floor(Math.random() * 50) + 10,
  max: Math.floor(Math.random() * 200) + 50,
  last: Math.floor(Math.random() * 75) + 5,
  total: Math.floor(Math.random() * 50000) + 5000,
}));

// Transactions
// Component expects: { rows: [...], firstPage: boolean, lastPage: boolean }
export const mockTransactions = {
  rows: Array.from({ length: 20 }, (_, i) => {
    const createTime = new Date(Date.now() - i * 120000).toISOString();
    const status = ['PENDING', 'IN_PROGRESS', 'COMPLETED', 'FAILED', 'CANCELLED'][i % 5];
    const isFinished = status === 'COMPLETED' || status === 'FAILED' || status === 'CANCELLED';

    return {
      id: `tx-${i}`,
      createTime,
      updateTime: new Date(Date.now() - i * 120000 + 30000).toISOString(),
      finishTime: isFinished ? new Date(Date.now() - i * 120000 + 60000).toISOString() : null,
      status,
      transactionSubmitNodeId: `node-${i % 3}`,
      userId: ['user-1', 'user-2', 'system', 'api'][i % 4],
      entityCount: Math.floor(Math.random() * 20) + 1,
      duration: isFinished ? Math.floor(Math.random() * 60000) : null,
    };
  }),
  firstPage: true,
  lastPage: false,
};

// Execution Monitors (for /exec-monitors-info-json.do)
// Component expects: { data: [...] }
export const mockExecMonitorsInfo = {
  data: Array.from({ length: 10 }, (_, i) => ({
    name: [
      'EventProcessorMonitor',
      'TransactionMonitor',
      'BatchProcessorMonitor',
      'EntityValidatorMonitor',
      'DataTransformerMonitor',
    ][i % 5],
    status: ['RUNNING', 'IDLE', 'RUNNING', 'RUNNING'][i % 4],
    activeThreads: Math.floor(Math.random() * 8) + 1,
    maxThreads: 10,
    queueSize: Math.floor(Math.random() * 50),
    processedCount: Math.floor(Math.random() * 10000) + 1000,
    errorCount: Math.floor(Math.random() * 50),
    lastProcessedTime: new Date(Date.now() - Math.random() * 60000).toISOString(),
  })),
};

// Service Processes Stats (for /service-processes-stats-json.do)
// Component expects: { data: { ready: [...], noneReady: [...] } }
export const mockServiceProcessesStats = {
  data: {
    ready: Array.from({ length: 6 }, (_, i) => ({
      name: [
        'EventService',
        'TransactionService',
        'EntityService',
        'ValidationService',
        'ProcessingService',
        'CacheService',
      ][i],
      shard: `${i % 10}`,
      lastStartTime: new Date(Date.now() - i * 60000).toISOString(),
      lastFinishTime: new Date(Date.now() - i * 60000 + 30000).toISOString(),
      lastDuration: Math.floor(Math.random() * 5000) + 1000,
      avgDuration: Math.floor(Math.random() * 3000) + 500,
      maxDuration: Math.floor(Math.random() * 10000) + 2000,
    })),
    noneReady: Array.from({ length: 3 }, (_, i) => ({
      name: ['BackupService', 'ArchiveService', 'CleanupService'][i],
      shard: `${i % 10}`,
      status: 'NOT_READY',
      reason: 'Service not initialized',
    })),
  },
};

// Polling Info (for /polling-info-json.do)
// Component expects: object with nested structure { [shardId]: { [queueType]: {...} } }
export const mockPollingInfo = {
  '0': {
    'queue-0': {
      shardId: '0',
      queueType: 'queue-0',
      processing: true,
      lastEmptyPollings: 5,
      maxTimeout: 1000,
      lastDelayTime: new Date(Date.now() - 5000).toISOString(),
      lastPollingTime: new Date(Date.now() - 1000).toISOString(),
    },
    'queue-1': {
      shardId: '0',
      queueType: 'queue-1',
      processing: false,
      lastEmptyPollings: 10,
      maxTimeout: 1000,
      lastDelayTime: new Date(Date.now() - 10000).toISOString(),
      lastPollingTime: new Date(Date.now() - 2000).toISOString(),
    },
  },
  '1': {
    'queue-0': {
      shardId: '1',
      queueType: 'queue-0',
      processing: true,
      lastEmptyPollings: 3,
      maxTimeout: 1000,
      lastDelayTime: new Date(Date.now() - 3000).toISOString(),
      lastPollingTime: new Date(Date.now() - 500).toISOString(),
    },
  },
};

// Processing Queue Events Error (for /processing-queue/events/error.json)
// Component expects: { rows: [...] }
export const mockProcessingQueueEventsError = {
  rows: Array.from({ length: 15 }, (_, i) => ({
    queueName: `queue-${i % 5}`,
    createTime: new Date(Date.now() - i * 60000).toISOString(),
    doneTime: null,
    errorTime: new Date(Date.now() - i * 60000 + 30000).toISOString(),
    shardId: `${i % 10}`,
    status: 'FAILED',
    timeUUID: `error-time-uuid-${i}`,
    entityId: `entity-error-${i}`,
    entityHasErrors: true,
    errorEventTimeUUID: `error-event-uuid-${i}`,
    coreDataClassName: 'com.cyoda.CoreData',
    clientDataClassName: 'com.cyoda.ClientData',
  })),
};

// Processing Queue Entities Error List (for /processing-queue/entities-error-list.json)
// Component expects: { data: { elements: [...] } }
// Each element needs: entityClass, entityId, shardId, eventUUID
export const mockProcessingQueueEntitiesErrorList = {
  data: {
    elements: [
      {
        entityClass: 'com.cyoda.Order',
        entityId: 'order-12345',
        shardId: '0',
        eventUUID: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
      },
      {
        entityClass: 'com.cyoda.Order',
        entityId: 'order-67890',
        shardId: '1',
        eventUUID: 'b2c3d4e5-f6a7-8901-bcde-f12345678901',
      },
      {
        entityClass: 'com.cyoda.Customer',
        entityId: 'customer-11111',
        shardId: '2',
        eventUUID: 'c3d4e5f6-a7b8-9012-cdef-123456789012',
      },
      {
        entityClass: 'com.cyoda.Customer',
        entityId: 'customer-22222',
        shardId: '3',
        eventUUID: 'd4e5f6a7-b8c9-0123-def1-234567890123',
      },
      {
        entityClass: 'com.cyoda.Product',
        entityId: 'product-99999',
        shardId: '4',
        eventUUID: 'e5f6a7b8-c9d0-1234-ef12-345678901234',
      },
      {
        entityClass: 'com.cyoda.Product',
        entityId: 'product-88888',
        shardId: '5',
        eventUUID: 'f6a7b8c9-d0e1-2345-f123-456789012345',
      },
      {
        entityClass: 'com.cyoda.Transaction',
        entityId: 'txn-55555',
        shardId: '6',
        eventUUID: 'a7b8c9d0-e1f2-3456-1234-567890123456',
      },
      {
        entityClass: 'com.cyoda.Event',
        entityId: 'event-44444',
        shardId: '7',
        eventUUID: 'b8c9d0e1-f2a3-4567-2345-678901234567',
      },
      {
        entityClass: 'com.cyoda.ProcessingTask',
        entityId: 'task-33333',
        shardId: '8',
        eventUUID: 'c9d0e1f2-a3b4-5678-3456-789012345678',
      },
      {
        entityClass: 'com.cyoda.Order',
        entityId: 'order-77777',
        shardId: '9',
        eventUUID: 'd0e1f2a3-b4c5-6789-4567-890123456789',
      },
      {
        entityClass: 'com.cyoda.Customer',
        entityId: 'customer-66666',
        shardId: '0',
        eventUUID: 'e1f2a3b4-c5d6-7890-5678-901234567890',
      },
      {
        entityClass: 'com.cyoda.Product',
        entityId: 'product-55555',
        shardId: '1',
        eventUUID: 'f2a3b4c5-d6e7-8901-6789-012345678901',
      },
    ],
  },
};

// SIFT Logger (for /platform-api/sift-logger/{node})
// Component expects: { loggerEnabled, queuesAll, queuesInclude, queuesExclude }
export const mockSiftLogger = {
  loggerEnabled: false,
  queuesAll: [
    'com.cyoda.Order',
    'com.cyoda.Customer',
    'com.cyoda.Product',
    'com.cyoda.Transaction',
    'com.cyoda.Event',
  ],
  queuesInclude: ['com.cyoda.Order', 'com.cyoda.Customer'],
  queuesExclude: ['com.cyoda.Product', 'com.cyoda.Transaction', 'com.cyoda.Event'],
};

// Entities List Possible (for /transactions/entities-list/possible)
// Component expects: { data: [...] }
export const mockEntitiesListPossible = {
  data: [
    'com.cyoda.Order',
    'com.cyoda.Customer',
    'com.cyoda.Product',
    'com.cyoda.Transaction',
    'com.cyoda.Event',
    'com.cyoda.ProcessingTask',
  ],
};

// Transactions Entities List (for /transactions/entities-list)
// Component expects: { entities: [...] }
export const mockTransactionsEntitiesList = {
  entities: Array.from({ length: 15 }, (_, i) => ({
    entityId: `entity-${i}`,
    entityClass: ['com.cyoda.Order', 'com.cyoda.Customer', 'com.cyoda.Product'][i % 3],
    transactionId: `tx-${i}`,
    status: ['PENDING', 'IN_PROGRESS', 'COMPLETED', 'FAILED'][i % 4],
    createTime: new Date(Date.now() - i * 120000).toISOString(),
    updateTime: new Date(Date.now() - i * 120000 + 30000).toISOString(),
  })),
};

// ZooKeeper Current Node Info (for /platform-common/zk-info/curr-node-info.json)
export const mockZkCurrNodeInfo = {
  nodeId: TEST_NODE_NAME,
  hostname: 'localhost',
  ip: '127.0.0.1',
  port: 8080,
  status: 'ONLINE',
  uptime: 86400000, // 1 day in ms
  version: '1.0.0',
  jvmVersion: '11.0.12',
  memory: {
    total: 4096,
    used: 2048,
    free: 2048,
  },
};

// ZooKeeper Online Nodes (for /platform-common/zk-info/loaded-online-nodes.json)
export const mockZkOnlineNodes = {
  DEFAULT: [],
  PROCESSING: [
    {
      id: '9c81f83da-bf5e-11f0-b46a-9ecb0f97992a',
      type: 'PROCESSING',
      baseUrl: 'http://10.233.75.58:8082/api',
      host: '10.233.75.58',
      notificationsPort: 10000,
      processingNode: true,
    },
  ],
  TOOLBOX: [],
};

// ZooKeeper Shards Distribution (for /platform-common/zk-info/loaded-shards-distribution.json)
export const mockZkShardsDistribution = {
  nodesIds: ['node-0', 'node-1', 'node-2'],
  shardsByNodes: {
    'node-0': [0, 3, 6, 9],
    'node-1': [1, 4, 7],
    'node-2': [2, 5, 8],
  },
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

// ZooKeeper Cluster State (for /platform-common/zk-info/cluster-state)
export const mockZkClusterState = {
  currentNode: {
    id: '9c81f83da-bf5e-11f0-b46a-9ecb0f97992a',
    type: 'PROCESSING',
    baseUrl: 'http://10.233.75.58:8082/api',
    host: '10.233.75.58',
    notificationsPort: 10000,
    processingNode: true,
  },
  clientNodes: {
    DEFAULT: [],
    PROCESSING: [
      {
        id: '9c81f83da-bf5e-11f0-b46a-9ecb0f97992a',
        type: 'PROCESSING',
        baseUrl: 'http://10.233.75.58:8082/api',
        host: '10.233.75.58',
        notificationsPort: 10000,
        processingNode: true,
      },
    ],
    TOOLBOX: [],
  },
  dispatcherNode: {
    id: 'dispatcher-node-1',
    type: 'DISPATCHER',
    baseUrl: 'http://10.233.75.59:8082/api',
    host: '10.233.75.59',
    notificationsPort: 10001,
    processingNode: false,
  },
  shardsDistrState: {
    id: 'shards-distr-1',
    dispatcherNodeId: 'dispatcher-node-1',
    shardsByNodes: {
      '9c81f83da-bf5e-11f0-b46a-9ecb0f97992a': [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
    },
    nodesIds: ['9c81f83da-bf5e-11f0-b46a-9ecb0f97992a'],
  },
  shardsOwners: {
    '0': '9c81f83da-bf5e-11f0-b46a-9ecb0f97992a',
    '1': '9c81f83da-bf5e-11f0-b46a-9ecb0f97992a',
    '2': '9c81f83da-bf5e-11f0-b46a-9ecb0f97992a',
    '3': '9c81f83da-bf5e-11f0-b46a-9ecb0f97992a',
    '4': '9c81f83da-bf5e-11f0-b46a-9ecb0f97992a',
    '5': '9c81f83da-bf5e-11f0-b46a-9ecb0f97992a',
    '6': '9c81f83da-bf5e-11f0-b46a-9ecb0f97992a',
    '7': '9c81f83da-bf5e-11f0-b46a-9ecb0f97992a',
    '8': '9c81f83da-bf5e-11f0-b46a-9ecb0f97992a',
    '9': '9c81f83da-bf5e-11f0-b46a-9ecb0f97992a',
  },
  errorMsg: null,
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


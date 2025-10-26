#!/usr/bin/env node

/**
 * Cyoda Backend Mock Server
 * Provides mock endpoints for Processing Manager and other Cyoda applications
 * Runs on port 8080 (unified server for saas-app)
 */

import express from 'express';
import cors from 'cors';

// Create unified Express app
const app = express();

const PORT = 8080;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${req.method} ${req.url}`);
  next();
});

// ============================================================================
// Mock Data
// ============================================================================

const mockNodes = [
  {
    id: 'node-1',
    name: 'Processing Node 1',
    host: 'localhost',
    port: 8081,
    status: 'ONLINE',
    cpuUsage: 45.2,
    memoryUsage: 62.8,
    diskUsage: 38.5,
    uptime: 86400000, // 1 day in ms
    lastHeartbeat: new Date().toISOString(),
    version: '1.0.0',
    capabilities: ['PROCESSING', 'STORAGE'],
    activeTasksCount: 3,
    completedTasksCount: 127,
    failedTasksCount: 2
  },
  {
    id: 'node-2',
    name: 'Processing Node 2',
    host: 'localhost',
    port: 8082,
    status: 'ONLINE',
    cpuUsage: 32.1,
    memoryUsage: 54.3,
    diskUsage: 42.1,
    uptime: 172800000, // 2 days in ms
    lastHeartbeat: new Date().toISOString(),
    version: '1.0.0',
    capabilities: ['PROCESSING', 'ANALYTICS'],
    activeTasksCount: 5,
    completedTasksCount: 243,
    failedTasksCount: 1
  },
  {
    id: 'node-3',
    name: 'Processing Node 3',
    host: 'localhost',
    port: 8083,
    status: 'OFFLINE',
    cpuUsage: 0,
    memoryUsage: 0,
    diskUsage: 0,
    uptime: 0,
    lastHeartbeat: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
    version: '1.0.0',
    capabilities: ['PROCESSING'],
    activeTasksCount: 0,
    completedTasksCount: 89,
    failedTasksCount: 5
  }
];

const mockEvents = [];
const mockTasks = [];

// Generate some mock events
for (let i = 0; i < 50; i++) {
  const eventTypes = ['TASK_STARTED', 'TASK_COMPLETED', 'TASK_FAILED', 'NODE_ONLINE', 'NODE_OFFLINE', 'DATA_PROCESSED'];
  const severities = ['INFO', 'WARNING', 'ERROR'];
  
  mockEvents.push({
    id: `event-${i + 1}`,
    type: eventTypes[Math.floor(Math.random() * eventTypes.length)],
    severity: severities[Math.floor(Math.random() * severities.length)],
    message: `Mock event ${i + 1} - ${eventTypes[Math.floor(Math.random() * eventTypes.length)]}`,
    timestamp: new Date(Date.now() - Math.random() * 86400000).toISOString(),
    nodeId: mockNodes[Math.floor(Math.random() * mockNodes.length)].id,
    metadata: {
      source: 'mock-server',
      version: '1.0.0'
    }
  });
}

// Generate some mock tasks
for (let i = 0; i < 20; i++) {
  const statuses = ['RUNNING', 'COMPLETED', 'FAILED', 'PENDING'];
  const taskTypes = ['DATA_IMPORT', 'DATA_EXPORT', 'TRANSFORMATION', 'VALIDATION', 'ANALYTICS'];
  
  mockTasks.push({
    id: `task-${i + 1}`,
    name: `Task ${i + 1}`,
    type: taskTypes[Math.floor(Math.random() * taskTypes.length)],
    status: statuses[Math.floor(Math.random() * statuses.length)],
    progress: Math.floor(Math.random() * 100),
    startTime: new Date(Date.now() - Math.random() * 3600000).toISOString(),
    endTime: Math.random() > 0.5 ? new Date().toISOString() : null,
    nodeId: mockNodes[Math.floor(Math.random() * 2)].id, // Only online nodes
    priority: Math.floor(Math.random() * 10),
    metadata: {
      recordsProcessed: Math.floor(Math.random() * 10000),
      recordsTotal: 10000
    }
  });
}

// ============================================================================
// API Endpoints (Port 8082)
// ============================================================================

// Health check
app.get('/actuator/health', (req, res) => {
  res.json({ status: 'UP', timestamp: new Date().toISOString() });
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'UP', timestamp: new Date().toISOString() });
});

// Root endpoint
app.get('/api', (req, res) => {
  res.json({
    message: 'Cyoda API Mock Server',
    version: '1.0.0',
    endpoints: [
      '/api/health',
      '/api/nodes',
      '/api/events',
      '/api/tasks'
    ]
  });
});

// Get all nodes
app.get('/api/nodes', (req, res) => {
  res.json(mockNodes);
});

// Get node by ID
app.get('/api/nodes/:id', (req, res) => {
  const node = mockNodes.find(n => n.id === req.params.id);
  if (node) {
    res.json(node);
  } else {
    res.status(404).json({ error: 'Node not found' });
  }
});

// Get all events
app.get('/api/events', (req, res) => {
  const { page = 0, size = 20, sort = 'timestamp,desc' } = req.query;
  const start = page * size;
  const end = start + parseInt(size);
  const sortedEvents = [...mockEvents].sort((a, b) => 
    new Date(b.timestamp) - new Date(a.timestamp)
  );
  
  res.json({
    content: sortedEvents.slice(start, end),
    page: {
      size: parseInt(size),
      totalElements: mockEvents.length,
      totalPages: Math.ceil(mockEvents.length / size),
      number: parseInt(page)
    }
  });
});

// Get all tasks
app.get('/api/tasks', (req, res) => {
  const { page = 0, size = 20 } = req.query;
  const start = page * size;
  const end = start + parseInt(size);
  
  res.json({
    content: mockTasks.slice(start, end),
    page: {
      size: parseInt(size),
      totalElements: mockTasks.length,
      totalPages: Math.ceil(mockTasks.length / size),
      number: parseInt(page)
    }
  });
});

// ============================================================================
// Processing Endpoints (Port 8081)
// ============================================================================

// Health check
app.get('/actuator/health', (req, res) => {
  res.json({ status: 'UP', timestamp: new Date().toISOString() });
});

app.get('/processing/health', (req, res) => {
  res.json({ status: 'UP', timestamp: new Date().toISOString() });
});

// Root endpoint
app.get('/processing', (req, res) => {
  res.json({
    message: 'Cyoda Processing Mock Server',
    version: '1.0.0',
    endpoints: [
      '/processing/health',
      '/processing/nodes',
      '/processing/events',
      '/processing/tasks',
      '/processing/metrics'
    ]
  });
});

// Get all processing nodes
app.get('/processing/nodes', (req, res) => {
  res.json(mockNodes);
});

// Get node by ID
app.get('/processing/nodes/:id', (req, res) => {
  const node = mockNodes.find(n => n.id === req.params.id);
  if (node) {
    res.json(node);
  } else {
    res.status(404).json({ error: 'Node not found' });
  }
});

// Get node metrics
app.get('/processing/nodes/:id/metrics', (req, res) => {
  const node = mockNodes.find(n => n.id === req.params.id);
  if (node) {
    res.json({
      nodeId: node.id,
      timestamp: new Date().toISOString(),
      cpu: node.cpuUsage,
      memory: node.memoryUsage,
      disk: node.diskUsage,
      network: {
        bytesIn: Math.floor(Math.random() * 1000000),
        bytesOut: Math.floor(Math.random() * 1000000)
      }
    });
  } else {
    res.status(404).json({ error: 'Node not found' });
  }
});

// Get processing events
app.get('/processing/events', (req, res) => {
  const { page = 0, size = 20, sort = 'timestamp,desc' } = req.query;
  const start = page * size;
  const end = start + parseInt(size);
  const sortedEvents = [...mockEvents].sort((a, b) => 
    new Date(b.timestamp) - new Date(a.timestamp)
  );
  
  res.json({
    content: sortedEvents.slice(start, end),
    page: {
      size: parseInt(size),
      totalElements: mockEvents.length,
      totalPages: Math.ceil(mockEvents.length / size),
      number: parseInt(page)
    }
  });
});

// Get processing tasks
app.get('/processing/tasks', (req, res) => {
  const { page = 0, size = 20, status } = req.query;
  let filteredTasks = mockTasks;
  
  if (status) {
    filteredTasks = mockTasks.filter(t => t.status === status);
  }
  
  const start = page * size;
  const end = start + parseInt(size);
  
  res.json({
    content: filteredTasks.slice(start, end),
    page: {
      size: parseInt(size),
      totalElements: filteredTasks.length,
      totalPages: Math.ceil(filteredTasks.length / size),
      number: parseInt(page)
    }
  });
});

// Get system metrics
app.get('/processing/metrics', (req, res) => {
  res.json({
    timestamp: new Date().toISOString(),
    totalNodes: mockNodes.length,
    onlineNodes: mockNodes.filter(n => n.status === 'ONLINE').length,
    offlineNodes: mockNodes.filter(n => n.status === 'OFFLINE').length,
    activeTasks: mockTasks.filter(t => t.status === 'RUNNING').length,
    completedTasks: mockTasks.filter(t => t.status === 'COMPLETED').length,
    failedTasks: mockTasks.filter(t => t.status === 'FAILED').length,
    averageCpuUsage: mockNodes.reduce((sum, n) => sum + n.cpuUsage, 0) / mockNodes.length,
    averageMemoryUsage: mockNodes.reduce((sum, n) => sum + n.memoryUsage, 0) / mockNodes.length
  });
});

// ============================================================================
// Platform API Endpoints (for SaaS App)
// ============================================================================

// Entity types
app.get('/platform-api/entity-info/fetch/types', (req, res) => {
  const { onlyDynamic } = req.query;
  const allTypes = [
    { id: 'entity-type-1', name: 'Customer', description: 'Customer entity type', dynamic: true },
    { id: 'entity-type-2', name: 'Order', description: 'Order entity type', dynamic: true },
    { id: 'entity-type-3', name: 'Product', description: 'Product entity type', dynamic: false }
  ];

  if (onlyDynamic === 'true') {
    res.json(allTypes.filter(t => t.dynamic));
  } else {
    res.json(allTypes);
  }
});

// Entity classes
app.get('/platform-api/entity/classes', (req, res) => {
  res.json([
    { id: 'class-1', name: 'CustomerClass', type: 'Customer' },
    { id: 'class-2', name: 'OrderClass', type: 'Order' },
    { id: 'class-3', name: 'ProductClass', type: 'Product' }
  ]);
});

// Mappers
app.get('/platform-api/entity-info/fetch/mappers', (req, res) => {
  res.json([
    { id: 'mapper-1', name: 'CustomerMapper', sourceType: 'CSV', targetType: 'Customer' },
    { id: 'mapper-2', name: 'OrderMapper', sourceType: 'JSON', targetType: 'Order' }
  ]);
});

// Catalog items
app.get('/platform-api/catalog/item/all', (req, res) => {
  res.json([
    { id: 'catalog-1', name: 'Customer Data', type: 'Dataset', status: 'Active' },
    { id: 'catalog-2', name: 'Order History', type: 'Dataset', status: 'Active' },
    { id: 'catalog-3', name: 'Product Catalog', type: 'Dataset', status: 'Active' }
  ]);
});

// Report types
app.get('/platform-api/reporting/types', (req, res) => {
  res.json([
    { id: 'report-type-1', name: 'Sales Report', category: 'Financial' },
    { id: 'report-type-2', name: 'Customer Analytics', category: 'Analytics' },
    { id: 'report-type-3', name: 'Inventory Report', category: 'Operations' }
  ]);
});

// Report types with models
app.get('/platform-api/reporting/types/fetch', (req, res) => {
  res.json([
    { id: 'report-type-1', name: 'Sales Report', category: 'Financial', models: [] },
    { id: 'report-type-2', name: 'Customer Analytics', category: 'Analytics', models: [] },
    { id: 'report-type-3', name: 'Inventory Report', category: 'Operations', models: [] }
  ]);
});

// Report definitions
app.get('/platform-api/reporting/definitions', (req, res) => {
  res.json([
    { id: 'report-def-1', name: 'Monthly Sales', typeId: 'report-type-1', schedule: 'Monthly' },
    { id: 'report-def-2', name: 'Customer Segmentation', typeId: 'report-type-2', schedule: 'Weekly' },
    { id: 'report-def-3', name: 'Stock Levels', typeId: 'report-type-3', schedule: 'Daily' }
  ]);
});

// Workflows
app.get('/platform-api/statemachine/workflows', (req, res) => {
  res.json([
    { id: 'workflow-1', name: 'Order Processing', status: 'Active', version: '1.0' },
    { id: 'workflow-2', name: 'Customer Onboarding', status: 'Active', version: '2.1' },
    { id: 'workflow-3', name: 'Product Approval', status: 'Draft', version: '1.5' }
  ]);
});

// Workflow enabled types
app.get('/platform-api/statemachine/workflow-enabled-types', (req, res) => {
  res.json([
    { id: 'type-1', name: 'Customer', enabled: true },
    { id: 'type-2', name: 'Order', enabled: true },
    { id: 'type-3', name: 'Product', enabled: false }
  ]);
});

// ============================================================================
// Platform Processing Endpoints
// ============================================================================

// Cluster stats full
app.get('/platform-processing/pm-cluster-stats-full.do', (req, res) => {
  res.json({
    nodes: [
      {
        hostname: 'processing-node-1',
        baseUrl: 'http://localhost:8081',
        status: 'ONLINE',
        cpuUsage: 45.2,
        memoryUsage: 62.8,
        diskUsage: 38.5,
        uptime: 86400000,
        version: '1.0.0',
        grafana: null
      },
      {
        hostname: 'processing-node-2',
        baseUrl: 'http://localhost:8082',
        status: 'ONLINE',
        cpuUsage: 32.1,
        memoryUsage: 54.3,
        diskUsage: 42.1,
        uptime: 172800000,
        version: '1.0.0',
        grafana: null
      },
      {
        hostname: 'processing-node-3',
        baseUrl: 'http://localhost:8083',
        status: 'OFFLINE',
        cpuUsage: 0,
        memoryUsage: 0,
        diskUsage: 0,
        uptime: 0,
        version: '1.0.0',
        grafana: null
      }
    ],
    totalNodes: 3,
    onlineNodes: 2,
    offlineNodes: 1,
    totalCpuUsage: 77.3,
    totalMemoryUsage: 117.1,
    totalDiskUsage: 80.6
  });
});

// ============================================================================
// Processing UI Config
// ============================================================================

// Config.json for processing-manager-react
app.get('/processing-ui/config.json', (req, res) => {
  res.json({
    apiBaseUrl: 'http://localhost:8080',
    grafanaUrl: 'http://localhost:3000',
    enableSSH: false,
    pollingInterval: 30000
  });
});

// ============================================================================
// Start Server
// ============================================================================

app.listen(PORT, () => {
  console.log('');
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║         Cyoda Backend Mock Server - STARTED               ║');
  console.log('╚════════════════════════════════════════════════════════════╝');
  console.log('');
  console.log(`✅ Server running on:            http://localhost:${PORT}`);
  console.log(`   Endpoints:`);
  console.log(`   - http://localhost:${PORT}/api/*`);
  console.log(`   - http://localhost:${PORT}/processing/*`);
  console.log(`   - http://localhost:${PORT}/platform-api/*`);
  console.log('');
  console.log('📊 Mock Data:');
  console.log(`   - ${mockNodes.length} processing nodes`);
  console.log(`   - ${mockEvents.length} events`);
  console.log(`   - ${mockTasks.length} tasks`);
  console.log('');
  console.log('🎯 Ready for SaaS App on http://localhost:3000');
  console.log('');
  console.log('Press Ctrl+C to stop the server');
  console.log('');
});


#!/usr/bin/env node

/**
 * Cyoda Backend Mock Server
 * Provides mock endpoints for Processing Manager and other Cyoda applications
 * Runs on ports 8081 (Processing) and 8082 (API)
 */

import express from 'express';
import cors from 'cors';

// Create two Express apps - one for each port
const apiApp = express();
const processingApp = express();

const API_PORT = 8082;
const PROCESSING_PORT = 8081;

// Middleware
const setupMiddleware = (app) => {
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  
  // Request logging
  app.use((req, res, next) => {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] ${req.method} ${req.url}`);
    next();
  });
};

setupMiddleware(apiApp);
setupMiddleware(processingApp);

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
apiApp.get('/actuator/health', (req, res) => {
  res.json({ status: 'UP', timestamp: new Date().toISOString() });
});

apiApp.get('/api/health', (req, res) => {
  res.json({ status: 'UP', timestamp: new Date().toISOString() });
});

// Root endpoint
apiApp.get('/api', (req, res) => {
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
apiApp.get('/api/nodes', (req, res) => {
  res.json(mockNodes);
});

// Get node by ID
apiApp.get('/api/nodes/:id', (req, res) => {
  const node = mockNodes.find(n => n.id === req.params.id);
  if (node) {
    res.json(node);
  } else {
    res.status(404).json({ error: 'Node not found' });
  }
});

// Get all events
apiApp.get('/api/events', (req, res) => {
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
apiApp.get('/api/tasks', (req, res) => {
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
processingApp.get('/actuator/health', (req, res) => {
  res.json({ status: 'UP', timestamp: new Date().toISOString() });
});

processingApp.get('/processing/health', (req, res) => {
  res.json({ status: 'UP', timestamp: new Date().toISOString() });
});

// Root endpoint
processingApp.get('/processing', (req, res) => {
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
processingApp.get('/processing/nodes', (req, res) => {
  res.json(mockNodes);
});

// Get node by ID
processingApp.get('/processing/nodes/:id', (req, res) => {
  const node = mockNodes.find(n => n.id === req.params.id);
  if (node) {
    res.json(node);
  } else {
    res.status(404).json({ error: 'Node not found' });
  }
});

// Get node metrics
processingApp.get('/processing/nodes/:id/metrics', (req, res) => {
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
processingApp.get('/processing/events', (req, res) => {
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
processingApp.get('/processing/tasks', (req, res) => {
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
processingApp.get('/processing/metrics', (req, res) => {
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
// Start Servers
// ============================================================================

apiApp.listen(API_PORT, () => {
  console.log('');
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║         Cyoda Backend Mock Server - STARTED               ║');
  console.log('╚════════════════════════════════════════════════════════════╝');
  console.log('');
  console.log(`✅ API Server running on:        http://localhost:${API_PORT}`);
  console.log(`   Endpoints:`);
  console.log(`   - http://localhost:${API_PORT}/api`);
  console.log(`   - http://localhost:${API_PORT}/api/health`);
  console.log(`   - http://localhost:${API_PORT}/api/nodes`);
  console.log(`   - http://localhost:${API_PORT}/api/events`);
  console.log(`   - http://localhost:${API_PORT}/api/tasks`);
  console.log('');
});

processingApp.listen(PROCESSING_PORT, () => {
  console.log(`✅ Processing Server running on: http://localhost:${PROCESSING_PORT}`);
  console.log(`   Endpoints:`);
  console.log(`   - http://localhost:${PROCESSING_PORT}/processing`);
  console.log(`   - http://localhost:${PROCESSING_PORT}/processing/health`);
  console.log(`   - http://localhost:${PROCESSING_PORT}/processing/nodes`);
  console.log(`   - http://localhost:${PROCESSING_PORT}/processing/events`);
  console.log(`   - http://localhost:${PROCESSING_PORT}/processing/tasks`);
  console.log(`   - http://localhost:${PROCESSING_PORT}/processing/metrics`);
  console.log('');
  console.log('📊 Mock Data:');
  console.log(`   - ${mockNodes.length} processing nodes`);
  console.log(`   - ${mockEvents.length} events`);
  console.log(`   - ${mockTasks.length} tasks`);
  console.log('');
  console.log('🎯 Ready for Processing Manager on http://localhost:3008');
  console.log('');
  console.log('Press Ctrl+C to stop the servers');
  console.log('');
});


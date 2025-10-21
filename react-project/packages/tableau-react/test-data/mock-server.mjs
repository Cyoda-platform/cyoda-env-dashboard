#!/usr/bin/env node

/**
 * Mock API Server for Testing Tableau Reports
 * This server provides mock endpoints for entity data and report execution
 */

import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 8080;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

// In-memory storage for entities
const entityStore = {
  'com.cyoda.tms.model.entities.Transaction': [],
  'com.cyoda.tms.model.entities.Customer': [],
  'com.cyoda.tms.model.entities.Product': [],
  'com.cyoda.tms.model.entities.Order': [],
  'com.cyoda.tms.model.entities.Account': [],
  'com.cyoda.tms.model.entities.Payment': [],
  'com.cyoda.tms.model.entities.Invoice': [],
  'com.cyoda.tms.model.entities.User': [],
};

// Load test data on startup
function loadTestData() {
  try {
    // Load transactions
    const transactionsPath = path.join(__dirname, 'sample-transactions.json');
    if (fs.existsSync(transactionsPath)) {
      const transactions = JSON.parse(fs.readFileSync(transactionsPath, 'utf8'));
      entityStore['com.cyoda.tms.model.entities.Transaction'] = transactions;
      console.log(`✓ Loaded ${transactions.length} transactions`);
    }

    // Load customers
    const customersPath = path.join(__dirname, 'sample-customers.json');
    if (fs.existsSync(customersPath)) {
      const customers = JSON.parse(fs.readFileSync(customersPath, 'utf8'));
      entityStore['com.cyoda.tms.model.entities.Customer'] = customers;
      console.log(`✓ Loaded ${customers.length} customers`);
    }
  } catch (error) {
    console.error('Error loading test data:', error);
  }
}

// Health check
app.get('/actuator/health', (req, res) => {
  res.json({ status: 'UP' });
});

// Get users list
app.post('/platform-api/users/list', (req, res) => {
  const userIds = req.body;

  // Mock user data
  const users = userIds.map(userId => ({
    userId: userId,
    username: userId,
    firstName: 'User',
    lastName: userId,
    email: `${userId}@example.com`,
  }));

  res.json(users);
});

// Get entity types
app.get('/platform-api/entity-info/fetch/types', (req, res) => {
  const types = Object.keys(entityStore);
  res.json(types);
});

// Get reporting types (for CreateReportDialog)
app.get('/platform-api/reporting/types/fetch', (req, res) => {
  const types = Object.keys(entityStore).map(entityClass => ({
    name: entityClass,
    label: entityClass.split('.').pop(), // Use last part as label
    type: 'BUSINESS', // Default to BUSINESS type
  }));
  res.json(types);
});

// Get entity model info (for CyodaModelling)
app.get('/platform-api/entity-info/model-info', (req, res) => {
  const { entityModel, parentFieldType, columnPath } = req.query;

  // Mock entity model structure
  const mockModelInfo = [
    {
      columnName: 'id',
      columnPath: 'id',
      type: 'LEAF',
    },
    {
      columnName: 'name',
      columnPath: 'name',
      type: 'LEAF',
    },
    {
      columnName: 'description',
      columnPath: 'description',
      type: 'LEAF',
    },
    {
      columnName: 'amount',
      columnPath: 'amount',
      type: 'LEAF',
    },
    {
      columnName: 'status',
      columnPath: 'status',
      type: 'LEAF',
    },
    {
      columnName: 'createdDate',
      columnPath: 'createdDate',
      type: 'LEAF',
    },
  ];

  res.json(mockModelInfo);
});

// Get related paths (for joins)
app.get('/platform-api/entity-info/model-info/related/paths', (req, res) => {
  const { entityModel } = req.query;

  // Mock related paths
  const mockRelatedPaths = [];

  res.json(mockRelatedPaths);
});

// In-memory storage for catalog items (aliases)
if (!global.catalogItems) {
  global.catalogItems = {};
}

// Get catalog items
app.get('/platform-api/catalog/item/class', (req, res) => {
  const { entityClass } = req.query;

  // Get catalog items for this entity class
  const items = Object.values(global.catalogItems).filter(
    (item) => item.entityClass === entityClass
  );

  res.json(items);
});

// Create catalog item
app.post('/platform-api/catalog/item', (req, res) => {
  const catalogItem = req.body;
  const itemId = `CAT-${Date.now()}`;

  console.log('Received catalog item:', JSON.stringify(catalogItem, null, 2));

  // Extract the alias name from the structure
  const aliasName = catalogItem.name || catalogItem.aliasDef?.name || catalogItem.alias;

  global.catalogItems[itemId] = {
    ...catalogItem,
    itemId,
    alias: aliasName, // Store the alias name for easy access
  };

  console.log(`✓ Created alias: ${aliasName || 'unnamed'} (${itemId})`);

  res.json(itemId);
});

// Update catalog item
app.put('/platform-api/catalog/item', (req, res) => {
  const { itemId } = req.query;
  const catalogItem = req.body;

  if (global.catalogItems[itemId]) {
    global.catalogItems[itemId] = {
      ...global.catalogItems[itemId],
      ...catalogItem,
    };
    console.log(`✓ Updated alias: ${catalogItem.alias}`);
  }

  res.json({ success: true });
});

// Delete catalog item
app.delete('/platform-api/catalog/item', (req, res) => {
  const { itemId } = req.query;

  if (global.catalogItems[itemId]) {
    const alias = global.catalogItems[itemId].alias;
    delete global.catalogItems[itemId];
    console.log(`✓ Deleted alias: ${alias}`);
  }

  res.json({ success: true });
});

// Get mapper classes
app.get('/platform-api/catalog/mappers', (req, res) => {
  const mockMappers = [
    'com.cyoda.platform.mappers.IdentityMapper',
    'com.cyoda.platform.mappers.StringMapper',
    'com.cyoda.platform.mappers.NumberMapper',
    'com.cyoda.platform.mappers.DateMapper',
  ];

  res.json(mockMappers);
});

// Stream Report Definitions
let streamDefinitions = [];

// Initialize report definitions with sample data
if (!global.reportDefinitions) {
  global.reportDefinitions = {
    'RPT-001': {
      id: 'RPT-001',
      name: 'Customer Report',
      description: 'List of all customers',
      type: 'STANDARD',
      entityClass: 'com.cyoda.tms.model.entities.Customer',
      userId: 'admin',
      creationDate: new Date('2024-01-15').toISOString(),
      modificationDate: new Date('2024-01-15').toISOString(),
      columns: [
        { columnPath: 'id', label: 'ID' },
        { columnPath: 'name', label: 'Name' },
        { columnPath: 'email', label: 'Email' }
      ]
    },
    'RPT-002': {
      id: 'RPT-002',
      name: 'Transaction Report',
      description: 'List of all transactions',
      type: 'STANDARD',
      entityClass: 'com.cyoda.tms.model.entities.Transaction',
      userId: 'admin',
      creationDate: new Date('2024-01-16').toISOString(),
      modificationDate: new Date('2024-01-16').toISOString(),
      columns: [
        { columnPath: 'id', label: 'ID' },
        { columnPath: 'amount', label: 'Amount' },
        { columnPath: 'date', label: 'Date' }
      ]
    },
    'RPT-003': {
      id: 'RPT-003',
      name: 'Product Report',
      description: 'List of all products',
      type: 'STANDARD',
      entityClass: 'com.cyoda.tms.model.entities.Product',
      userId: 'admin',
      creationDate: new Date('2024-01-17').toISOString(),
      modificationDate: new Date('2024-01-17').toISOString(),
      columns: [
        { columnPath: 'id', label: 'ID' },
        { columnPath: 'name', label: 'Product Name' },
        { columnPath: 'price', label: 'Price' }
      ]
    }
  };
}

// Get all stream report definitions
app.get('/platform-api/reporting/stream-definitions', (req, res) => {
  res.json(streamDefinitions);
});

// Get single stream report definition
app.get('/platform-api/reporting/stream-definitions/:id', (req, res) => {
  const { id } = req.params;
  const definition = streamDefinitions.find(d => d.id === id);

  if (definition) {
    res.json(definition);
  } else {
    res.status(404).json({ error: 'Stream report definition not found' });
  }
});

// Create stream report definition
app.post('/platform-api/reporting/stream-definitions', (req, res) => {
  const definition = req.body;
  const id = `STREAM-${Date.now()}`;

  const newDefinition = {
    id,
    name: definition.name,
    description: definition.description || '',
    owner: 'admin',
    createDate: new Date().toISOString(),
    streamDataDef: definition.streamDataDef || definition,
  };

  streamDefinitions.push(newDefinition);
  res.json(id);
});

// Update stream report definition
app.put('/platform-api/reporting/stream-definitions/:id', (req, res) => {
  const { id } = req.params;
  const definition = req.body;

  const index = streamDefinitions.findIndex(d => d.id === id);
  if (index !== -1) {
    streamDefinitions[index] = {
      ...streamDefinitions[index],
      ...definition,
      streamDataDef: definition.streamDataDef || definition,
    };
    res.json({ success: true });
  } else {
    res.status(404).json({ error: 'Stream report definition not found' });
  }
});

// Delete stream report definition
app.delete('/platform-api/reporting/stream-definitions/:id', (req, res) => {
  const { id } = req.params;
  const index = streamDefinitions.findIndex(d => d.id === id);

  if (index !== -1) {
    streamDefinitions.splice(index, 1);
    res.json({ success: true });
  } else {
    res.status(404).json({ error: 'Stream report definition not found' });
  }
});

// Get stream data (execute stream report)
app.post('/platform-api/reporting/stream-data', (req, res) => {
  const request = req.body;

  // Mock stream data response
  const mockStreamData = {
    rows: [
      {
        columnsValues: {
          id: '1',
          name: 'Stream Data 1',
          value: 100,
          timestamp: new Date().toISOString(),
        },
      },
      {
        columnsValues: {
          id: '2',
          name: 'Stream Data 2',
          value: 200,
          timestamp: new Date().toISOString(),
        },
      },
    ],
    pointTime: Date.now(),
  };

  res.json(mockStreamData);
});

// Query plan endpoint
app.post('/platform-api/reporting/query-plan', (req, res) => {
  const definition = req.body;

  // Mock query plan
  const mockQueryPlan = {
    query: 'SELECT * FROM entity WHERE ...',
    estimatedCost: 100,
    estimatedRows: 1000,
    indexes: ['idx_entity_id', 'idx_entity_timestamp'],
    executionSteps: [
      { step: 1, operation: 'Index Scan', table: 'entity', cost: 10 },
      { step: 2, operation: 'Filter', condition: 'timestamp > ?', cost: 20 },
      { step: 3, operation: 'Sort', columns: ['timestamp'], cost: 30 },
      { step: 4, operation: 'Limit', rows: 100, cost: 5 },
    ],
  };

  res.json(mockQueryPlan);
});

// Search entities (must come before get by ID to avoid route conflict)
app.get('/platform-api/entity/:entityClass/search', (req, res) => {
  const { entityClass } = req.params;
  const entities = entityStore[entityClass] || [];

  // Simple search - return all entities for now
  res.json({
    content: entities,
    page: {
      size: entities.length,
      totalElements: entities.length,
      totalPages: 1,
      number: 0
    }
  });
});

// Get entity count (must come before get by ID)
app.get('/platform-api/entity/:entityClass/count', (req, res) => {
  const { entityClass } = req.params;
  const count = entityStore[entityClass]?.length || 0;
  res.json({ count });
});

// Get entity by ID
app.get('/platform-api/entity/:entityClass/:entityId', (req, res) => {
  const { entityClass, entityId } = req.params;
  const entities = entityStore[entityClass] || [];
  const entity = entities.find(e => e.entityId === entityId);

  if (entity) {
    res.json(entity);
  } else {
    res.status(404).json({ error: 'Entity not found' });
  }
});

// Create entity
app.post('/platform-api/entity', (req, res) => {
  const { entityClass, entityId, values } = req.body;
  
  if (!entityStore[entityClass]) {
    entityStore[entityClass] = [];
  }
  
  const entity = {
    entityClass,
    entityId,
    values
  };
  
  entityStore[entityClass].push(entity);
  res.status(201).json(entity);
});

// Import entities
app.post('/platform-api/entity/:entityClass/import', (req, res) => {
  const { entityClass } = req.params;

  // For now, just return success
  // In a real implementation, this would parse the uploaded file
  res.json({
    success: true,
    message: `Entities imported to ${entityClass}`,
    count: entityStore[entityClass]?.length || 0
  });
});

// Create report definition
app.post('/platform-api/reporting/definitions', (req, res) => {
  const { name } = req.query;
  const definition = req.body;

  console.log('Received report definition:', JSON.stringify({ name, definition }, null, 2));

  if (!name) {
    return res.status(400).json({ error: 'Name is required as query parameter' });
  }

  // Generate a unique ID for the report
  const reportId = `RPT-${Date.now()}`;

  // Store the definition (in-memory for now)
  if (!global.reportDefinitions) {
    global.reportDefinitions = {};
  }

  const now = new Date().toISOString();
  global.reportDefinitions[reportId] = {
    ...definition,
    id: reportId,
    name: name,
    userId: definition.userId || 'admin',
    creationDate: now,
    modificationDate: now,
    type: definition.type || 'STANDARD',
    description: definition.description || '',
    entityClass: definition.requestClass || definition.entityClass,
  };

  console.log(`✓ Created report: ${name} (${reportId})`);
  console.log(`Total reports: ${Object.keys(global.reportDefinitions).length}`);

  res.status(201).json({
    success: true,
    content: reportId,
    message: `Report definition '${name}' created successfully`
  });
});

// Get report definitions
app.get('/platform-api/reporting/definitions', (req, res) => {
  const definitions = global.reportDefinitions || {};
  const definitionsList = Object.values(definitions);

  // Format the response to match what the frontend expects
  const gridConfigFieldsViews = definitionsList.map(def => ({
    gridConfigFields: {
      id: def.id, // Use the real ID
      name: def.name,
      description: def.description || '',
      type: def.entityClass || def.type || 'STANDARD',
      userId: def.userId || 'admin',
      creationDate: def.creationDate,
      modificationDate: def.modificationDate,
      entityClass: def.entityClass,
      columns: def.columns || [],
    }
  }));

  res.json({
    _embedded: {
      gridConfigFieldsViews: gridConfigFieldsViews
    },
    page: {
      size: definitionsList.length,
      totalElements: definitionsList.length,
      totalPages: 1,
      number: 0
    }
  });
});

// Get single report definition
app.get('/platform-api/reporting/definitions/:id', (req, res) => {
  const { id } = req.params;
  const definition = global.reportDefinitions?.[id];

  if (definition) {
    res.json(definition);
  } else {
    res.status(404).json({ error: 'Report definition not found' });
  }
});

// Update report definition
app.put('/platform-api/reporting/definitions/:id', (req, res) => {
  const { id } = req.params;
  const updates = req.body;

  console.log(`Updating report ${id}:`, JSON.stringify(updates, null, 2));

  if (global.reportDefinitions?.[id]) {
    global.reportDefinitions[id] = {
      ...global.reportDefinitions[id],
      ...updates,
      modificationDate: new Date().toISOString(),
    };

    console.log(`✓ Updated report: ${global.reportDefinitions[id].name} (${id})`);
    console.log(`  - Aliases: ${updates.aliasDefs?.length || 0}`);

    res.json({
      success: true,
      message: 'Report definition updated successfully'
    });
  } else {
    res.status(404).json({ error: 'Report definition not found' });
  }
});

// Delete report definition
app.delete('/platform-api/reporting/definitions/:id', (req, res) => {
  const { id } = req.params;

  if (global.reportDefinitions?.[id]) {
    delete global.reportDefinitions[id];
    res.json({
      success: true,
      message: 'Report definition deleted successfully'
    });
  } else {
    res.status(404).json({ error: 'Report definition not found' });
  }
});

// Run report from predefined config
app.post('/platform-api/pre', (req, res) => {
  const { gridConfig } = req.query;

  if (!gridConfig) {
    return res.status(400).json({ error: 'gridConfig parameter is required' });
  }

  console.log(`Running report from config: ${gridConfig}`);

  // Get the report definition
  const definitions = global.reportDefinitions || {};
  const definition = definitions[gridConfig];

  if (!definition) {
    console.error(`Report definition not found: ${gridConfig}`);
    return res.status(404).json({ error: 'Report definition not found' });
  }

  // Get entities for this report
  const entityClass = definition.entityClass || definition.requestClass;
  const entities = entityStore[entityClass] || [];

  console.log(`Found ${entities.length} entities for ${entityClass}`);

  // Generate a report ID
  const reportId = `REPORT-${Date.now()}`;

  // Store the running report
  if (!global.runningReports) {
    global.runningReports = {};
  }

  global.runningReports[reportId] = {
    id: reportId,
    configId: gridConfig,
    configName: definition.name,
    status: 'RUNNING',
    createTime: new Date().toISOString(),
    entityClass: entityClass,
    totalRows: entities.length,
  };

  console.log(`✓ Started report: ${reportId} for config ${gridConfig}`);

  // Simulate async execution - complete after 2 seconds
  setTimeout(() => {
    if (global.runningReports[reportId]) {
      global.runningReports[reportId].status = 'COMPLETED';
      global.runningReports[reportId].finishTime = new Date().toISOString();
      console.log(`✓ Completed report: ${reportId}`);
    }
  }, 2000);

  res.json({
    content: reportId,
    message: 'Report execution started'
  });
});

// Query plan endpoint
app.post('/platform-api/stream-data/query-plan', (req, res) => {
  const { condition, entityClass, aliasDefs } = req.body;

  console.log(`Generating query plan for ${entityClass}`);

  // Mock query plan - check if conditions use indexed fields
  const hasIndexedConditions = condition?.conditions?.some(c => {
    // Simulate: id, createdDate, and status are indexed
    return c.fieldName && ['id', 'createdDate', 'status'].includes(c.fieldName);
  });

  const optimizedPlan = hasIndexedConditions
    ? {
        type: 'INDEX_SCAN',
        index: 'PRIMARY',
        estimatedRows: 100,
        conditions: condition,
      }
    : {
        type: 'ALL',
        estimatedRows: 10000,
        conditions: condition,
      };

  res.json({
    optimized: optimizedPlan,
    original: {
      type: 'FULL_SCAN',
      conditions: condition,
    },
  });
});

// Execute report (mock)
app.post('/platform-api/reporting/execute', (req, res) => {
  const { entityClass, columns, filters } = req.body;
  const entities = entityStore[entityClass] || [];

  // Simple mock execution - return entities as report results
  const results = entities.map(entity => {
    const row = {};
    entity.values.forEach(v => {
      row[v.columnPath] = v.value;
    });
    return row;
  });

  res.json({
    reportId: `REPORT-${Date.now()}`,
    status: 'COMPLETED',
    results: results,
    totalRows: results.length,
    executionTime: Math.random() * 1000
  });
});

// Get report history (mock)
app.get('/platform-api/reporting/history', (req, res) => {
  res.json({
    content: [
      {
        id: 'REPORT-001',
        name: 'Sample Report',
        status: 'COMPLETED',
        executionTime: 1234,
        createdDate: new Date().toISOString(),
        rowCount: 5
      }
    ],
    page: {
      size: 1,
      totalElements: 1,
      totalPages: 1,
      number: 0
    }
  });
});

// Start server
app.listen(PORT, () => {
  console.log('=========================================');
  console.log('  Mock API Server for Tableau Testing');
  console.log('=========================================');
  console.log('');
  console.log(`Server running at: http://localhost:${PORT}`);
  console.log('');
  console.log('Loading test data...');
  loadTestData();
  console.log('');
  console.log('Available endpoints:');
  console.log('  GET  /actuator/health');
  console.log('  GET  /platform-api/entity-info/fetch/types');
  console.log('  GET  /platform-api/entity/:entityClass/:entityId');
  console.log('  GET  /platform-api/entity/:entityClass/search');
  console.log('  POST /platform-api/entity');
  console.log('  POST /platform-api/entity/:entityClass/import');
  console.log('  GET  /platform-api/entity/:entityClass/count');
  console.log('  POST /platform-api/reporting/execute');
  console.log('  GET  /platform-api/reporting/history');
  console.log('');
  console.log('Entity data loaded:');
  Object.entries(entityStore).forEach(([entityClass, entities]) => {
    if (entities.length > 0) {
      console.log(`  - ${entityClass}: ${entities.length} records`);
    }
  });
  console.log('');
  console.log('Ready to accept requests! 🚀');
  console.log('');
});


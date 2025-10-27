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

    // Load products
    const productsPath = path.join(__dirname, 'sample-products.json');
    if (fs.existsSync(productsPath)) {
      const products = JSON.parse(fs.readFileSync(productsPath, 'utf8'));
      entityStore['com.cyoda.tms.model.entities.Product'] = products;
      console.log(`✓ Loaded ${products.length} products`);
    }
  } catch (error) {
    console.error('Error loading test data:', error);
  }
}

// Health check
app.get('/actuator/health', (req, res) => {
  res.json({ status: 'UP' });
});

// SQL Schema endpoints
// In-memory storage for SQL schemas
if (!global.sqlSchemas) {
  global.sqlSchemas = [];
}

// Get all SQL schemas
app.get('/platform-api/sql/schema/listAll', (req, res) => {
  console.log('📋 GET /platform-api/sql/schema/listAll');
  console.log(`📋 Returning ${global.sqlSchemas.length} SQL schemas`);
  res.json(global.sqlSchemas);
});

// Get SQL schema by ID
app.get('/platform-api/sql/schema/:id', (req, res) => {
  const { id } = req.params;
  console.log(`📋 GET /platform-api/sql/schema/${id}`);
  const schema = global.sqlSchemas.find(s => s.id === id);

  if (schema) {
    console.log(`📋 Returning schema: ${schema.name}`);
    res.json(schema);
  } else {
    res.status(404).json({ error: 'SQL schema not found' });
  }
});

// Create SQL schema
app.post('/platform-api/sql/schema', (req, res) => {
  const schema = req.body;
  const id = `SCHEMA-${Date.now()}`;

  const newSchema = {
    ...schema,
    id,
    createDate: new Date().toISOString(),
    updateDate: new Date().toISOString(),
  };

  global.sqlSchemas.push(newSchema);
  console.log(`✓ Created SQL schema: ${schema.name} (${id})`);
  res.json(newSchema);
});

// Update SQL schema
app.put('/platform-api/sql/schema/:id', (req, res) => {
  const { id } = req.params;
  const updates = req.body;

  const index = global.sqlSchemas.findIndex(s => s.id === id);
  if (index !== -1) {
    global.sqlSchemas[index] = {
      ...global.sqlSchemas[index],
      ...updates,
      updateDate: new Date().toISOString(),
    };
    console.log(`✓ Updated SQL schema: ${id}`);
    res.json(global.sqlSchemas[index]);
  } else {
    res.status(404).json({ error: 'SQL schema not found' });
  }
});

// Delete SQL schema
app.delete('/platform-api/sql/schema/:id', (req, res) => {
  const { id } = req.params;

  const index = global.sqlSchemas.findIndex(s => s.id === id);
  if (index !== -1) {
    const schema = global.sqlSchemas[index];
    global.sqlSchemas.splice(index, 1);
    console.log(`✓ Deleted SQL schema: ${schema.name} (${id})`);
    res.json({ success: true });
  } else {
    res.status(404).json({ error: 'SQL schema not found' });
  }
});

// Statemachine/Workflow endpoints
// In-memory storage for workflows
if (!global.workflows) {
  global.workflows = [];
}

if (!global.workflowInstances) {
  global.workflowInstances = [];
}

// Get all workflows
app.get('/platform-api/statemachine/workflows', (req, res) => {
  console.log('📋 GET /platform-api/statemachine/workflows');
  console.log(`📋 Returning ${global.workflows.length} workflows`);
  res.json(global.workflows);
});

// Get workflow-enabled types
app.get('/platform-api/statemachine/workflow-enabled-types', (req, res) => {
  console.log('📋 GET /platform-api/statemachine/workflow-enabled-types');

  // Return entity types that have workflows enabled
  const enabledTypes = Object.keys(entityStore).map(entityClass => ({
    entityClass,
    workflowEnabled: true,
  }));

  console.log(`📋 Returning ${enabledTypes.length} workflow-enabled types`);
  res.json(enabledTypes);
});

// Get workflow by ID
app.get('/platform-api/statemachine/workflows/:id', (req, res) => {
  const { id } = req.params;
  console.log(`📋 GET /platform-api/statemachine/workflows/${id}`);
  const workflow = global.workflows.find(w => w.id === id);

  if (workflow) {
    console.log(`📋 Returning workflow: ${workflow.name}`);
    res.json(workflow);
  } else {
    res.status(404).json({ error: 'Workflow not found' });
  }
});

// Create workflow
app.post('/platform-api/statemachine/workflows', (req, res) => {
  const workflow = req.body;
  const id = `WF-${Date.now()}`;

  const newWorkflow = {
    ...workflow,
    id,
    createDate: new Date().toISOString(),
    updateDate: new Date().toISOString(),
  };

  global.workflows.push(newWorkflow);
  console.log(`✓ Created workflow: ${workflow.name} (${id})`);
  res.json(newWorkflow);
});

// Update workflow
app.put('/platform-api/statemachine/workflows/:id', (req, res) => {
  const { id } = req.params;
  const updates = req.body;

  const index = global.workflows.findIndex(w => w.id === id);
  if (index !== -1) {
    global.workflows[index] = {
      ...global.workflows[index],
      ...updates,
      updateDate: new Date().toISOString(),
    };
    console.log(`✓ Updated workflow: ${id}`);
    res.json(global.workflows[index]);
  } else {
    res.status(404).json({ error: 'Workflow not found' });
  }
});

// Delete workflow
app.delete('/platform-api/statemachine/workflows/:id', (req, res) => {
  const { id } = req.params;

  const index = global.workflows.findIndex(w => w.id === id);
  if (index !== -1) {
    const workflow = global.workflows[index];
    global.workflows.splice(index, 1);
    console.log(`✓ Deleted workflow: ${workflow.name} (${id})`);
    res.json({ success: true });
  } else {
    res.status(404).json({ error: 'Workflow not found' });
  }
});

// Get workflow instances
app.get('/platform-api/statemachine/instances', (req, res) => {
  console.log('📋 GET /platform-api/statemachine/instances');
  console.log(`📋 Returning ${global.workflowInstances.length} workflow instances`);
  res.json(global.workflowInstances);
});

// Get workflow instance by ID
app.get('/platform-api/statemachine/instances/:id', (req, res) => {
  const { id } = req.params;
  console.log(`📋 GET /platform-api/statemachine/instances/${id}`);
  const instance = global.workflowInstances.find(i => i.id === id);

  if (instance) {
    console.log(`📋 Returning workflow instance: ${id}`);
    res.json(instance);
  } else {
    res.status(404).json({ error: 'Workflow instance not found' });
  }
});

// Model endpoints
// Get entity model list
app.get('/platform-api/model/', (req, res) => {
  console.log('📋 GET /platform-api/model/');

  // Return list of entity models based on entity types
  const models = Object.keys(entityStore).map(entityClass => {
    const className = entityClass.split('.').pop();
    return {
      entityClass,
      className,
      fields: [
        { name: 'id', type: 'String', required: true },
        { name: 'name', type: 'String', required: false },
        { name: 'description', type: 'String', required: false },
        { name: 'createDate', type: 'Date', required: false },
        { name: 'updateDate', type: 'Date', required: false },
      ],
    };
  });

  console.log(`📋 Returning ${models.length} entity models`);
  res.json(models);
});

// Get entity model by class name
app.get('/platform-api/model/:entityClass', (req, res) => {
  const { entityClass } = req.params;
  console.log(`📋 GET /platform-api/model/${entityClass}`);

  if (entityStore[entityClass]) {
    const className = entityClass.split('.').pop();
    const model = {
      entityClass,
      className,
      fields: [
        { name: 'id', type: 'String', required: true },
        { name: 'name', type: 'String', required: false },
        { name: 'description', type: 'String', required: false },
        { name: 'createDate', type: 'Date', required: false },
        { name: 'updateDate', type: 'Date', required: false },
      ],
    };

    console.log(`📋 Returning model for: ${className}`);
    res.json(model);
  } else {
    res.status(404).json({ error: 'Entity model not found' });
  }
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

// Get entity classes (for various components)
app.get('/platform-api/entity/classes', (req, res) => {
  console.log('📋 GET /platform-api/entity/classes');
  const classes = Object.keys(entityStore);
  console.log(`📋 Returning ${classes.length} entity classes`);
  res.json(classes);
});

// Get reporting types (for CreateReportDialog)
app.get('/platform-api/reporting/types/fetch', (req, res) => {
  console.log('📋 GET /platform-api/reporting/types/fetch', req.query);
  const types = Object.keys(entityStore).map(entityClass => ({
    name: entityClass,
    label: entityClass.split('.').pop(), // Use last part as label
    type: 'BUSINESS', // Default to BUSINESS type
  }));
  console.log(`📋 Returning ${types.length} entity types`);
  res.json(types);
});

// Get reporting types (for HistoryFilter)
app.get('/platform-api/reporting/types', (req, res) => {
  const types = Object.keys(entityStore)
    .filter(entityClass => entityStore[entityClass].length > 0)
    .map(entityClass => ({
      name: entityClass,
      label: entityClass.split('.').pop(),
      type: 'BUSINESS',
    }));

  res.json({
    content: types,
    page: {
      size: types.length,
      totalElements: types.length,
      totalPages: 1,
      number: 0,
    },
  });
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

// Get all catalog items
app.get('/platform-api/catalog/item/all', (req, res) => {
  const items = Object.values(global.catalogItems);
  console.log(`📋 Returning ${items.length} catalog items`);
  if (items.length > 0) {
    console.log('First item sample:', JSON.stringify(items[0], null, 2));
  }
  res.json(items);
});

// Get catalog items by entity class
app.get('/platform-api/catalog/item/class', (req, res) => {
  const { entityClass } = req.query;
  console.log(`🔍 GET /platform-api/catalog/item/class?entityClass=${entityClass}`);
  console.log(`📊 Total catalog items: ${Object.keys(global.catalogItems).length}`);

  // Get catalog items for this entity class
  const items = Object.values(global.catalogItems).filter(
    (item) => item.entityClass === entityClass
  );

  console.log(`✅ Found ${items.length} items for entity class: ${entityClass}`);

  res.json(items);
});

// Create catalog item
app.post('/platform-api/catalog/item', (req, res) => {
  const catalogItem = req.body;
  const itemId = `CAT-${Date.now()}`;

  console.log('📥 Received catalog item:', JSON.stringify(catalogItem, null, 2));

  // Extract the alias name from the structure
  const aliasName = catalogItem.name || catalogItem.aliasDef?.name || catalogItem.alias;

  const newItem = {
    ...catalogItem,
    id: itemId, // Use 'id' instead of 'itemId' to match CatalogItem interface
    alias: aliasName, // Store the alias name for easy access
    createDate: catalogItem.createDate || new Date().toISOString(),
    user: catalogItem.user || 'admin',
    state: catalogItem.state || 'ACTIVE',
  };

  global.catalogItems[itemId] = newItem;

  console.log(`✓ Created alias: ${aliasName || 'unnamed'} (${itemId})`);
  console.log(`📤 Stored item:`, JSON.stringify(newItem, null, 2));

  res.json(itemId);
});

// Update catalog item
app.put('/platform-api/catalog/item', (req, res) => {
  const { itemId } = req.query;
  const catalogItem = req.body;

  if (global.catalogItems[itemId]) {
    const aliasName = catalogItem.name || catalogItem.aliasDef?.name || catalogItem.alias;
    global.catalogItems[itemId] = {
      ...global.catalogItems[itemId],
      ...catalogItem,
      id: itemId, // Preserve the id
      alias: aliasName,
    };
    console.log(`✓ Updated alias: ${aliasName || 'unnamed'} (${itemId})`);
  }

  res.json({ success: true });
});

// Delete catalog item
app.delete('/platform-api/catalog/item', (req, res) => {
  const { itemId } = req.query;

  if (global.catalogItems[itemId]) {
    const alias = global.catalogItems[itemId].alias || global.catalogItems[itemId].name;
    delete global.catalogItems[itemId];
    console.log(`✓ Deleted alias: ${alias}`);
  }

  res.json({ success: true });
});

// Export catalog items by IDs
app.get('/platform-api/catalog/item/export-by-ids', (req, res) => {
  const { ids, isSingleFile } = req.query;

  if (!ids) {
    res.status(400).json({ error: 'Missing ids parameter' });
    return;
  }

  const itemIds = ids.split(',');
  const exportedItems = itemIds
    .map(id => global.catalogItems[id])
    .filter(item => item !== undefined);

  console.log(`📦 Exporting ${exportedItems.length} catalog items`);

  const exportContainer = {
    '@bean': 'com.cyoda.core.model.catalog.AliasCatalogItemExportImportContainer',
    aliases: exportedItems
  };

  res.json(exportContainer);
});

// Import catalog items
app.post('/platform-api/catalog/item/import', (req, res) => {
  const { needRewrite } = req.query;
  const container = req.body;

  console.log(`📥 Importing ${container.aliases?.length || 0} catalog items (needRewrite: ${needRewrite})`);

  if (!container.aliases || !Array.isArray(container.aliases)) {
    res.status(400).json({ error: 'Invalid import container' });
    return;
  }

  let imported = 0;
  let skipped = 0;

  container.aliases.forEach(item => {
    const itemId = item.id || `CAT-${Date.now()}-${imported}`;

    // Check if item already exists
    const exists = Object.values(global.catalogItems).some(
      existing => existing.name === item.name && existing.entityClass === item.entityClass
    );

    if (exists && needRewrite !== 'true') {
      console.log(`⏭️  Skipping existing item: ${item.name}`);
      skipped++;
    } else {
      global.catalogItems[itemId] = {
        ...item,
        id: itemId,
        createDate: item.createDate || new Date().toISOString(),
        user: item.user || 'admin',
        state: item.state || 'ACTIVE',
      };
      console.log(`✓ Imported: ${item.name} (${itemId})`);
      imported++;
    }
  });

  console.log(`📊 Import complete: ${imported} imported, ${skipped} skipped`);

  res.json({
    success: true,
    imported,
    skipped,
    total: container.aliases.length
  });
});

// Get mapper classes (old endpoint)
app.get('/platform-api/catalog/mappers', (req, res) => {
  const mockMappers = [
    'com.cyoda.platform.mappers.IdentityMapper',
    'com.cyoda.platform.mappers.StringMapper',
    'com.cyoda.platform.mappers.NumberMapper',
    'com.cyoda.platform.mappers.DateMapper',
  ];

  res.json(mockMappers);
});

// Get mappers with metadata (new endpoint for alias parameters)
app.get('/platform-api/entity-info/fetch/mappers', (req, res) => {
  const { inClass } = req.query;

  // Full list of mappers with metadata
  const allMappers = [
    {
      shortName: 'IdentityMapper',
      mapperClass: 'com.cyoda.core.reports.aliasmappers.IdentityMapper',
      inType: 'java.lang.String',
      outType: 'java.lang.String',
      entityClass: 'com.cyoda.core.Entity',
      parametrized: false,
      decision: 'SIMPLE'
    },
    {
      shortName: 'StringToIntegerMapper',
      mapperClass: 'com.cyoda.core.reports.aliasmappers.StringToIntegerMapper',
      inType: 'java.lang.String',
      outType: 'java.lang.Integer',
      entityClass: 'com.cyoda.core.Entity',
      parametrized: true,
      decision: 'SIMPLE'
    },
    {
      shortName: 'DateFormatMapper',
      mapperClass: 'com.cyoda.core.reports.aliasmappers.DateFormatMapper',
      inType: 'java.util.Date',
      outType: 'java.lang.String',
      entityClass: 'com.cyoda.core.Entity',
      parametrized: true,
      decision: 'SIMPLE'
    },
    {
      shortName: 'NumberMapper',
      mapperClass: 'com.cyoda.core.reports.aliasmappers.NumberMapper',
      inType: 'java.lang.Double',
      outType: 'java.lang.Double',
      entityClass: 'com.cyoda.core.Entity',
      parametrized: false,
      decision: 'SIMPLE'
    },
    {
      shortName: 'BooleanMapper',
      mapperClass: 'com.cyoda.core.reports.aliasmappers.BooleanMapper',
      inType: 'java.lang.Boolean',
      outType: 'java.lang.Boolean',
      entityClass: 'com.cyoda.core.Entity',
      parametrized: false,
      decision: 'SIMPLE'
    },
    {
      shortName: 'ListToStringMapper',
      mapperClass: 'com.cyoda.core.reports.aliasmappers.ListToStringMapper',
      inType: 'java.util.List',
      outType: 'java.lang.String',
      entityClass: 'com.cyoda.core.Entity',
      parametrized: true,
      decision: 'SIMPLE'
    }
  ];

  // Filter by inClass if provided
  if (inClass) {
    const filtered = allMappers.filter(mapper => mapper.inType === inClass);
    res.json(filtered);
  } else {
    res.json(allMappers);
  }
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
      requestClass: 'com.cyoda.tms.model.entities.Customer',
      entityClass: 'com.cyoda.tms.model.entities.Customer',
      userId: 'admin',
      creationDate: new Date('2024-01-15').toISOString(),
      modificationDate: new Date('2024-01-15').toISOString(),
      colDefs: [
        {
          '@bean': 'com.cyoda.core.reporting.model.ColDef',
          fullPath: 'id',
          alias: 'id',
        },
        {
          '@bean': 'com.cyoda.core.reporting.model.ColDef',
          fullPath: 'customerId',
          alias: 'customerId',
        },
        {
          '@bean': 'com.cyoda.core.reporting.model.ColDef',
          fullPath: 'firstName',
          alias: 'firstName',
        },
        {
          '@bean': 'com.cyoda.core.reporting.model.ColDef',
          fullPath: 'lastName',
          alias: 'lastName',
        },
        {
          '@bean': 'com.cyoda.core.reporting.model.ColDef',
          fullPath: 'email',
          alias: 'email',
        },
      ],
      columns: [
        { '@bean': 'com.cyoda.core.reporting.model.Column', name: 'id' },
        { '@bean': 'com.cyoda.core.reporting.model.Column', name: 'customerId' },
        { '@bean': 'com.cyoda.core.reporting.model.Column', name: 'firstName' },
        { '@bean': 'com.cyoda.core.reporting.model.Column', name: 'lastName' },
      ],
      condition: {
        '@bean': 'com.cyoda.core.conditions.queryable.Group',
        operator: 'AND',
        conditions: [],
      },
      singletonReport: false,
    },
    'RPT-002': {
      id: 'RPT-002',
      name: 'Transaction Report',
      description: 'List of all transactions',
      type: 'STANDARD',
      requestClass: 'com.cyoda.tms.model.entities.Transaction',
      entityClass: 'com.cyoda.tms.model.entities.Transaction',
      userId: 'admin',
      creationDate: new Date('2024-01-16').toISOString(),
      modificationDate: new Date('2024-01-16').toISOString(),
      colDefs: [
        {
          '@bean': 'com.cyoda.core.reporting.model.ColDef',
          fullPath: 'id',
          alias: 'id',
        },
        {
          '@bean': 'com.cyoda.core.reporting.model.ColDef',
          fullPath: 'transactionId',
          alias: 'transactionId',
        },
        {
          '@bean': 'com.cyoda.core.reporting.model.ColDef',
          fullPath: 'amount',
          alias: 'amount',
        },
      ],
      columns: [
        { '@bean': 'com.cyoda.core.reporting.model.Column', name: 'id' },
        { '@bean': 'com.cyoda.core.reporting.model.Column', name: 'transactionId' },
      ],
      condition: {
        '@bean': 'com.cyoda.core.conditions.queryable.Group',
        operator: 'AND',
        conditions: [],
      },
      singletonReport: false,
    },
    'RPT-003': {
      id: 'RPT-003',
      name: 'Product Report',
      description: 'List of all products',
      type: 'STANDARD',
      requestClass: 'com.cyoda.tms.model.entities.Product',
      entityClass: 'com.cyoda.tms.model.entities.Product',
      userId: 'admin',
      creationDate: new Date('2024-01-17').toISOString(),
      modificationDate: new Date('2024-01-17').toISOString(),
      colDefs: [
        {
          '@bean': 'com.cyoda.core.reporting.model.ColDef',
          fullPath: 'id',
          alias: 'id',
        },
        {
          '@bean': 'com.cyoda.core.reporting.model.ColDef',
          fullPath: 'productId',
          alias: 'productId',
        },
        {
          '@bean': 'com.cyoda.core.reporting.model.ColDef',
          fullPath: 'name',
          alias: 'name',
        },
      ],
      columns: [
        { '@bean': 'com.cyoda.core.reporting.model.Column', name: 'id' },
        { '@bean': 'com.cyoda.core.reporting.model.Column', name: 'productId' },
      ],
      condition: {
        '@bean': 'com.cyoda.core.conditions.queryable.Group',
        operator: 'AND',
        conditions: [],
      },
      singletonReport: false,
    }
  };
}

// Get all stream report definitions (multiple endpoint paths for compatibility)
app.get('/platform-api/reporting/stream-definitions', (req, res) => {
  console.log('📋 GET /platform-api/reporting/stream-definitions');
  console.log(`📋 Returning ${streamDefinitions.length} stream definitions`);
  res.json(streamDefinitions);
});

app.get('/platform-api/streamdata/definitions', (req, res) => {
  console.log('📋 GET /platform-api/streamdata/definitions');
  console.log(`📋 Returning ${streamDefinitions.length} stream definitions`);
  res.json(streamDefinitions);
});

app.get('/platform-api/stream-data/config/list', (req, res) => {
  console.log('📋 GET /platform-api/stream-data/config/list');
  console.log(`📋 Returning ${streamDefinitions.length} stream definitions`);
  res.json(streamDefinitions);
});

// Get single stream report definition (multiple endpoint paths)
app.get('/platform-api/reporting/stream-definitions/:id', (req, res) => {
  console.log(`📋 GET /platform-api/reporting/stream-definitions/${req.params.id}`);
  const { id } = req.params;
  const definition = streamDefinitions.find(d => d.id === id);

  if (definition) {
    console.log(`📋 Returning stream definition: ${id}`);
    res.json(definition);
  } else {
    res.status(404).json({ error: 'Stream report definition not found' });
  }
});

app.get('/platform-api/streamdata/definitions/:id', (req, res) => {
  console.log(`📋 GET /platform-api/streamdata/definitions/${req.params.id}`);
  const { id } = req.params;
  const definition = streamDefinitions.find(d => d.id === id);

  if (definition) {
    console.log(`📋 Returning stream definition: ${id}`);
    res.json(definition);
  } else {
    res.status(404).json({ error: 'Stream report definition not found' });
  }
});

// Create stream report definition (multiple endpoint paths)
app.post('/platform-api/reporting/stream-definitions', (req, res) => {
  console.log('📋 POST /platform-api/reporting/stream-definitions', req.body);
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
  console.log(`📋 Created stream definition with ID: ${id}`);
  res.json({ id });
});

app.post('/platform-api/streamdata/definitions', (req, res) => {
  console.log('📋 POST /platform-api/streamdata/definitions', req.body);
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
  console.log(`📋 Created stream definition with ID: ${id}`);
  res.json({ id });
});

app.post('/platform-api/stream-data/config', (req, res) => {
  console.log('📋 POST /platform-api/stream-data/config', req.body);
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
  console.log(`📋 Created stream definition with ID: ${id}`);
  res.json(id);
});

// Update stream report definition (multiple endpoint paths)
app.put('/platform-api/reporting/stream-definitions/:id', (req, res) => {
  console.log(`📋 PUT /platform-api/reporting/stream-definitions/${req.params.id}`);
  const { id } = req.params;
  const definition = req.body;

  const index = streamDefinitions.findIndex(d => d.id === id);
  if (index !== -1) {
    streamDefinitions[index] = {
      ...streamDefinitions[index],
      ...definition,
      streamDataDef: definition.streamDataDef || definition,
    };
    console.log(`📋 Updated stream definition: ${id}`);
    res.json({ success: true });
  } else {
    res.status(404).json({ error: 'Stream report definition not found' });
  }
});

app.put('/platform-api/streamdata/definitions/:id', (req, res) => {
  console.log(`📋 PUT /platform-api/streamdata/definitions/${req.params.id}`);
  const { id } = req.params;
  const definition = req.body;

  const index = streamDefinitions.findIndex(d => d.id === id);
  if (index !== -1) {
    streamDefinitions[index] = {
      ...streamDefinitions[index],
      ...definition,
      streamDataDef: definition.streamDataDef || definition,
    };
    console.log(`📋 Updated stream definition: ${id}`);
    res.json({ success: true });
  } else {
    res.status(404).json({ error: 'Stream report definition not found' });
  }
});

// Delete stream report definition (multiple endpoint paths)
app.delete('/platform-api/reporting/stream-definitions/:id', (req, res) => {
  console.log(`📋 DELETE /platform-api/reporting/stream-definitions/${req.params.id}`);
  const { id } = req.params;
  const index = streamDefinitions.findIndex(d => d.id === id);

  if (index !== -1) {
    streamDefinitions.splice(index, 1);
    console.log(`📋 Deleted stream definition: ${id}`);
    res.json({ success: true });
  } else {
    res.status(404).json({ error: 'Stream report definition not found' });
  }
});

app.delete('/platform-api/streamdata/definitions/:id', (req, res) => {
  console.log(`📋 DELETE /platform-api/streamdata/definitions/${req.params.id}`);
  const { id } = req.params;
  const index = streamDefinitions.findIndex(d => d.id === id);

  if (index !== -1) {
    streamDefinitions.splice(index, 1);
    console.log(`📋 Deleted stream definition: ${id}`);
    res.json({ success: true });
  } else {
    res.status(404).json({ error: 'Stream report definition not found' });
  }
});

// Get stream data (execute stream report)
app.post('/platform-api/reporting/stream-data', (req, res) => {
  console.log('📋 POST /platform-api/reporting/stream-data');
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

  console.log(`📋 Returning ${mockStreamData.rows.length} stream data rows`);
  res.json(mockStreamData);
});

// Fetch stream data (alternative endpoint)
app.post('/platform-api/streamdata/fetch', (req, res) => {
  console.log('📋 POST /platform-api/streamdata/fetch');
  const request = req.body;
  console.log('📋 Stream data request:', JSON.stringify(request, null, 2));

  // Generate mock data based on the columns in the request
  const columns = request.sdDef?.columns || [];
  const length = request.length || 100;

  const rows = [];
  for (let i = 0; i < Math.min(length, 50); i++) {
    const columnsValues = {};
    columns.forEach(col => {
      const colName = col.name || col.alias || 'unknown';
      // Generate mock data based on column type
      if (colName.includes('id') || colName.includes('Id')) {
        columnsValues[colName] = `ID-${i + 1}`;
      } else if (colName.includes('name') || colName.includes('Name')) {
        columnsValues[colName] = `Item ${i + 1}`;
      } else if (colName.includes('date') || colName.includes('Date') || colName.includes('time') || colName.includes('Time')) {
        columnsValues[colName] = new Date(Date.now() - i * 86400000).toISOString();
      } else if (colName.includes('price') || colName.includes('Price') || colName.includes('amount') || colName.includes('Amount')) {
        columnsValues[colName] = (Math.random() * 1000).toFixed(2);
      } else {
        columnsValues[colName] = `Value ${i + 1}`;
      }
    });
    rows.push({ columnsValues });
  }

  const mockStreamData = {
    rows,
    pointTime: request.pointTime || Date.now(),
  };

  console.log(`📋 Returning ${mockStreamData.rows.length} stream data rows`);
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
    // Convert entity values array to flat object
    const flatEntity = {
      id: entityId,
      entityClass: entityClass,
      state: 'VALIDATED',
      previousTransition: null,
      creationDate: new Date('2024-04-19T09:25:08.035+00:00').toISOString(),
      lastUpdateTime: new Date('2024-04-22T12:01:22.394+00:00').toISOString(),
    };

    // Add all values from the entity
    entity.values.forEach(v => {
      flatEntity[v.columnPath] = v.value;
    });

    res.json(flatEntity);
  } else {
    res.status(404).json({ error: 'Entity not found' });
  }
});

// Get entity transactions (for Data Lineage)
app.get('/platform-api/fetch/transactions', (req, res) => {
  const { entityClass, entityId } = req.query;

  // Mock transaction history
  const transactions = [
    {
      transactionId: 'TX-001',
      dateTime: '21-10-2025 10:30:15.123',
      changeCount: 3,
      timestamp: new Date('2025-10-21T10:30:15.123Z').getTime(),
    },
    {
      transactionId: 'TX-002',
      dateTime: '20-10-2025 14:22:45.456',
      changeCount: 5,
      timestamp: new Date('2025-10-20T14:22:45.456Z').getTime(),
    },
    {
      transactionId: 'TX-003',
      dateTime: '19-10-2025 09:15:30.789',
      changeCount: 2,
      timestamp: new Date('2025-10-19T09:15:30.789Z').getTime(),
    },
    {
      transactionId: 'TX-004',
      dateTime: '18-10-2025 16:45:12.234',
      changeCount: 4,
      timestamp: new Date('2025-10-18T16:45:12.234Z').getTime(),
    },
  ];

  res.json(transactions);
});

// Get entity changes (for Audit tab)
app.get('/platform-processing/transactions/view/entity-changes', (req, res) => {
  const { type, id } = req.query;

  // Mock entity change history
  const changes = [
    {
      transactionId: 'TX-001',
      timeUUID: 'uuid-001',
      creationDate: '2025-10-21 10:30:15',
      user: 'admin',
      operation: 'UPDATE',
      changedFieldValues: [
        { columnPath: 'state', prevValue: 'PENDING', currValue: 'VALIDATED' },
        { columnPath: 'price', prevValue: '1199.99', currValue: '1299.99' },
        { columnPath: 'stock', prevValue: '50', currValue: '45' },
      ],
    },
    {
      transactionId: 'TX-002',
      timeUUID: 'uuid-002',
      creationDate: '2025-10-20 14:22:45',
      user: 'john.doe',
      operation: 'UPDATE',
      changedFieldValues: [
        { columnPath: 'name', prevValue: 'Laptop', currValue: 'Premium Laptop' },
        { columnPath: 'category', prevValue: 'Computers', currValue: 'Electronics' },
        { columnPath: 'manufacturer', prevValue: 'GenericCorp', currValue: 'TechCorp' },
        { columnPath: 'weight', prevValue: '1.8', currValue: '1.5' },
        { columnPath: 'sku', prevValue: 'LAP-001', currValue: 'TECH-LAP-001' },
      ],
    },
    {
      transactionId: 'TX-003',
      timeUUID: 'uuid-003',
      creationDate: '2025-10-19 09:15:30',
      user: 'admin',
      operation: 'UPDATE',
      changedFieldValues: [
        { columnPath: 'price', prevValue: '999.99', currValue: '1199.99' },
        { columnPath: 'currency', prevValue: 'EUR', currValue: 'USD' },
      ],
    },
    {
      transactionId: 'TX-004',
      timeUUID: 'uuid-004',
      creationDate: '2025-10-18 16:45:12',
      user: 'jane.smith',
      operation: 'CREATE',
      changedFieldValues: [
        { columnPath: 'state', prevValue: null, currValue: 'PENDING' },
        { columnPath: 'status', prevValue: null, currValue: 'ACTIVE' },
        { columnPath: 'stock', prevValue: null, currValue: '50' },
        { columnPath: 'price', prevValue: null, currValue: '999.99' },
      ],
    },
  ];

  res.json(changes);
});

// Get transaction diff (for comparing versions)
app.get('/platform-api/transactions/diff', (req, res) => {
  const { entityClass, entityId, firstTx, lastTx } = req.query;

  // Mock diff data
  const diff = {
    changedFields: [
      {
        columnPath: 'price',
        columnPathContainer: {
          elements: [{ columnName: 'price', type: 'DOUBLE' }],
          shortPath: 'price',
          prevValue: '999.99',
          currValue: '1299.99',
        },
      },
      {
        columnPath: 'state',
        columnPathContainer: {
          elements: [{ columnName: 'state', type: 'STRING' }],
          shortPath: 'state',
          prevValue: 'PENDING',
          currValue: 'VALIDATED',
        },
      },
    ],
  };

  res.json(diff);
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
    configName: `grid-config-${definition.name}`,
    status: 'RUNNING',
    createTime: new Date().toISOString(),
    entityClass: entityClass,
    totalRows: entities.length,
  };

  console.log(`✓ Started report: ${reportId} for config ${gridConfig}`);

  // Simulate async execution - complete after 2 seconds and generate results
  setTimeout(() => {
    if (global.runningReports[reportId]) {
      // Generate report results
      const results = entities.map(entity => {
        const row = {};
        entity.values.forEach(v => {
          row[v.columnPath] = v.value;
        });
        return row;
      });

      global.runningReports[reportId].status = 'COMPLETED';
      global.runningReports[reportId].finishTime = new Date().toISOString();
      global.runningReports[reportId].results = results;
      console.log(`✓ Completed report: ${reportId} with ${results.length} rows`);
    }
  }, 2000);

  res.json({
    content: reportId,
    message: 'Report execution started'
  });
});

// Get report status and results
app.get('/platform-api/reporting/status/:reportId', (req, res) => {
  const { reportId } = req.params;
  const report = global.runningReports?.[reportId];

  if (!report) {
    return res.status(404).json({ error: 'Report not found' });
  }

  res.json(report);
});

// Get report results (for completed reports)
app.get('/platform-api/reporting/results/:reportId', (req, res) => {
  const { reportId } = req.params;
  const report = global.runningReports?.[reportId];

  if (!report) {
    return res.status(404).json({ error: 'Report not found' });
  }

  if (report.status !== 'COMPLETED') {
    return res.status(400).json({ error: 'Report is not completed yet', status: report.status });
  }

  res.json({
    reportId: reportId,
    status: 'COMPLETED',
    results: report.results || [],
    totalRows: report.results?.length || 0,
    createTime: report.createTime,
    finishTime: report.finishTime,
    configName: report.configName,
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

// Get report history
app.get('/platform-api/reporting/history', (req, res) => {
  const runningReports = global.runningReports || {};
  const reports = Object.values(runningReports).map(report => ({
    id: report.id,
    configId: report.configId,
    configName: report.configName,
    status: report.status,
    createTime: report.createTime,
    finishTime: report.finishTime || report.createTime,
    totalRowsCount: report.totalRows || 0,
    reportFailed: report.status === 'FAILED',
    type: 'STANDARD',
    user: {
      username: 'admin',
      firstName: 'Admin',
      lastName: 'User',
    },
    groupingColumns: [],
    groupingVersion: 0,
    hierarhyEnable: false,
    regroupingPossible: true,
  }));

  res.json(reports);
});

// Get report definition by report ID
app.get('/platform-api/reporting/report/:reportId', (req, res) => {
  const { reportId } = req.params;
  const report = global.runningReports?.[reportId];

  if (!report) {
    return res.status(404).json({ error: 'Report not found' });
  }

  res.json({
    id: report.id,
    configId: report.configId,
    configName: report.configName,
    status: report.status,
    createTime: report.createTime,
    finishTime: report.finishTime,
    totalRows: report.totalRows,
  });
});

// Get config definition by config ID
app.get('/platform-api/reporting/config/:configId', (req, res) => {
  const { configId } = req.params;
  const definitions = global.reportDefinitions || {};
  const definition = definitions[configId];

  if (!definition) {
    return res.status(404).json({ error: 'Config definition not found' });
  }

  res.json(definition);
});

// Get report rows (both paths for compatibility)
const getReportRows = (req, res) => {
  const { reportId } = req.params;
  const { size = 100 } = req.query;
  const report = global.runningReports?.[reportId];

  console.log(`GET report rows for ${reportId}, size=${size}`);

  if (!report) {
    console.log(`Report ${reportId} not found`);
    return res.status(404).json({ error: 'Report not found' });
  }

  if (report.status !== 'COMPLETED') {
    console.log(`Report ${reportId} is ${report.status}, not COMPLETED`);
    return res.status(400).json({ error: 'Report is not completed yet' });
  }

  const results = report.results || [];
  const pageSize = parseInt(size);
  const pagedResults = results.slice(0, pageSize);

  console.log(`Returning ${pagedResults.length} rows for report ${reportId}`);

  // Format data as expected by ReportTableRows component
  const reportRows = pagedResults.map(row => ({
    content: row,
  }));

  res.json({
    _embedded: {
      reportRows: reportRows,
    },
    page: {
      size: pagedResults.length,
      totalElements: results.length,
      totalPages: Math.ceil(results.length / pageSize),
      number: 0,
    },
  });
};

app.get('/platform-api/report/:reportId/rows', getReportRows);
app.get('/platform-api/reporting/report/:reportId/rows', getReportRows);

// Export report definitions by IDs
app.get('/platform-api/reporting/export-by-ids', (req, res) => {
  const { includeIds } = req.query;

  if (!includeIds) {
    return res.status(400).json({ error: 'includeIds parameter is required' });
  }

  const ids = includeIds.split(',');
  const definitions = global.reportDefinitions || {};

  console.log(`📤 Exporting report definitions: ${ids.join(', ')}`);

  // Collect the definitions to export
  const exportData = {
    data: {
      value: []
    }
  };

  ids.forEach(id => {
    const definition = definitions[id];
    if (definition) {
      exportData.data.value.push({
        id: definition.id,
        name: definition.name,
        description: definition.description || '',
        type: definition.type || 'STANDARD',
        entityClass: definition.entityClass,
        userId: definition.userId || 'admin',
        creationDate: definition.creationDate,
        modificationDate: definition.modificationDate,
        columns: definition.columns || [],
        condition: definition.condition || {
          '@bean': 'com.cyoda.core.conditions.GroupCondition',
          operator: 'OR',
          conditions: []
        },
        '@bean': 'com.cyoda.service.api.beans.ReportDefinition'
      });
    }
  });

  console.log(`✓ Exported ${exportData.data.value.length} report definitions`);
  res.json(exportData);
});

// Import report definitions
app.post('/platform-api/reporting/import', (req, res) => {
  const importData = req.body;

  console.log('📥 Importing report definitions...');

  if (!importData || !importData.data || !importData.data.value) {
    return res.status(400).json({ error: 'Invalid import data format' });
  }

  const definitions = global.reportDefinitions || {};
  const imported = [];
  const errors = [];

  importData.data.value.forEach(def => {
    try {
      // Generate new ID if not exists or if it conflicts
      const id = def.id || `RPT-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

      const now = new Date().toISOString();
      definitions[id] = {
        ...def,
        id: id,
        creationDate: def.creationDate || now,
        modificationDate: now,
        userId: def.userId || 'admin'
      };

      imported.push(id);
      console.log(`  ✓ Imported: ${def.name} (${id})`);
    } catch (error) {
      errors.push({ name: def.name, error: error.message });
      console.error(`  ✗ Failed to import: ${def.name}`, error);
    }
  });

  global.reportDefinitions = definitions;

  console.log(`✓ Import complete: ${imported.length} successful, ${errors.length} failed`);

  res.json({
    success: true,
    imported: imported.length,
    failed: errors.length,
    errors: errors,
    message: `Successfully imported ${imported.length} report definition(s)`
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
  console.log('  GET  /platform-api/sql/schema/listAll');
  console.log('  GET  /platform-api/sql/schema/:id');
  console.log('  POST /platform-api/sql/schema');
  console.log('  PUT  /platform-api/sql/schema/:id');
  console.log('  DELETE /platform-api/sql/schema/:id');
  console.log('  GET  /platform-api/statemachine/workflows');
  console.log('  GET  /platform-api/statemachine/workflow-enabled-types');
  console.log('  GET  /platform-api/statemachine/workflows/:id');
  console.log('  POST /platform-api/statemachine/workflows');
  console.log('  PUT  /platform-api/statemachine/workflows/:id');
  console.log('  DELETE /platform-api/statemachine/workflows/:id');
  console.log('  GET  /platform-api/statemachine/instances');
  console.log('  GET  /platform-api/statemachine/instances/:id');
  console.log('  GET  /platform-api/model/');
  console.log('  GET  /platform-api/model/:entityClass');
  console.log('  GET  /platform-api/entity-info/fetch/types');
  console.log('  GET  /platform-api/entity/:entityClass/:entityId');
  console.log('  GET  /platform-api/entity/:entityClass/search');
  console.log('  POST /platform-api/entity');
  console.log('  POST /platform-api/entity/:entityClass/import');
  console.log('  GET  /platform-api/entity/:entityClass/count');
  console.log('  POST /platform-api/reporting/execute');
  console.log('  POST /platform-api/pre?gridConfig={id}');
  console.log('  GET  /platform-api/reporting/status/:reportId');
  console.log('  GET  /platform-api/reporting/results/:reportId');
  console.log('  GET  /platform-api/reporting/history');
  console.log('  GET  /platform-api/reporting/export-by-ids?includeIds={ids}');
  console.log('  POST /platform-api/reporting/import');
  console.log('  POST /platform-api/stream-data/query-plan');
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


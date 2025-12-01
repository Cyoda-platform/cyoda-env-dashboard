// Mock for @cyoda/http-api-react
// This will be replaced with the actual package once it's available

// Mock data storage
const mockSchemas = [
  {
    id: '550e8400-e29b-41d4-a716-446655440000',
    schemaName: 'customer_orders_schema',
    timestamp: Date.now(),
    tables: [
      {
        metadataClassId: 'customer-class-001',
        tableName: 'customers',
        uniformedPath: 'data.customers',
        hidden: false,
        fields: [
          { fieldName: 'customer_id', fieldType: 'bigint', fieldCategory: 'DATA', hidden: false, flatten: false },
          { fieldName: 'first_name', fieldType: 'varchar', fieldCategory: 'DATA', hidden: false, flatten: false },
          { fieldName: 'last_name', fieldType: 'varchar', fieldCategory: 'DATA', hidden: false, flatten: false },
          { fieldName: 'email', fieldType: 'varchar', fieldCategory: 'DATA', hidden: false, flatten: false },
          { fieldName: 'phone_number', fieldType: 'varchar', fieldCategory: 'DATA', hidden: false, flatten: false },
          { fieldName: 'created_at', fieldType: 'timestamp', fieldCategory: 'METADATA', hidden: false, flatten: false },
        ],
      },
      {
        metadataClassId: 'order-class-001',
        tableName: 'orders',
        uniformedPath: 'data.orders',
        hidden: false,
        fields: [
          { fieldName: 'order_id', fieldType: 'bigint', fieldCategory: 'DATA', hidden: false, flatten: false },
          { fieldName: 'customer_id', fieldType: 'bigint', fieldCategory: 'DATA', hidden: false, flatten: false },
          { fieldName: 'order_date', fieldType: 'timestamp', fieldCategory: 'DATA', hidden: false, flatten: false },
          { fieldName: 'total_amount', fieldType: 'decimal', fieldCategory: 'DATA', hidden: false, flatten: false },
          { fieldName: 'status', fieldType: 'varchar', fieldCategory: 'DATA', hidden: false, flatten: false },
        ],
      },
      {
        metadataClassId: 'product-class-001',
        tableName: 'products',
        uniformedPath: 'data.products',
        hidden: false,
        fields: [
          { fieldName: 'product_id', fieldType: 'bigint', fieldCategory: 'DATA', hidden: false, flatten: false },
          { fieldName: 'product_name', fieldType: 'varchar', fieldCategory: 'DATA', hidden: false, flatten: false },
          { fieldName: 'description', fieldType: 'varchar', fieldCategory: 'DATA', hidden: false, flatten: false },
          { fieldName: 'price', fieldType: 'decimal', fieldCategory: 'DATA', hidden: false, flatten: false },
          { fieldName: 'stock_quantity', fieldType: 'int', fieldCategory: 'DATA', hidden: false, flatten: false },
        ],
      },
    ],
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440001',
    schemaName: 'analytics_schema',
    timestamp: Date.now() - 86400000,
    tables: [
      {
        metadataClassId: 'analytics-class-001',
        tableName: 'user_events',
        uniformedPath: 'analytics.events',
        hidden: false,
        fields: [
          { fieldName: 'event_id', fieldType: 'bigint', fieldCategory: 'DATA', hidden: false, flatten: false },
          { fieldName: 'user_id', fieldType: 'bigint', fieldCategory: 'DATA', hidden: false, flatten: false },
          { fieldName: 'event_type', fieldType: 'varchar', fieldCategory: 'DATA', hidden: false, flatten: false },
          { fieldName: 'event_timestamp', fieldType: 'timestamp', fieldCategory: 'DATA', hidden: false, flatten: false },
          { fieldName: 'properties', fieldType: 'json', fieldCategory: 'DATA', hidden: false, flatten: false },
        ],
      },
      {
        metadataClassId: 'analytics-class-002',
        tableName: 'page_views',
        uniformedPath: 'analytics.pageviews',
        hidden: false,
        fields: [
          { fieldName: 'view_id', fieldType: 'bigint', fieldCategory: 'DATA', hidden: false, flatten: false },
          { fieldName: 'page_url', fieldType: 'varchar', fieldCategory: 'DATA', hidden: false, flatten: false },
          { fieldName: 'user_id', fieldType: 'bigint', fieldCategory: 'DATA', hidden: false, flatten: false },
          { fieldName: 'view_timestamp', fieldType: 'timestamp', fieldCategory: 'DATA', hidden: false, flatten: false },
          { fieldName: 'duration_seconds', fieldType: 'int', fieldCategory: 'DATA', hidden: false, flatten: false },
        ],
      },
    ],
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440002',
    schemaName: 'inventory_schema',
    timestamp: Date.now() - 172800000,
    tables: [
      {
        metadataClassId: 'inventory-class-001',
        tableName: 'warehouses',
        uniformedPath: 'inventory.warehouses',
        hidden: false,
        fields: [
          { fieldName: 'warehouse_id', fieldType: 'bigint', fieldCategory: 'DATA', hidden: false, flatten: false },
          { fieldName: 'warehouse_name', fieldType: 'varchar', fieldCategory: 'DATA', hidden: false, flatten: false },
          { fieldName: 'location', fieldType: 'varchar', fieldCategory: 'DATA', hidden: false, flatten: false },
          { fieldName: 'capacity', fieldType: 'int', fieldCategory: 'DATA', hidden: false, flatten: false },
        ],
      },
      {
        metadataClassId: 'inventory-class-002',
        tableName: 'stock_levels',
        uniformedPath: 'inventory.stock',
        hidden: false,
        fields: [
          { fieldName: 'stock_id', fieldType: 'bigint', fieldCategory: 'DATA', hidden: false, flatten: false },
          { fieldName: 'product_id', fieldType: 'bigint', fieldCategory: 'DATA', hidden: false, flatten: false },
          { fieldName: 'warehouse_id', fieldType: 'bigint', fieldCategory: 'DATA', hidden: false, flatten: false },
          { fieldName: 'quantity', fieldType: 'int', fieldCategory: 'DATA', hidden: false, flatten: false },
          { fieldName: 'last_updated', fieldType: 'timestamp', fieldCategory: 'METADATA', hidden: false, flatten: false },
        ],
      },
    ],
  },
];

const mockEntityModels = [
  { id: 'model-001', name: 'Customer', className: 'com.example.Customer' },
  { id: 'model-002', name: 'Order', className: 'com.example.Order' },
  { id: 'model-003', name: 'Product', className: 'com.example.Product' },
  { id: 'model-004', name: 'Analytics', className: 'com.example.Analytics' },
];

const axios = {
  get: async (url: string) => {
    console.log('Mock GET:', url);

    // Handle different endpoints
    if (url === '/api/sql/schema/listAll') {
      return { data: mockSchemas, status: 200 };
    }

    if (url === '/api/model/') {
      return { data: mockEntityModels, status: 200 };
    }

    // Check genTables BEFORE checking schema by ID (more specific pattern first)
    if (url.startsWith('/api/sql/schema/genTables/')) {
      const modelId = url.split('/').pop();
      console.log('Mock API: Generating tables for model ID:', modelId);

      // Return different mock tables based on model ID
      const mockTablesByModel: Record<string, any[]> = {
        'model-001': [
          {
            metadataClassId: modelId,
            tableName: 'customer_data',
            uniformedPath: 'data.customer_data',
            hidden: false,
            fields: [
              { fieldName: 'id', fieldType: 'bigint', fieldCategory: 'DATA', hidden: false, flatten: false },
              { fieldName: 'name', fieldType: 'varchar', fieldCategory: 'DATA', hidden: false, flatten: false },
              { fieldName: 'email', fieldType: 'varchar', fieldCategory: 'DATA', hidden: false, flatten: false },
              { fieldName: 'created_at', fieldType: 'timestamp', fieldCategory: 'METADATA', hidden: false, flatten: false },
            ],
          },
        ],
        'model-002': [
          {
            metadataClassId: modelId,
            tableName: 'order_data',
            uniformedPath: 'data.order_data',
            hidden: false,
            fields: [
              { fieldName: 'order_id', fieldType: 'bigint', fieldCategory: 'DATA', hidden: false, flatten: false },
              { fieldName: 'customer_id', fieldType: 'bigint', fieldCategory: 'DATA', hidden: false, flatten: false },
              { fieldName: 'amount', fieldType: 'decimal', fieldCategory: 'DATA', hidden: false, flatten: false },
              { fieldName: 'status', fieldType: 'varchar', fieldCategory: 'DATA', hidden: false, flatten: false },
            ],
          },
        ],
        'model-003': [
          {
            metadataClassId: modelId,
            tableName: 'product_catalog',
            uniformedPath: 'data.product_catalog',
            hidden: false,
            fields: [
              { fieldName: 'product_id', fieldType: 'bigint', fieldCategory: 'DATA', hidden: false, flatten: false },
              { fieldName: 'name', fieldType: 'varchar', fieldCategory: 'DATA', hidden: false, flatten: false },
              { fieldName: 'price', fieldType: 'decimal', fieldCategory: 'DATA', hidden: false, flatten: false },
              { fieldName: 'in_stock', fieldType: 'boolean', fieldCategory: 'DATA', hidden: false, flatten: false },
            ],
          },
        ],
        'model-004': [
          {
            metadataClassId: modelId,
            tableName: 'analytics_events',
            uniformedPath: 'analytics.events',
            hidden: false,
            fields: [
              { fieldName: 'event_id', fieldType: 'bigint', fieldCategory: 'DATA', hidden: false, flatten: false },
              { fieldName: 'event_type', fieldType: 'varchar', fieldCategory: 'DATA', hidden: false, flatten: false },
              { fieldName: 'user_id', fieldType: 'bigint', fieldCategory: 'DATA', hidden: false, flatten: false },
              { fieldName: 'timestamp', fieldType: 'timestamp', fieldCategory: 'DATA', hidden: false, flatten: false },
              { fieldName: 'properties', fieldType: 'json', fieldCategory: 'DATA', hidden: false, flatten: false },
            ],
          },
        ],
      };

      const tables = mockTablesByModel[modelId || ''] || [
        {
          metadataClassId: modelId,
          tableName: 'generated_table',
          uniformedPath: 'data.generated_table',
          hidden: false,
          fields: [
            { fieldName: 'id', fieldType: 'bigint', fieldCategory: 'DATA', hidden: false, flatten: false },
            { fieldName: 'name', fieldType: 'varchar', fieldCategory: 'DATA', hidden: false, flatten: false },
          ],
        },
      ];

      console.log('Mock API: Returning tables:', tables);

      return {
        data: tables,
        status: 200,
      };
    }

    // Check schema by ID (less specific pattern, check last)
    if (url.startsWith('/api/sql/schema/') && url.length > 17) {
      const schemaId = url.split('/').pop();
      const schema = mockSchemas.find(s => s.id === schemaId);
      return { data: schema || null, status: schema ? 200 : 404 };
    }

    return { data: [], status: 200 };
  },

  post: async (url: string, data: any) => {
    console.log('Mock POST:', url, data);

    if (url === '/api/sql/schema/') {
      // Save schema - return the data with an ID if it doesn't have one
      const savedSchema = {
        ...data,
        id: data.id || `550e8400-e29b-41d4-a716-${Date.now()}`,
        timestamp: Date.now(),
      };

      // Update mockSchemas
      const existingIndex = mockSchemas.findIndex(s => s.id === savedSchema.id);
      if (existingIndex >= 0) {
        mockSchemas[existingIndex] = savedSchema;
      } else {
        mockSchemas.push(savedSchema);
      }

      return { data: savedSchema, status: 200 };
    }

    if (url.startsWith('/api/sql/schema/updateTables/')) {
      return { data, status: 200 };
    }

    if (url.startsWith('/api/model/import/')) {
      return { data: { success: true, imported: 1 }, status: 200 };
    }

    return { data, status: 200 };
  },

  put: async (url: string, data: any) => {
    console.log('Mock PUT:', url, data);
    return { data, status: 200 };
  },

  delete: async (url: string) => {
    console.log('Mock DELETE:', url);

    if (url.startsWith('/api/sql/schema/')) {
      const schemaId = url.split('/').pop();
      const index = mockSchemas.findIndex(s => s.id === schemaId);
      if (index >= 0) {
        mockSchemas.splice(index, 1);
      }
    }

    return { data: null, status: 200 };
  },
};

export default axios;

